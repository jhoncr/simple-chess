"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameWatcher } from "@/lib/db_handler";
import { httpsCallable, getFunctions } from "firebase/functions";
import { useAuth } from "@/lib/auth_handler";
import { ShareCard } from "./components/ShareCard";
// Shadcn imports (adjust paths/names as needed)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Board } from "./components/Board";
import { OctagonX } from "lucide-react";
import { GameDoc } from "@/lib/custom_types";

const initGame = httpsCallable(getFunctions(), "initGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});
const quitGame = httpsCallable(getFunctions(), "quitGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

function QuitModal({
  isActive,
  handleModalClick,
  gameId,
}: {
  isActive: string;
  handleModalClick: () => void;
  gameId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const quitMyGame = async () => {
    try {
      setLoading(true);
      await quitGame({ gameId });
      router.push("/u");
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isActive === "is-active"} onOpenChange={handleModalClick}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>Quitting can’t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={quitMyGame}
            disabled={loading}
          >
            Quit
          </Button>
          <Button onClick={handleModalClick}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
interface GameBodyProps {
  loading: boolean;
  //eslint-disable-next-line
  game: GameDoc | null;
  handleModalClick: () => void;
  id: string;
  //eslint-disable-next-line
  authUser: any;
}

function GameBody({
  loading,
  game,
  handleModalClick,
  id,
  authUser,
}: GameBodyProps) {
  const [checkMessage, setCheckMessage] = useState("");
  const sharebleLink =
    typeof window !== "undefined" ? window.location.href : "";

  const GameOverMessage = () => {
    if (!game) return "Game not found";
    if (game.status === "quit") {
      const quitter = Object.entries(game.players).find(
        ([, player]) => player.pstatus === "quit"
      );
      return `${quitter?.[1].name} has quit the game`;
    }
    if (game.status === "finished") return "GAME OVER";

    return ":/";
  };

  if (loading) return <div className="animate-spin">Loading...</div>;
  if (!game)
    return (
      <div>Game not found or you are not authorized to view this game</div>
    );
  if (game.status === "waiting" && !game.players[authUser.uid])
    return <div>Waiting for the game to start</div>;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
      <div className="p-4 w-full lg:w-3/4 max-w-[80vh]">
        <Board
          id={id}
          fen={game.gameState}
          piece={game.players[authUser.uid].piece}
          players={{
            me: authUser.displayName,
            opponent:
              game.players[
                Object.keys(game.players).find(
                  (uid) => uid !== authUser.uid
                ) || ""
              ]?.name ?? "Waiting for opponent",
          }}
          gstatus={game.status}
          setCheckMessage={setCheckMessage}
        />
      </div>
      <div
        className="flex flex-col space-y-4 w-full lg:w-1/4 px-8"
        id="game-footer"
      >
        <div className="p-1 flex flex-col items-center border-b">
          {(game.status === "finished" || game.status === "quit") && (
            <GameOverMessage />
          )}
          <h3>{checkMessage}</h3>
        </div>
        {
          // display check info
        }
        {(game.status === "finished" || game.status === "quit") && (
          <Button className="w-full" asChild>
            <Link href="/u"> New Game </Link>
          </Button>
        )}

        {game.status === "active" && (
          <Button variant="outline" onClick={handleModalClick}>
            <OctagonX size={36} />
            Quit
          </Button>
        )}

        {game.status === "waiting" && (
          <ShareCard sharebleLink={sharebleLink} />
        )}
      </div>
    </div>
  );
}

export default function GameApp() {
  const [modalState, setModalState] = useState("");
  const params = useSearchParams();
  const { authUser } = useAuth();
  const { game, loading } = useGameWatcher(`games/${params.get("id")}`);
  const id = params.get("id") || "";

  const handleModalClick = () => {
    setModalState(modalState === "" ? "is-active" : "");
  };

  useEffect(() => {
    if (game && game.status === "waiting") {
      if (authUser && authUser.uid in game.players) return;
      initGame({ gameId: id }).catch((e) => console.error(e));
    }
  }, [game, authUser?.uid, id]);

  return (
    <>
      <GameBody
        loading={loading}
        game={game}
        handleModalClick={handleModalClick}
        id={id}
        authUser={authUser}
      />
      <QuitModal
        isActive={modalState}
        handleModalClick={handleModalClick}
        gameId={id}
      />
    </>
  );
}

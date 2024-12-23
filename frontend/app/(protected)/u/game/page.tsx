"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameWatcher } from "@/lib/db_handler";
import { httpsCallable, getFunctions } from "firebase/functions";
import { useAuth } from "@/lib/auth_handler";
import { ShareCart } from "./components/ShareCard";
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
import { Board } from "./components/Board";

const initGame = httpsCallable(getFunctions(), "initGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});
const quitGame = httpsCallable(getFunctions(), "quitGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

function QuitModal({ isActive, handleModalClick, gameId }) {
  const router = useRouter();

  const quitMyGame = async () => {
    try {
      await quitGame({ gameId });
      router.push("/");
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
          <Button variant="destructive" onClick={quitMyGame}>
            Quit
          </Button>
          <Button onClick={handleModalClick}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GameBody({ loading, game, handleModalClick, id, authUser }) {
  const router = useRouter();
  const sharebleLink =
    typeof window !== "undefined" ? window.location.href : "";

  const GameOverMessage = () => {
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
                Object.keys(game.players).find((uid) => uid !== authUser.uid)
              ]?.name ?? "Waiting for opponent",
          }}
          gstatus={game.status}
        />
      </div>
      <div className="flex flex-col space-y-4 w-full lg:w-1/4" id="game-footer">
        {(game.status === "finished" || game.status === "quit") && (
          <>
            <h2 className="text-center">{<GameOverMessage />}</h2>
            <Button className="w-full" onClick={() => router.push("/")}>
              NEW GAME
            </Button>
          </>
        )}

        {game.status === "active" && (
          <Button variant="outline" onClick={handleModalClick}>
            Quit
          </Button>
        )}

        {game.status === "waiting" && <ShareCart sharebleLink={sharebleLink} />}
      </div>
    </div>
  );
}

export default function GameApp() {
  const [modalState, setModalState] = useState("");
  const params = useSearchParams();
  const { authUser } = useAuth();
  const { game, loading } = useGameWatcher(`games/${params.get("id")}`);
  const id = params.get("id");

  const handleModalClick = () => {
    setModalState(modalState === "" ? "is-active" : "");
  };

  useEffect(() => {
    if (game && game.status === "waiting") {
      if (authUser.uid in game.players) return;
      initGame({ gameId: id }).catch((e) => console.error(e));
    }
  }, [game, authUser.uid, id]);

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

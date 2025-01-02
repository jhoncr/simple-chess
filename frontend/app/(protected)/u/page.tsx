"use client";
import React, { useState, useEffect } from "react";
import { getGames } from "@/lib/db_handler";
import { useAuth } from "@/lib/auth_handler";
import { useRouter } from "next/navigation";
import { httpsCallable, getFunctions } from "firebase/functions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SquarePlus } from "lucide-react";
import { Player } from "@/lib/custom_types";
import { DocumentData } from "firebase/firestore";

const initGame = httpsCallable(getFunctions(), "initGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

const getPushLink = (gameId: string) => `/u/game?id=${gameId}`;

export interface GameLinkProps {
  opponent: Player;
  gameId: string;
}

function GameLink({ opponent, gameId }: GameLinkProps) {
  const PieceBorders = ({ piece }: { piece: string }) => {
    // return a white div of 4px width if piece is white
    // return a gray div of 4px width if piece is black
    // else return a transparent div of 4px width
    // the div have the same height as the parent
    // hide overflow
    switch (piece) {
      case "w":
        return <div className="w-full h-full bg-white text-white">|</div>;
      case "b":
        return (
          <div className="w-full h-full bg-gray-700 text-gray-700">|</div>
        );
      default:
        return <div className=""></div>;
    }
  };

  return (
    <a
      href={getPushLink(gameId)}
      className="block w-full border rounded-md overflow-hidden"
      key={gameId}
    >
      <div className="grid grid-cols-7 items-center text-center h-full">
        <PieceBorders piece={opponent.piece == "w" ? "b" : "w"} />
        {/* <div className="flex items-center justify-center col-span-4 h-full"> */}
        {/* <p className="p-2 overflow-hidden">{players_arr[0][1].name}</p> */}
        {/* </div> */}
        <div className="col-span-1 text-gray-700">vs</div>
        <div className="flex items-center justify-center col-span-3 h-full">
          <p className="p-2 overflow-hidden">{opponent?.name ?? "????"}</p>
        </div>
        <div className="col-span-1 text-gray-700">
          <></>
        </div>
        <PieceBorders piece={opponent.piece} />
      </div>
    </a>
  );
}

function ListOfGames({ uid }: { uid: string }) {
  const [gameList, setGameList] = useState<GameLinkProps[]>([]);

  useEffect(() => {
    async function getGamesFromDB() {
      const games = (await getGames(uid)) as [string, DocumentData][];

      setGameList(
        games.map((x) => ({
          gameId: x[0],
          opponent: Object.keys(x[1].players).reduce(
            (acc, key) => {
              return key !== uid ? x[1].players[key] : acc;
            },
            {
              name: "???",
              piece: x[1].players[uid].piece === "w" ? "b" : "w",
              pstatus: "active",
            } as Player
          ),
        }))
      );
    }
    getGamesFromDB();
  }, [uid]);

  return (
    <div className="space-y-2">
      {gameList.map((x, idx) => (
        <GameLink key={`gl-${idx}`} opponent={x.opponent} gameId={x.gameId} />
      ))}
    </div>
  );
}

export default function Home() {
  const [startPiece, setStartPiece] = useState("r");
  const { authUser: currentUser } = useAuth();
  const [loadingGame, setLoadingGame] = useState(false);
  const router = useRouter();

  function handleStartPieceChange(value: string) {
    setStartPiece(value);
  }

  async function startOnlineGame() {
    setLoadingGame(true);
    const newGameId = await initGame({ startPiece });
    if (newGameId.data) {
      router.push(`/u/game?id=${newGameId.data}`);
    }
    setLoadingGame(false);
  }

  return (
    <div className="flex flex-col space-y-6 p-4 md:max-w-2xl md:mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ongoing Games</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser && <ListOfGames uid={currentUser.uid} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Select the piece you want to start:</p>
          <RadioGroup
            defaultValue="r"
            onValueChange={(val) => handleStartPieceChange(val)}
            className="flex flex-col space-y-2 pl-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="b" id="black" />
              <Label htmlFor="black">Black</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="w" id="white" />
              <Label htmlFor="white">White</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="r" id="random" />
              <Label htmlFor="random">Random</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button
            onClick={startOnlineGame}
            className="w-full"
            disabled={loadingGame}
          >
            {(loadingGame && (
              <span className="ml-2 animate-spin">⌛</span>
            )) || <SquarePlus />}
            Create Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

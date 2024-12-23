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
import { GameLinkProps, Players } from "./game/components/GameTypes";

const initGame = httpsCallable(getFunctions(), "initGame", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

interface ListOfGamesProps {
  uuid: string;
}

const getPushLink = (gameId: string) => `/u/game?id=${gameId}`;

function GameLink({ players, gameId }: GameLinkProps) {
  const pls = Object.entries(players);
  pls.push([null, { piece: pls[0][1].piece === "w" ? "b" : "w", name: "?" }]);

  return (
    <a
      href={getPushLink(gameId)}
      className="block w-full p-3 rounded-md border hover:bg-gray-50 focus:outline-none"
    >
      {pls.slice(0, 2).map((p, idx) => (
        <React.Fragment key={`${gameId}-${idx}`}>
          <span className={`text-${p[1].piece === "w" ? "blue" : "red"}-600`}>
            {p[1].name}
          </span>
          {idx < 1 && <span className="mx-2">vs</span>}
        </React.Fragment>
      ))}
    </a>
  );
}

function ListOfGames({ uuid }: ListOfGamesProps) {
  const [gameList, setGameList] = useState<[string, { players: Players }][]>(
    []
  );

  useEffect(() => {
    async function getGamesFromDB() {
      const games = await getGames(uuid);
      setGameList(games);
    }
    getGamesFromDB();
  }, [uuid]);

  return (
    <div className="space-y-2">
      {gameList.map((x, idx) => (
        <GameLink key={`gl-${idx}`} players={x[1].players} gameId={x[0]} />
      ))}
    </div>
  );
}

export default function Home() {
  const [startPiece, setStartPiece] = useState("r");
  const { authUser: currentUser } = useAuth();
  const router = useRouter();

  function handleStartPieceChange(value: string) {
    setStartPiece(value);
  }

  async function startOnlineGame() {
    const newGameId = await initGame({ startPiece });
    if (newGameId.data) {
      router.push(`/u/game?id=${newGameId.data}`);
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Ongoing Games</CardTitle>
        </CardHeader>
        <CardContent>
          <ListOfGames uuid={currentUser.uid} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Please select the piece you want to start:</p>
          <RadioGroup
            defaultValue="r"
            onValueChange={(val) => handleStartPieceChange(val)}
            className="flex flex-col space-y-2"
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
          <Button onClick={startOnlineGame}>Create</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

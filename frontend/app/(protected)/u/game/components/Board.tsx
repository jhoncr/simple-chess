"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { httpsCallable, getFunctions } from "firebase/functions";
import { Players } from "./GameTypes";
import { Badge } from "@/components/ui/badge";

const makeMove = httpsCallable(getFunctions(), "makeMove", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

interface BoardProps {
  fen: string;
  piece: "w" | "b";
  players: Players;
  gstatus: string;
  id: string;
  setCheckMessage: (status: string) => void;
}

interface Move {
  from: string;
  to: string;
}

export function Board({
  fen,
  piece,
  players,
  gstatus,
  id,
  setCheckMessage,
}: BoardProps) {
  let chessboardRef = useRef();
  const [moveFrom, setMoveFrom] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  // const [status, setStatus] = useState();
  const [game, setGameDb] = useState();

  useEffect(() => {
    if (fen) {
      console.log("fen", fen);
      setGameDb((prev) => {
        if (prev) {
          prev.load(fen);
          updateInfo(prev);
          return prev;
        }
        return new Chess(fen);
      });
    }
  }, [fen]);

  function updateInfo(gameView: Chess) {
    console.log("updation info");

    const nextPlayer = gameView.turn() === "b" ? "black" : "white";
    const currentPlayer = gameView.turn() === "b" ? "white" : "black";

    console.log({ nextPlayer });
    let msg = "";
    if (gameView.isCheckmate() === true) {
      msg = `CHECKMATE! Player ${currentPlayer} wins!`;
    } else if (gameView.isDraw() === true) {
      msg = "DRAW!";
    } else {
      msg = gameView.inCheck() === true ? "CHECK!" : "";
      msg += ` ${nextPlayer}'s turn.`;
    }
    setCheckMessage(msg);
  }

  function getMoveOptions(square: string) {
    if (!game) return;

    const moves: Move[] = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      return;
    }

    const newSquares: Record<
      string,
      { background: string; borderRadius?: string }
    > = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick(square: string) {
    if (gstatus !== "active" || piece !== game.turn() || !game) return;

    console.log({ piece, turn: game.turn() });
    setRightClickedSquares({});

    function resetFirstMove(square: string) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // if moveFrom is empty (first touch), set moveFrom and getMoveOptions
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    // const gameCopy = new Chess(game.fen());
    try {
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: "q", // always promote to a queen for example simplicity
      });

      // valid move, call callable function makeMove
      console.log("moving", { moveFrom, square });
      makeMove({
        from: moveFrom,
        to: square,
        promotion: "q",
        gameId: id,
      })
        .then((result) => {
          console.log(result.data);
          setMoveFrom("");
          setOptionSquares({});
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      resetFirstMove(square);
      return;
    }
  }

  function onSquareRightClick(square: string) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  const NameTag = ({ isMe }: { isMe: boolean }) => {
    const turn = game?.turn();
    console.log("name tag", { isMe, piece, turn });
    return (
      players &&
      players.opponent && (
        <div className="flex items-center space-x-2 my-2">
          <h2 className="text-lg font-semibold">
            {isMe ? players.me : players.opponent}
          </h2>
          {((isMe && piece === turn) || (!isMe && piece !== turn)) && (
            <Badge variant="secondary">Turn</Badge>
          )}
        </div>
      )
    );
  };

  return (
    game && (
      <div>
        <NameTag isMe={false} />
        <Chessboard
          id="simple_board"
          boardOrientation={piece === "w" ? "white" : "black"}
          animationDuration={400}
          arePiecesDraggable={false}
          //   boardWidth={chessboardSize}
          position={game?.fen() || ""}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 0px 0px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...optionSquares,
            ...rightClickedSquares,
            "font-size": "40px",
          }}
          ref={chessboardRef}
        />
        <NameTag isMe={true} />
      </div>
    )
  );
}

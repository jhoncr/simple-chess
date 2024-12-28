"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { httpsCallable, getFunctions } from "firebase/functions";
import { Badge } from "@/components/ui/badge";

const makeMove = httpsCallable(getFunctions(), "makeMove", {
  timeout: 60 * 1000,
  limitedUseAppCheckTokens: true,
});

interface BoardProps {
  fen: string;
  piece: "w" | "b";
  players: { me: string; opponent: string };
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
  const chessboardRef = useRef(null);
  const [moveFrom, setMoveFrom] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState<
    Record<string, { backgroundColor: string } | undefined>
  >({});
  const [optionSquares, setOptionSquares] = useState({});
  // const [status, setStatus] = useState();
  const [game, setGameDb] = useState<Chess | null>(null);

  useEffect(() => {
    if (fen) {
      console.log("fen", fen);
      setGameDb((prev) => {
        if (prev !== null && prev.fen() !== fen) {
          prev.load(fen);
          updateInfo(prev);
          return prev;
        }
        const g = new Chess(fen);
        updateInfo(g);
        return g;
      });
    }
  }, [fen]);

  function updateInfo(gameView: Chess) {
    console.log("update info");

    const turn = gameView.turn();
    const nextPlayer = turn === "b" ? "black" : "white";
    const currentPlayer = turn === "b" ? "white" : "black";

    console.log({ nextPlayer });
    let msg = "";
    if (gameView.isCheckmate() === true) {
      msg = `CHECKMATE! ${currentPlayer} wins 🏆`;
    } else if (gameView.isDraw() === true) {
      msg = "DRAW!";
    } else {
      msg = gameView.inCheck() === true ? "CHECK!" : "";
      msg += ` ${nextPlayer}'s turn.`;
    }
    setCheckMessage(msg);
  }

  function getMoveOptions(square: Square) {
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
          game.get(move.to as Square) &&
          game.get(move.to as Square).color !== game.get(square).color
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
    if (gstatus !== "active" || !game || piece !== game.turn()) return;

    console.log({ piece, turn: game.turn() });
    setRightClickedSquares({});

    function resetFirstMove(square: string) {
      setMoveFrom(square);
      getMoveOptions(square as Square);
    }

    // if moveFrom is empty (first touch), set moveFrom and getMoveOptions
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    // const gameCopy = new Chess(game.fen());
    try {
      game.move({
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
          // setGameDb(game);
          setMoveFrom("");
          setOptionSquares({});
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.warn("invalid move", error);
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

  const NameTag = ({ piece }: { piece: "w" | "b" }) => {
    // this shows "Turn" Badge if the piece is the current turn
    // otherwise it shows nothing
    // it shows "Winner" Badge if the piece is the winner
    // otherwise it shows nothing

    if (!game) return null;

    const turn = game.turn();
    const isCheckmate = game.isCheckmate();

    const isTurn = piece === turn && !isCheckmate;
    const isWinner = isCheckmate && piece !== turn;

    return (
      <div className="flex justify-left items-center gap-2 my-2">
        <div className="text-lg font-bold">
          {piece === "w" ? players.me : players.opponent}
        </div>
        {isTurn && <Badge color="green">Turn</Badge>}
        {isWinner && <Badge color="red">Winner 🏆</Badge>}
      </div>
    );
  };

  return (
    game && (
      <div>
        <NameTag piece={piece === "w" ? "b" : "w"} />
        <Chessboard
          id="simple_board"
          boardOrientation={piece === "w" ? "white" : "black"}
          animationDuration={400}
          arePiecesDraggable={false}
          //   boardWidth={chessboardSize}
          position={fen || ""}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 0px 0px rgba(0, 0, 0, 0.5)",
          }}
          customSquareStyles={{
            ...optionSquares,
            ...rightClickedSquares,
          }}
          ref={chessboardRef}
        />
        <NameTag piece={piece} />
      </div>
    )
  );
}

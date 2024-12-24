import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as z from "zod";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { Chess } from "chess.js";

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// the schema consits either: gameId or startPiece.
// startId is used to start a new game,
// gameId is used to join an existing game.
const StartGameRequest = z
  .object({
    gameId: z.string().optional(),
    startPiece: z.string().optional(),
  })
  .strict();

const gameSchema = z.object({
  // id: z.string(),
  gameState: z.string(),
  status: z.string(),
  createdAt: z.any(),
  finishedAt: z.any().optional(),
  players: z.record(
    z.object({
      pstatus: z.string(),
      piece: z.string(),
      name: z.string(),
    })
  ),
});

export const initGame = onCall(
  { cors: "*", enforceAppCheck: true },
  async (request) => {
    // check if authenticated
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be authenticated");
    }

    const data = StartGameRequest.parse(request.data);

    if (!data.gameId && !data.startPiece) {
      logger.error("Either gameId or startPiece must be provided");
      logger.info(data);
      throw new HttpsError(
        "invalid-argument",
        "Either gameId or startPiece must be provided"
      );
    }

    let gameData: z.infer<typeof gameSchema>;

    if (data.gameId) {
      const gameRef = db.collection("games").doc(data.gameId);
      const gameDoc = await gameRef.get();

      if (!gameDoc.exists) {
        throw new HttpsError("not-found", "Game not found");
      }

      // if game state is waiting, then add the player to the game
      const gameData = gameDoc.data();
      if (gameData?.status === "waiting") {
        // return the gameId if the player is already in the game
        if (request.auth.uid in gameData.players) {
          logger.info("Player already in the game");
        } else {
          await gameRef.update({
            [`players.${request.auth.uid}`]: {
              pstatus: "active",
              piece:
                gameData.players[Object.keys(gameData.players)[0]].piece ===
                "w" ?
                  "b" :
                  "w",
              name: request.auth.token.name,
            },
            status: "active",
          });
        }
        return data.gameId;
      } else {
        throw new HttpsError("failed-precondition", "Game is not waiting");
      }
    } else {
      const chess = new Chess();
      const fen = chess.fen();
      const gameId = db.collection("games").doc().id;

      // if startPiece is 'r', assign a random piece
      let piece = data.startPiece || "w";
      if (data.startPiece === "r") {
        const pieces = ["w", "b"];
        piece = pieces[Math.floor(Math.random() * pieces.length)];
      }

      gameData = {
        // id: gameId, this is redundant as the id is already the document id
        gameState: fen,
        status: "waiting",
        createdAt: FieldValue.serverTimestamp(),
        players: {
          [request.auth.uid]: {
            pstatus: "active",
            piece: piece,
            name: request.auth.token.name,
          },
        },
      };

      await db.collection("games").doc(gameId).set(gameData);
      return gameId;
    }
  }
);

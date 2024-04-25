import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as z from "zod";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp, getApps} from "firebase-admin/app";
import { Chess } from "chess.js";

if ( getApps().length === 0 ) {
  initializeApp();
}

const db = getFirestore();

const moveSchema = z.object({
    gameId: z.string(),
    from: z.string(),
    to: z.string(),
    // can be queen, rook, bishop, knight, or empty string for promotion: z.string().optional().
    promotion: z.string().optional(),
}).strict();

/* example game schema:
{
    id: "gameId",
    gameState: "fen string",
    status: "active" | "finished" | "quit" | "waiting",
    createdAt: firestore.Timestamp,
    finishedAt: firestore.Timestamp | null,
    players: {
        [uid]: {
            pstatus: "active" | "quit" | "finished",
            piece: "w" | "b",
            name: string,
        }
    }
}
*/

export const makeMove = onCall({ cors: [], enforceAppCheck: true}, async (request) => {

    // check if authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be authenticated");
    }

    const parsed = moveSchema.safeParse(request.data);

    if (!parsed.success) {
        logger.error("Invalid data");
        logger.info(parsed.error);
        throw new HttpsError("invalid-argument", "Invalid data");
    }

    
    const gameRef = db.collection("games").doc( parsed.data.gameId );
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
        throw new HttpsError("not-found", "Game not found");
    }

    const gameData = gameDoc.data();
    if (!gameData) {
        throw new HttpsError("internal", "Game data is missing");
    }

    const uid = request.auth.uid;
    const playerData = gameData.players[uid];
    if (!playerData) {
        throw new HttpsError("permission-denied", "You are not a player in this game");
    }

    if (gameData.status !== "active") {
        throw new HttpsError("failed-precondition", "Game is not active");
    }



    logger.info(`Player ${uid} is making a move in game ${parsed.data.gameId}. Move: ${parsed.data.from} to ${parsed.data.to}`)
    let game = new Chess(gameData.gameState);
    const move = game.move({
        from: parsed.data.from,
        to: parsed.data.to,
        promotion: parsed.data.promotion,
    });

    if (!move) {
        logger.error("Invalid move");
        throw new HttpsError("failed-precondition", "Invalid move");
    }
    
    const newGameState = game.fen();

    // check if game is over
    let status = "active";
    if (game.isCheckmate()) {
        status = "finished";
    } else if (game.isDraw()) {
        status = "draw";
    }

    
    await gameRef.update({
        gameState: newGameState,
        status: status,
        finishedAt: status === "finished" || status === "draw" 
            ? FieldValue.serverTimestamp() 
            : null,
    });



    return { gameState: newGameState };

}
);
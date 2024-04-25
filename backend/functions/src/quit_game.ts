import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as z from "zod";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {initializeApp, getApps} from "firebase-admin/app";

if ( getApps().length === 0 ) {
  initializeApp();
}

const db = getFirestore();

const QuitGameRequest = z.object({
    gameId: z.string(),
}).strict();

/* example game schema:
{
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

export const quitGame = onCall({ cors: [], enforceAppCheck: true}, async (request) => {

    // check if authenticated
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be authenticated");
    }

    const parsed = QuitGameRequest.safeParse(request.data);

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

    if (gameData.status !== "active") {
        throw new HttpsError("failed-precondition", "Game is not active");
    }

    const uid = request.auth.uid;
    const playerData = gameData.players[uid];
    if (!playerData) {
        throw new HttpsError("permission-denied", "You are not a player in this game");
    }

    if (playerData.pstatus == "quit") {
        throw new HttpsError("failed-precondition", "You have already quit this game");
    }

    await gameRef.update({
        [`players.${uid}.pstatus`]: "quit",
        status: "quit",
        finishedAt: FieldValue.serverTimestamp(),
    })

    logger.info(`Player ${uid} quit game ${parsed.data.gameId}`);

    return { success: true };
}
);

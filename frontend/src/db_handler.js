import { useState, useEffect, createContext, useContext } from "react";
import {
  getFirestore,
  connectFirestoreEmulator,
  getDoc,getDocs,
  collection, doc,
  query,
  where,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { app } from "./auth_handler";

// create a hook that watches a colection col_name
export const db = getFirestore(app);

if (process.env.NODE_ENV === "development") {
  console.log("testing locally -- connecting to firestore emulator");
  connectFirestoreEmulator(db, "localhost", 8080);
}

// function to get a single document with id docRef (e.g.: db.doc('games/123')
export async function getDocRef(docRef) {
  const docSnap = await getDoc(docRef);
  return docSnap.data();
}


// funcion to get games an uid is a player
export async function getGames(uid) {
  const gamesRef = collection(db, "games");
  const querySnap = await getDocs(
    query(
      gamesRef,
      where(`players.${uid}.pstatus`, "==", "active"),
      where("status", "in", ["waiting", "active"])
    )
  );

  if (querySnap.empty) {
    console.log(`No matching documents for user id ${uid}`);
    return [];
  }
  return querySnap.docs.map((doc) => [doc.id, doc.data()]);
}

// hook to watch a game
export function useGameWatcher(gameRef) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    console.log("watching game", gameRef);


    const unsubscribe = onSnapshot(doc(db, gameRef), (doc) => {
      // add the id to the game object
      
      setGame({ ...doc.data(), id: doc.id });
      setLoading(false);
      console.log("game updated", doc.data());
    }, (error) => {
      if (error.code === "permission-denied") {
        console.log("Permission denied. You don't have access to this game.");
      } else {
        console.log("An error occurred:", error);
      }
      setGame(null);
      setLoading(false);
    });

    return unsubscribe;

  }, [gameRef]);

  return { game, loading };
}

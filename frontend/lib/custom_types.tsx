import { Timestamp, DocumentData } from "firebase/firestore";
// import the type User from

export interface User {
  uid: string;
  displayName?: string | null;
  email: string | null;
  photoURL?: string | null;
  role?: string;
}

export interface AccessMap {
  [uid: string]: User;
}

export interface Item {
  id: string;
  title: string;
  item_type: string;
  access: AccessMap;
  pending_access: {
    [email: string]: string;
  };
}

export interface Player {
  piece: "w" | "b";
  name: string;
  pstatus: "active" | "quit" | "finished";
}
export interface Players {
  [key: string]: Player;
}
// // create an entry type that is used when reading from the database, it has the createdBy field and createdAt field
// export interface DBentry {
//   createdBy: string;
//   createdAt: Timestamp;
//   date: Timestamp;
//   id: string;
//   // optional fields
//   // eslint-disable-next-line
//   [key: string]: any;
// }

// export interface DBentryMap {
//   [id: string]: DBentry;
// }

// game datatype
export interface GameDoc extends DocumentData {
  id: string;
  gameState: "fen string";
  status: "active" | "finished" | "quit" | "waiting";
  createdAt: Timestamp;
  finishedAt: Timestamp | null;
  players: {
    [uid: string]: Player;
  };
}

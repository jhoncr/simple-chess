"use client";
interface Player {
  piece: "w" | "b";
  name: string;
}
export interface Players {
  [key: string]: Player;
}
export interface GameLinkProps {
  players: Players;
  gameId: string;
}
// interface GameData {
//   [key: string]: {
//     players: Players;
//   };
// }

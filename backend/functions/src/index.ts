import {initializeApp, getApps} from "firebase-admin/app";
import {initGame} from "./init_game";
import {makeMove} from "./make_move";
import {quitGame} from "./quit_game";

if ( getApps().length === 0 ) {
  initializeApp();
}

export {initGame, makeMove, quitGame};

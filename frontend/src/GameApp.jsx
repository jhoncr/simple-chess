import React, { useEffect, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { getDocRef, useGameWatcher } from "./db_handler";
// import { mark_seen } from "./notificationHandler";
import { useAuth } from "./auth_handler";
import { httpsCallable, getFunctions } from "firebase/functions";
import Dialog from "./components/Dialog";


const initGame = httpsCallable(getFunctions(), 'initGame', 
    { timeout: 60 * 1000,
      limitedUseAppCheckTokens: true
    }
)

const quitGame = httpsCallable(getFunctions(), 'quitGame',
    { timeout: 60 * 1000,
      limitedUseAppCheckTokens: true
    }
)

/* example game schema:
{
    id: "string",
    gameState: "fen string",
    status: "active" | "finished" | "quit" | "waiting",
    createdAt: firestore.Timestamp,
    finishedAt: firestore.Timestamp | null,
    players: {
        [uid]: {
            pstatus: "active" | "quit" | "finished",
            peace: "white" | "black",
            name: string,
        }
    }
}
*/


const QuitModal = function ({ isActive, handleModalClick, gameId }) {
  const navigate = useNavigate();

  const quitMyGame = async function () {
    try {
      await quitGame( { gameId: gameId })
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className={`modal ${isActive}`} id="quit-game-modal">
      <div className="modal-background"></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Are you sure?</p>
          {/* <span role="img">🐔🐔🐔</span> */}
          <button
            className="delete"
            aria-label="close"
            onClick={handleModalClick}
          ></button>
        </header>
        <section className="modal-card-body">Quitting can't undone.</section>
        <footer className="modal-card-foot">
          <button className="button is-success" onClick={quitMyGame}>
            Quit
          </button>
          <button className="button" onClick={handleModalClick}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};



function GameApp() {
  // const [board, setBoard] = useState([])
  // const [isGameOver, setIsGameOver] = useState();
  // const [result, setResult] = useState();
  // const [position, setPosition] = useState();
  // const [initResult, setInitResult] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState("");
  const { id } = useParams();
  const { authUser } = useAuth();
  const { game, loading } = useGameWatcher(`games/${id}`);

  const navigate = useNavigate();
  const sharebleLink = window.location.href;

  const handleModalClick = function () {
    setModalState(modalState === "" ? "is-active" : "");
  };

  useEffect(() => {
    if (game && game.status === "waiting") {
      console.log("initiating game if not already on the game");
      if ( authUser.uid in game.players) {
        console.log('already in the game');
      }
      initGame({ gameId: id }).then((result) => {
        console.log('initGame', result.data);
      }
      ).catch((error) => {
        console.error(error);
      });
    }
    }, [game, id, authUser.uid]);

 

  const GameOverMessage = function () {
    if (game.status === "quit") {
      // get game.player[uid] that has pstatus = quit
     /* players:{
        [uid]: { pstatus: "active" | "quit" | "finished", piece: "white" | "black", name: string }
     }
     */
      const quitter = Object.entries(game.players).find(
        ([uid, player]) => player.pstatus === "quit"
      );

      return `${quitter[1].name} has quit the game`;
    }

    if (game.status === "finished") {
      return "GAME OVER";
    }
    return ":/";
  };

  const GameBody = function () {
    if (loading) {
      return "Loading ...";
    }
    if (!game) {
      return "Game not found or you are not authorized to view this game";
    }

    if (game.status === "waiting" && !game.players[authUser.uid]) {
      return "Waiting for the game to start";
    }


    return (
      <div className="column">
        <div className="app-container">
          <div
            className="board-container"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Board
              id={id}
              fen={game.gameState}
              piece={game.players[authUser.uid].piece}
              players={{
                me: authUser.displayName,
                // the oponent had a differen uid than the current user
                opponent: game.players[ Object.keys(game.players).find(uid => uid !== authUser.uid) ]?.name ?? "Waiting for opponent",
              }}
              gstatus={game.status}
            />
          </div>

          { game.status === "finished" || game.status === "quit" 
          ? (
            <>
              <h2 className="endgame-text">
                <GameOverMessage />
              </h2>
              <button
                className='button is-medium is-fullwidth"'
                onClick={async () => navigate("/")}
              >
                NEW GAME
              </button>
            </>
          ) 
          : (
            game.status === "active" && (
              <button className="button" onClick={handleModalClick}>
                Quit
              </button>
            )
          )}
        </div>
        {
          // if game is waiting, show the dialog
        game.status === "waiting" && <Dialog sharebleLink={sharebleLink} />
        }
      </div>
    );
  };
  return (
    <>
      <GameBody />
      <QuitModal 
      isActive={modalState} 
      handleModalClick={handleModalClick} 
      gameId={id}
      />
    </>
  );
}

export default GameApp;

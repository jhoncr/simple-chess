import React, { useRef, useEffect, useState} from 'react'
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { httpsCallable, getFunctions } from "firebase/functions";

const makeMove = httpsCallable(getFunctions(), 'makeMove', 
    { timeout: 60 * 1000,
      limitedUseAppCheckTokens: true
    }
)


export default function Board({ fen, piece, players, gstatus, id }) {
    let chessboardRef = useRef()
    const [chessboardSize, setChessboardSize] = useState(100);
    const [moveFrom, setMoveFrom] = useState('');
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [status, setStatus] = useState()
    const [game, setGameDb] = useState()

    useEffect(() => {
        if (fen) {
            console.log("fen",fen)
            const myGame = new Chess(fen)
            console.log("myGame",myGame)
            setGameDb(new Chess(fen))
        }
    }, [fen])

    useEffect(() => {
        console.log("players",players)
        function handleResize() {
            const display = document.getElementsByClassName('board-container')[0];
            setChessboardSize(display.offsetWidth - 20);
        }
        function updateInfo(){
            console.log("updation info")
            if (!game) {
                console.log("no game")
                setStatus("")
                return
            }
            const nextPlayer = game.turn() === 'b' ? 'black' : 'white';
            const currentPlayer = game.turn() === 'b' ? 'white' : 'black';
            
            console.log({nextPlayer})
            let msg = ""
            if (game.in_checkmate() === true) {
                msg = `CHECKMATE! Player ${currentPlayer} wins!`;
            } else if (game.in_draw() === true) {
                msg = 'DRAW!';
            } else {
                msg = game.in_check() === true ? 'CHECK!' : ''
                msg += ` ${nextPlayer}'s turn.`;
            }
            setStatus(msg);      

        }

        window.addEventListener('resize', handleResize);
        handleResize();
        updateInfo()
        return () => window.removeEventListener('resize', handleResize);
    }, [game])
 
    function getMoveOptions(square) {
        const moves = game.moves({
            square,
            verbose: true
        });
        if (moves.length === 0) {
            return;
        }

        const newSquares = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) && game.get(move.to).color !== game.get(square).color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%'
            };
            return move;
        });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };
        setOptionSquares(newSquares);
    }

    function onSquareClick(square) {    
        if (gstatus !== 'active') return 
        console.log({piece, turn:game.turn()})
        if (piece !== game.turn()) return
        setRightClickedSquares({});

        function resetFirstMove(square) {
            setMoveFrom(square);
            getMoveOptions(square);
        }

        // if moveFrom is empty (first touch), set moveFrom and getMoveOptions
        if (!moveFrom) {
            resetFirstMove(square);
            return;
        }

        // attempt to make move
        const gameCopy = { ...game };
        const move = gameCopy.move({
            from: moveFrom,
            to: square,
            promotion: 'q' // always promote to a queen for example simplicity
        });

        // if invalid, setMoveFrom and getMoveOptions
        if (move === null) {
            resetFirstMove(square);
            return;
        }

        // valid move, call callable function makeMove
        console.log('moving',{moveFrom, square})
        makeMove({
            from: moveFrom,
            to: square,
            promotion: 'q',
            gameId: id
        }).then((result) => {
            console.log(result.data);
            setMoveFrom('');
            setOptionSquares({});
        }).catch((error) => {
            console.error(error);
        });
    }

    function onSquareRightClick(square) {
        const colour = 'rgba(0, 0, 255, 0.4)';
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
                    ? undefined
                    : { backgroundColor: colour }
        });
    }

    return (
        game && <div>
            {players && players.opponent &&
                <div className="tags">
                    <span className="tag is-link">{players.opponent}</span>
                    {piece !== game.turn() && <span className="tag is-success is-light">Turn</span>}
                </div>
            }
            <Chessboard
                id="simple_board"                
                boardOrientation={piece === 'w' ? 'white' : 'black'}
                animationDuration={400}
                arePiecesDraggable={false}
                boardWidth={chessboardSize}
                position={game?.fen() || ''}
                onSquareClick={onSquareClick}
                onSquareRightClick={onSquareRightClick}
                customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 0px 0px rgba(0, 0, 0, 0.5)'
                }}
                customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares,
                    "font-size": "40px",

                }}
                ref={chessboardRef}
            />
            {players && players.me &&
                <div className="tags">
                    <span className="tag is-link">{players.me}</span>
                    {piece === game.turn() && <span className="tag is-success is-light">Turn</span>} 
                </div>
            }
            <p className='move-right'>{status}</p>  
        </div>
    )
}
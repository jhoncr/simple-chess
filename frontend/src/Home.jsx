import React, { useState, useEffect } from 'react'
import { getGames } from './db_handler'
import { useAuth } from './auth_handler'
import { useNavigate } from 'react-router-dom'
import { httpsCallable, getFunctions } from "firebase/functions";


const initGame = httpsCallable(getFunctions(), 'initGame', 
    { timeout: 60 * 1000,
      limitedUseAppCheckTokens: true
    }
)

const GameLink = function ({ players, gameId }) {
    let pls = Object.entries(players)
    pls.push([null,{piece:pls[0][1].piece === 'w'? 'b':'w',name:'?'}])
    console.log('players', Object.entries(pls))
    
    return (
        <a key={gameId} className='button is-light is-medium is-fullwidth has-shade' href={`/game/${gameId}`}>
                {
                    pls.splice(0,2).map((p, idx) => (
                        <>
                            <div key={`${gameId}-${idx}`} className={`is-${p[1].piece}`}>{p[1].name}</div>
                            {idx < 1 ? <span key={`${gameId}-${idx}-vs`} className="dot">vs</span> : ""}
                        </>
                    ))
                }
        </a>

    )
}

function ListOfGames({uuid}){
    const [gameList, setGameList] = useState([])
    
    useEffect( () => {        
        async function getGamesFromDB(){
            const games = await getGames(uuid)
            setGameList(games)
        }
        getGamesFromDB();

    },[uuid])

    return (
        <div className='gamelist'>
        { gameList.map( (x,idx) => <GameLink key={`gl-${idx}`} players={x[1].players} gameId={x[0]}/>) }
        </div>
    )


}

export default function Home() {
    const [startPiece,setStartPiece] = useState('r')
    const { authUser: currentUser } = useAuth()

    const navigate = useNavigate()
 
    function handleStartPieceChange(event) {
        console.log('piece selected',event.target.value);
        setStartPiece(event.target.value)
      }

    async function startOnlineGame() {
        console.log('start online game', startPiece)
        const newGameId = await initGame({startPiece})
        console.log('new game id', newGameId.data)
        if (newGameId.data) {
            navigate(`/game/${newGameId.data}`)
        }
    }

    return (
        <>
            <div className="columns home">
                <div className="column home-columns">
                    <div className='block'>
                        <div className='card'>
                            <div className='card-header'>
                                <div className='card-header-title'>
                                    Ongoing Games
                                </div>
                                <div className='card-header-icon'>
                                    <i className="material-icons">videogame_asset</i>
                                </div>
                            </div>
                            <div className='card-content'>
                                <ListOfGames uuid={currentUser.uid}/>
                            </div>
                        </div>
                    </div>
                    <div className='block'>
                        <div className="card">
                            <div className='card-header'>
                                <div className='card-header-title'>
                                    New Game
                                </div>
                                <div className='card-header-icon'>
                                    <i className="material-icons">add_link</i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="content">
                                    <h4>Please Select the piece you want to start</h4>
                                    <div onChange={event => handleStartPieceChange(event)}>
                                        <input type="radio" id="black" name="start_piece" value="b"/>
                                        <label for="black">Black</label><br/>
                                        <input type="radio" id="white" name="start_piece" value="w"/>
                                        <label for="white">White</label><br/>
                                        <input type="radio" id="random" name="start_piece" value="r" defaultChecked/>
                                        <label for="random">Random</label>
                                    </div>
                                </div>
                            </div>
                            <footer className="card-footer">
                                <span className="card-footer-item" onClick={() => startOnlineGame()}>
                                    Create
                                </span>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

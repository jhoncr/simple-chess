import React, { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom'
import Home from './Home'
import Login from './UserForm'
import GameApp from './GameApp'
import { useAuth, AuthUserProvider } from './auth_handler'


export default function App() {
    return (   
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route exact path="/" element ={
                        <RequireAuth>
                            <Home />
                        </RequireAuth>
                    }/>
                    
                    <Route path="/game/:id" element={
                        <RequireAuth>
                            <GameApp />
                        </RequireAuth>
                    }/>
                </Route>
                <Route path="/login" element={<Login />} />

            </Routes>
        </Router>
    )
}

function RequireAuth({ children }) {
    
    let { authUser, loading } = useAuth()
    let location = useLocation();
    
    if (loading) {
        return 'loading page...'
    }
    
    if (!authUser) {
      // Redirect them to the /login page, but save the current location they were
      // trying to go to when they were redirected. This allows us to send them
      // along to that page after they login, which is a nicer user experience
      // than dropping them off on the home page.
      return <Navigate to="/login" state={{ from: location }} replace/>;
    }


  
    return children;
  }

function Layout() {
    let navigate = useNavigate()
    let { signOut } = useAuth()
    

    async function handleSignOut(){
        console.log("Signing out, see you later")
        await signOut()
        navigate('/login')
      }
    
    return (
        <div>
            <div className="topnav">
                <a href='/' className='homepage-logo'>
                    <img src={`/logo192.png`} alt="homepage" />
                    <span style={{'padding':'0 0.5rem 0 0.5rem'}}>&#124;</span>
                    Simple Chess
                </a>

                <a href='#sign-out' className="split"
                    onClick={handleSignOut}>
                    Sign out
                </a>
            </div>
            <Outlet />
        </div>
    )
}
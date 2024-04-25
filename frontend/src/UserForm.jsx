import React from 'react'
import { useAuth } from './auth_handler'
import { useNavigate } from 'react-router-dom'



export default function Login() {
    const { authUser, loading, signInWithGoogle }  = useAuth()
    const navigate = useNavigate()

    const handleLogin = () => {
        console.log('login clicked')
        signInWithGoogle()
    }

      
      if ( !authUser ) { 
        return (
            <div className='my_container'>
              <img src={process.env.PUBLIC_URL+'logo512.png'} className="App-logo" alt="logo" />
              <p>
                Simple and fun games. Please log in to continue.
              </p>
              <button onClick={handleLogin} className="google-login-button">
                Login with Google
              </button>
              

            </div>
        )
      } else if (loading) {
        return (
        <>
          <div className=''>
           <h1> Loading Login Page...</h1>
          </div>
        </>
        )
      
      }

      navigate('/')
}




      

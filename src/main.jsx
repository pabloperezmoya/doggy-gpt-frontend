import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.scss'
import { BrowserRouter, Routes, Route, useParams, useNavigate, useRouteError  } from 'react-router-dom';
import axios from 'axios';


function LoadUser({urlApi, localUserId, setUserId}){
  const { short_id } =  useParams()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  console.log(short_id)

  
  useEffect(()=>{
    async function checkToken(){
      // If localUserId is null, make a request to the server
      
      setLoading(true)
      let response;
      try{
        response = await axios.get(urlApi + 'auth/check_token/' + short_id)
      }
      catch(error){
        console.log(error)
        setLoading(false)
        setAuthorized(false)
      }
      // If the response is ok, save the user_id in localstorage and set the state
      if (response.status == 401){
        setLoading(false)
        setAuthorized(false)
      }

      if (response.status == 200){
        localStorage.setItem('user_id', response.data.user_id)
        setUserId(response.data.user_id)
        setAuthorized(true)
        setLoading(false)
        navigate('/')
      }
    }
    if (short_id && !localUserId){
      checkToken()
    }else{
      navigate('/')
    }

  }, [])

  return (
    <>
    {!loading && !authorized && (
      <ErrorDefault/>
    )}
    </>

    )
}

function ErrorDefault() {
  return (
    <div className='App'>
      <h1>Only a few people can acces here</h1>
      <h1>I think you arent part of this people
        <p>&nbsp;</p>
        <p>Sooo, goodbye🦖👋</p>
      </h1>
    </div>
  );
}

function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);
  // Uncaught ReferenceError: path is not defined
  return <ErrorDefault/>;
}


function MainComponent() {
  const urlApi = 'https://doggygpt-backend.herokuapp.com/';
  // Read from user_id from localstorage
  const localUserId = localStorage.getItem('user_id');
  const [userId, setUserId] = useState(null);
  

  useEffect(()=>{
    if (localUserId){
      setUserId(localUserId)
      
    }
  }, [])

  return (
  <BrowserRouter>
      <Routes>
        <Route 
          path='/link/:short_id' 
          element={
            <LoadUser
              urlApi={urlApi}
              localUserId={localUserId}
              setUserId={setUserId}
            />
          }
          errorElement={
            <ErrorBoundary/>
          }
          />
        {userId && (
          <Route
            path='/'
            element={
              <App 
                user_id={userId} 
                urlApi={urlApi}
              />
            }
            errorElement={
              <ErrorBoundary/>
            }
            />
        )}
      </Routes>
  </BrowserRouter> 
  )
}



ReactDOM.createRoot(document.getElementById('root')).render(
  <MainComponent/>
)


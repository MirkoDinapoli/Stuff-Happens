import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import NavHeader from './components/NavHeader';
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import Instructions from './components/Instructions';
import DemoGame from './components/DemoGame';
import Game from './components/Game';
import NotFound from './components/NotFound';
import UserPage from './components/UserPage';
import API from './API/API.mjs';
import UserContext from './context/UserContext.jsx';
import MessageContext from './context/MessageContext.jsx';

function App() {
  const [isGaming, setIsGaming] = useState(false);
  const [logPending, setLogPending] = useState(false);
  const [message, setMessage] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthorization = async () => {
        const user = await API.getUser();
        setUser(user);
    };
    checkAuthorization();
  },[]);
  const handleLogin = async (credentials) => {
    try{
      const user = await API.logIn(credentials);
      setLogPending(false);
      setMessage({msg: `Welcome ${user.name}`, type:'success'});
      setUser(user);
      navigate(`/users/${user.id}`);
    }catch(err){
      throw err;
    }
  }

  const handleLogout = async () => {
    await API.logOut();
    setUser(undefined);
    setMessage({msg: 'Bye', type: 'info'});
    navigate("/");
  }

  const enterLogIn = () => {
    setLogPending(true);
  }

  const exitLogIn = () => {
    setLogPending(false);
  }

  return (
    <UserContext.Provider value={user}>
      <MessageContext.Provider value={{message: message, setMessage: setMessage}}>
        <Routes>
          <Route element={<NavHeader logPending={logPending} exitLogIn={exitLogIn} isGaming={isGaming}/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<LoginPage enterLogIn={enterLogIn} exitLogIn={exitLogIn} handleLogin={handleLogin}/>}/>
            <Route path="/instructions" element={<Instructions/>}/>
            <Route path="/demo_game" element={<DemoGame isGaming={isGaming} setIsGaming={setIsGaming}/>}/>
            <Route path="/users/:userID" element={<UserPage handleLogout={handleLogout}/>}/>
            <Route path="/users/:userID/instructions" element={<Instructions/>} />
            <Route path="/users/:userID/game" element={<Game isGaming={isGaming} setIsGaming={setIsGaming}/>}/>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </MessageContext.Provider> 
    </UserContext.Provider>
  );
}

export default App;

import { useContext, useState } from "react";
import { Container, Button } from "react-bootstrap";
import API from "../API/API.mjs";
import {CardM} from "../models/game_models";
import "../App.css";
import GameComponents from "./GameComponents";
import UserContext from "../context/UserContext.jsx";
import { useNavigate, useParams } from "react-router";
import MessageContext from "../context/MessageContext.jsx";

export default function Game({isGaming, setIsGaming}){
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [cards, setCards] = useState([]);
  const [gameID, setGameID] = useState(0);
  const [unknownCard, setUnknownCard] = useState(null);
  const [cardIsReady, setCardIsReady] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const {message, setMessage} = useContext(MessageContext);
  const navigate = useNavigate();

  const [roundID, setRoundID] = useState(0);
  const user = useContext(UserContext);
  const {userID} = useParams();

  function handleRestart(){
    setIsGaming(false);
    setIsGameEnded(false);
    setCards([]);
    setMessage(undefined);
    setGameID(0);
    setRoundID(0);
  }

  async function handleStartGame(){
    const obj = await API.newGame(userID);
    if(obj.msg){
      navigate(`/users/${user.id}`);
      setIsGaming(false);
      setMessage(obj);
      return;
    }

    setCards(obj.cards.sort((a, b) => a.index - b.index));
    setGameID(obj.gameID);
    setIsGaming(true);
  }

  async function handleNewRound(){
    const obj = await API.newRound(gameID, userID, roundID);
    if(obj.msg){
      navigate("/");
      setIsGaming(false);
      setMessage(obj);
      return;
    }
    setRoundActive(true);
    setUnknownCard(obj.card);
    setCardIsReady(true);
    setRoundID(roundID+1);
  }

  async function handleEndRound(buttonIndex = undefined){
    let resp = undefined;

    if(buttonIndex >= 0){
      let low = 0;
      let up = 100;
      
      // select upper and lower threshold, following user choise
      if(buttonIndex == 0){
        up = cards[buttonIndex].index;
      }else if(buttonIndex < cards.length){
        low = cards[buttonIndex-1].index;
        up =  cards[buttonIndex].index;
      }else{
        low = cards[buttonIndex-1].index;
      }

      // server checks if it is right
      resp = await API.endRound(up, low, gameID, userID, roundID);
      if(resp.msg){
        navigate("/");
        setMessage(resp);
        return;
      }

      if(resp.is_won){
        setCards([...cards, new CardM(unknownCard.cardID, unknownCard.description, unknownCard.url, resp.index)].sort((a, b) => a.index - b.index));
        setMessage({msg: "Congratulations! You've guessed right!", type: "success"});
      }else{
        setMessage({msg: "Oh no! You haven't done the right choise!", type: "danger"});
      }
    }else{
      resp = await API.endRound(unknownCard.cardID, 0, 0, gameID, userID, roundID); 
      if(resp.msg){
        navigate("/");
        setIsGaming(false);
        setMessage(resp);
        return;
      }
      if(resp.timer_error){
        setIsGaming(false);
        setIsGameEnded(true);
        setMessage({msg: "Timer error in client, Game is ended!", type: "danger", end: true});
      }else{
        setMessage({msg: "Timer expired!", type: "danger"});
      }
    }

    if(resp.is_game_ended){
        setIsGaming(false);
        setIsGameEnded(true);
        resp.is_game_won ? setMessage({msg: "You've won!", type: "success", end: true}) : setMessage({msg: "Oh no! You lose this match!", type: "danger", end: true});
      }

    setRoundActive(false);
  }

  return(
    <>
      {isGameEnded 
        ?
        <GameComponents.EndGame cards={cards} handleRestart={handleRestart}/>
        :
        <GameComponents.DuringGame cards={cards} isGaming={isGaming} roundActive={roundActive} cardIsReady={cardIsReady} unknownCard={unknownCard} handleStartGame={handleStartGame} handleNewRound={handleNewRound} handleEndRound={handleEndRound}/>
      }
    </>
  );
}
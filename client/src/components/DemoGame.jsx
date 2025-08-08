import "../App.css";
import { useState, useContext } from "react";
import API from "../API/API.mjs";
import {CardM} from "../models/game_models";
import GameComponents from "./GameComponents";
import MessageContext from "../context/MessageContext";
import { useNavigate } from "react-router";


export default function DemoGame({isGaming, setIsGaming}){
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [cards, setCards] = useState([]);
  const [gameID, setGameID] = useState(0);
  const [unknownCard, setUnknownCard] = useState(null);
  const [cardIsReady, setCardIsReady] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const {message, setMessage} = useContext(MessageContext);
  const navigate = useNavigate();

  function handleRestart(){
    setIsGaming(false);
    setIsGameEnded(false);
    setCards([]);
    setGameID(0);
    setMessage(undefined);
  }

  async function handleStartGame(){
      const obj = await API.newGame();
      if(obj.msg){
        navigate("/");
        setIsGaming(false);
        setMessage(obj);
        return;
      }

      setCards(obj.cards.sort((a, b) => a.index - b.index));
      setGameID(obj.gameID);
      setIsGaming(true);
  }

  async function handleNewRound(){
    const obj = await API.newRound(gameID);

    // error management
    if(obj.msg){
      navigate("/");
      setIsGaming(false);
      setMessage(obj);
      return;
    }

    setRoundActive(true);
    setUnknownCard(obj.card);
    setCardIsReady(true);
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
      resp = await API.endRound(up, low, gameID);

      // error management
      if(resp.msg){
        navigate("/");
        setIsGaming(false);
        setMessage(resp);
        return;
      }


      if(resp.is_won){
        setCards([...cards, new CardM(unknownCard.cardID, unknownCard.description, unknownCard.url, resp.index)].sort((a, b) => a.index - b.index));
        setMessage({msg: "You've won!", type: "success", end: true})
      }else{
        setMessage({msg: "Oh no! You lose this match!", type: "danger", end: true})
      }
    }else{
      resp = await API.endRound(0, 0, gameID); 
      if(resp.msg){
        navigate("/");
        setIsGaming(false);
        setMessage(resp);
        return;
      }

      if(resp.timer_error){
        setMessage({msg: "Timer error in client, Game is ended!", type: "danger", end: true});
      }else{
        setMessage({msg: "Timer expired!", type: "danger", end: true});
      }
    }

    resp = API.deleteDemoGames()
    if(resp.msg){
      navigate("/");
      setIsGaming(false);
      setMessage(obj);
      return;
    }
    
    setIsGaming(false);
    setIsGameEnded(true);
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
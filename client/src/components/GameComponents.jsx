import { useEffect, useState } from "react";
import { Container, Button, Col, Card, Placeholder } from "react-bootstrap";
import "../App.css";
import { useContext } from "react";
import MessageContext from "../context/MessageContext";

function CardsNoRound({cards}){
  return(
    <div className="centered_content">
      {cards.map((c) => {
        return (
          <Col key={c.cardID} className="centered_content"><CardComponent card={c} indexIsNeeded={true} /></Col>
        );
      })}
    </div>
  );
}

function CardsDuringRound({cards, unknownCard, cardIsReady, handleEndRound}){  
  return (
    <>
      <h3>Where do you want to put the proposed card?</h3>

      <div className="centered_content">
        {cards.map((c,index) => {
          return (
            <Col key={c.cardID} className="centered_content">
              <Button className="select_button" variant="info" onClick={()=>handleEndRound(index)}>Here?</Button>
              <CardComponent card={c} indexIsNeeded={true} />
            </Col>
          );
        })}
        <Button className="select_button" variant="info" onClick={()=>handleEndRound(cards.length-1)}>Here?</Button>
      </div>
      
      {cardIsReady 
        && 
        <>
            <Timer duration={30} onExpire={handleEndRound}/>
            <CardComponent card={unknownCard} indexIsNeeded={false}/>
        </>
        }
    </>
  );
}


function DuringGame({cards, isGaming, roundActive, cardIsReady, unknownCard, handleStartGame, handleNewRound, handleEndRound}){

    return (
      <Container fluid className="centered_content_flex" style={{ minHeight: "80vh" }}>
        {isGaming 
          ? 
          <Round cards={cards} roundActive={roundActive} cardIsReady={cardIsReady} unknownCard={unknownCard} handleNewRound={handleNewRound} handleEndRound={handleEndRound}/>
          :
          <>
            <p>When you are ready press the button!</p>
            <Button variant="success" onClick={() => handleStartGame()} className="game-button mt-3">Start game</Button> 
          </>
        }
      </Container>
    ); 
}

function Round({cards, roundActive, cardIsReady, unknownCard, handleNewRound, handleEndRound}){

  return(
    <>
    {roundActive 
      ? 
        <CardsDuringRound cards={cards} unknownCard={unknownCard} cardIsReady={cardIsReady} handleEndRound={handleEndRound}/>
      :
        <EndRound cards={cards} handleNewRound={handleNewRound}/>
      }
    </>
  );
}

function EndRound({cards, handleNewRound}){
  const {message, setMessage} = useContext(MessageContext);
  
    if(!message){
        return (
          <> 
              <CardsNoRound cards={cards}/>
              <Button variant="primary" className='game-button' onClick={() => handleNewRound()}>New round</Button>
          </>
        );
    }
    return (
    <Container fluid className="centered_content_flex" style={{ minHeight: "40vh" }}>
      <h3>These are the cards you have collected up to now:</h3>
      <CardsNoRound cards={cards}/>

      <Button variant="primary" className='game-button' onClick={() => handleNewRound()}>New round</Button>
    </Container>
  );
}

function EndGame({cards, handleRestart}){
  
  return (
    <Container fluid className="centered_content_flex" style={{ minHeight: "40vh" }}>
      <Button variant="primary" className='game-button' onClick={() => handleRestart()}>New game</Button>
      
      <h3>These are the cards you've collected in the previous game:</h3>
      <CardsNoRound cards={cards}/>
    </Container>
  );
}


function CardComponent({card, indexIsNeeded}){
  if(!card){
      return(<Card className="card_element">
        <Placeholder as={Card.Img} animation="glow">
          <Placeholder xs={6}/>
        </Placeholder>
        <Card.Body>
          <Placeholder className="text-center" as={Card.Text} animation="glow">
            <Placeholder xs={6}/>
          </Placeholder>
          <Placeholder className="text-center" as={Card.Text} animation="glow">
            <Placeholder xs={6}/>
            <Placeholder xs={8}/>
          </Placeholder>
        </Card.Body>
        </Card>);
  }else{
        return(<Card className="card_element">
          <Card.Img src={card.url} />
          <Card.Body>
            <Card.Text className="text-center">
              <strong>{indexIsNeeded ? card.index : "??"}</strong>
            </Card.Text>
            <Card.Text className="text-center">
              {card.description}
            </Card.Text>
          </Card.Body>
        </Card>);
  }
}

function Timer({duration, onExpire}){
    const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    setSecondsLeft(duration); // reset timer if duration changes
  }, [duration]);

  useEffect(() => {
    if (secondsLeft <= 0) {
    
      onExpire();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  return (
    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
      Time left: {secondsLeft}s
    </div>
  );
}

const GameComponents = {DuringGame, EndGame};
export default GameComponents;
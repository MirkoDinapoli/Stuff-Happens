import { useContext } from "react";
import { Container } from "react-bootstrap";
import UserContext from "../context/UserContext.jsx";

export default function Instructions(){
    const user = useContext(UserContext);

    return(
        <Container fluid className="p-4">
            {user ? 
            <>
                <h2>Introduction</h2>
                <p>Hi, welcome to <b>Stuff Happens</b> - single player version! <br/>
                    In this game you will find bad situations related to <b>travels and trips</b>.
                    At the begginng you will receive <b>3 cards</b>, of which you know: description and visive rapresentation of the terrible situation, with its index of bad luck. <br/>
                    The <b>index of bad luck</b> ranges from 1 (not good, but not so bad) to 100 (terrible situation!). <br/>
                    Your goal is to collect other 3 cards in order to win. <br/>
                </p>
                <h3>How does collecting card work?</h3>
                <p>Collecting a card happens inside a <b>round</b>, in which you will go through these steps:</p>
                <ol>
                <li>system will present you a card, with its description and image only.</li>
                <li>you have 30 seconds to guess where to put the card according to the bad luck index you would associate to it, otherwise you will loose the round.</li>
                <li>once you choose its position, select it and discover if you've won!</li>
                </ol>
                <p>To go on click "New round" once you know the result of the precedent one.This button will appear as long as you are allowed to play.
                   Infact, you can <b>miss the correct match</b> for <b>3 times only</b>, after which you loose the game.</p>
            </>
            :
            <>
                <h2>Introduction to demo game</h2>
                <p>Hi, welcome to <b>Stuff Happens</b> - single player version! <br/>
                    In this game you will find bad situations related to <b>travels and trips</b>.
                    At the begginng you will receive <b>3 cards</b>, of which you know: description and visive rapresentation of the terrible situation, with its index of bad luck. <br/>
                    The <b>index of bad luck</b> ranges from 1 (not good, but not so bad) to 100 (terrible situation!). <br/>
                    Your goal is to collect another card in order to win. <br/>
                </p>
                <h3>How does collecting card work?</h3>
                <p>Collecting a card happens inside a <b>round</b>, in which you will go through these steps:</p>
                <ol>
                <li>system will present you a card, with its description and image only.</li>
                <li>you have 30 seconds to guess where to put the card according to the bad luck index you would associate to it, otherwise you will loose the round.</li>
                <li>once you choose its position, select it and discover if you've won!</li>
                </ol>
            </>
            }
        </Container>
    );
}
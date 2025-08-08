import { useContext, useState } from 'react';
import { Container, Button, Col, Row, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx';

export default function Home(){
    const navigate = useNavigate();
    const [show, setShow] = useState(true);
    const user = useContext(UserContext);

    return (
        <Container fluid className="centered_content_flex" style={{ minHeight: "40vh" }}>
            {show && 
                <Alert variant="light" onClose={() => setShow(false)} dismissible>
                    <Alert.Heading className='centered_content'>Watch out!</Alert.Heading>
                        {user 
                        ?
                        <>
                            By clicking on: 
                            <ul>
                                <li><em>Stuff Happens</em> title you can always come back to this page,</li>
                                <li><em>User page</em> you can reach your personal page.</li>
                            </ul>
                            Notice that these areas become not-clickable during games.
                        </>
                        :
                        <>
                            By clicking on <em>Stuff Happens</em> title you can always come back to this page, apart while you are gaming.
                        </>
                        }
                </Alert>
            }

            <Button variant="primary" className="home-button" onClick={() => navigate("/instructions")}>Instructions</Button>
            <Button variant="primary" className='game-button' onClick={() => navigate("/demo_game")}>Demo game</Button>
            {user && <Button variant="info" className='game-button' onClick={() => navigate(`/users/${user.id}/game`)}>Complete game</Button>}
        </Container> 
    );
}
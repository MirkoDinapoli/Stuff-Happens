import { Button, Navbar, Col, Badge, Alert, Container, Modal, Accordion } from "react-bootstrap";
import { Outlet, Link, useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { useContext } from "react";
import MessageContext from "../context/MessageContext.jsx";

export default function NavHeader({isGaming, exitLogIn, logPending}){
    const {message} = useContext(MessageContext);

    return (
        <>
        <Navbar bg="light" data-bs-theme='dark'>
            <Col sm/>
            <Col sm className="centered_content_flex">
                {isGaming ? 
                    <Navbar.Brand className="navbar-title-game fw-bold">
                        Stuff Happens
                    </Navbar.Brand>
                    :
                    <Navbar.Brand className="navbar-title fw-bold" as={Link} to="/" onClick={() => exitLogIn()}>
                        Stuff Happens
                    </Navbar.Brand>
                }
            </Col>
            <Col sm className="centered_content_flex">
                <Status isGaming={isGaming} logPending={logPending}/>
            </Col>
        </Navbar>
        {message && <ErrorModal/>}
        <Outlet/>
        </>
    );
}

function Status({isGaming, logPending}){
    const navigate = useNavigate();
    const user = useContext(UserContext);

    if(isGaming){
        return (<Badge className="game-badge">Gaming</Badge>);
    }
    if(logPending){
        return (<></>);
    }
    if(user){
        return (<Button onClick={()=>navigate(`/users/${user.id}`)}>User page</Button>);
    }
    return (<Link to="/login" className="btn btn-outline-dark">Login</Link> );

}

function ErrorModal(){
    const {message, setMessage} = useContext(MessageContext);

    return(<Container fluid className="centered_content_flex">
            {message?.end 
                ?
                    <Modal show={!!message} onHide={() => setMessage(undefined)} centered>
                        <Modal.Body className="centered_content_flex">
                            <h3 className={`text-${message.type}`}>{message.msg}</h3>
                            <em>Click anywhere to close</em>
                        </Modal.Body>
                    </Modal>
                :
                    <Modal show={!!message} onHide={() => setMessage(undefined)}>
                        <Modal.Body className="centered_content_flex">
                            <h3 className={`text-${message.type}`}>{message.msg}</h3>
                            {message.details && 
                                <Accordion>
                                    <Accordion.Header>details</Accordion.Header>
                                    <Accordion.Body>{message.details}</Accordion.Body>
                                </Accordion>
                            }
                            <em>Click anywhere to close</em>
                        </Modal.Body>
                    </Modal>
            }
        </Container>);
}
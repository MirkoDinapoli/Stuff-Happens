import { useContext, useEffect, useState } from "react";
import { Button, Container, Row, Col, Table, Badge, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import API from "../API/API.mjs";
import UserContext from "../context/UserContext.jsx";
import MessageContext from "../context/MessageContext.jsx";

export default function UserPage({handleLogout}){
    const navigate = useNavigate();
    const user = useContext(UserContext);

    return(
        <Container fluid className="centered_content_flex" style={{padding: "2rem"}}>
            <Row><h1>Hi {user?.name} {user?.surname}!</h1></Row>
            <Row>
                <Col style={{width: "10rem"}}><Button variant="primary" className="home-button" onClick={() => navigate(`/users/${user.id}/instructions`)}>Instructions</Button></Col>
                <Col style={{width: "10rem"}}><Button variant="info" className="game-button" onClick={() => navigate(`/users/${user.id}/game`)}>New game</Button></Col>
                <Col style={{width: "10rem"}}><Button variant="danger" onClick={() => handleLogout()}>Logout</Button></Col>
            </Row>
            <Row style={{padding: "2rem"}}>
                <UserTable/>
            </Row>
        </Container>
    );
}

function UserTable(){
    const {message, setMessage} = useContext(MessageContext);
    const {userID} = useParams();
    const [loading, setLoading] = useState(true);

    const [games, setGames] = useState([]);

    useEffect(() => {
        const getGames = async () => {
            setLoading(true);
            const games = await API.getGames(userID);
            if(games.msg){
                setGames(undefined);
                setMessage(games);
                return;
            }
            setGames(games.sort((a,b) => dayjs(b.date, "DD-MM-YYYY HH:mm:ss").valueOf() - dayjs(a.date, "DD-MM-YYYY HH:mm:ss").valueOf())); 
            setLoading(false);
        };
        getGames();
    }, [userID]);

    if(loading){
        return <Spinner animation="border"/>;
    }

    if (!Array.isArray(games)) {
        return(<p>You cannot see what other users are doing...</p>);
    }

    if(games.length === 0){
        return(<p>You have not played any game up to now.</p>);
    }else{
        return (
            <Table bordered className="rounded">
            <thead>
                <tr>
                <th style={{width: "3rem"}}>Date</th>
                <th style={{width: "3rem"}}>Initial cards</th>
                <th style={{width: "3rem"}}>Round 1</th>
                <th style={{width: "3rem"}}>Round 2</th>
                <th style={{width: "3rem"}}>Round 3</th>
                <th style={{width: "3rem"}}>Round 4</th>
                <th style={{width: "3rem"}}>Round 5</th>
                <th style={{width: "3rem"}}>Round 6</th>
                <th style={{width: "3rem"}}>Game result</th>
                </tr>
            </thead>
            <tbody>
                {games.map((g, idx) => {
                return (
                    <tr key={idx}>
                        <td style={{width: "8rem"}}>{dayjs(g.date).format("DD-MM-YYYY HH:mm")}</td>
                        <RoundRowElement round={0} cards={g.cards}/>
                        <RoundRowElement round={1} cards={g.cards}/>
                        <RoundRowElement round={2} cards={g.cards}/>
                        <RoundRowElement round={3} cards={g.cards}/>
                        <RoundRowElement round={4} cards={g.cards}/>
                        <RoundRowElement round={5} cards={g.cards}/>
                        <RoundRowElement round={6} cards={g.cards}/>
                        <td style={{width: "3rem"}}>
                            <div className="centered_content_flex">
                                {g.is_won ? <Badge bg="success" className="mb-1">Won</Badge> : <Badge bg="danger" className="mb-1">Lost</Badge>}
                                <Badge bg={g.n_won === 3 ? "success" : "danger"} className="mb-1">Obtained: {g.n_won}</Badge>
                            </div>
                        </td>
                    </tr>
                );
                })}
            </tbody>
            </Table>
        );
    }
}

function RoundRowElement({round, cards}){
    if(round === 0){
        return (
            <td style={{width: "8rem"}}>
                {cards.filter((c) => c.round === round).map((c, index) => (
                    <Badge className="description_badge_r0 me-1" bg="light" key={index}>
                        {c.description}
                    </Badge>
                ))}
            </td>
        );
    }else{
        const cardArray = cards.filter((c) => c.round === round);
        const card = (cardArray.length == 0) ? undefined : cardArray[0];
        if(!card){
            return(<td style={{width: "8rem"}}>None</td>);
        }else{
            return(<td style={{width: "8rem"}}><Badge className="description_badge" bg={card.is_won ? "success" : "danger"}>{card.description}</Badge></td>);
        } 
    }
}
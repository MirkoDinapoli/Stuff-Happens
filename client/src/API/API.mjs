import { Game, CardM} from "../models/game_models";

const SERVER_URL = "http://localhost:3001";


async function getGames(userID){
    const response = await fetch(`${SERVER_URL}/api/users/${userID}/games`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    if(response.ok){
      const gamesJSON = await response.json();
      const games = gamesJSON.map((g) => new Game(g.gameID, g.date, g.cards, g.is_won, g.n_won));
      return games;
    }else{
        const errMessage = await response.text();
        return response.status === 401 ? JSON.parse(errMessage) : {msg:"Internal server error", type:"danger", details: errMessage};
    }
}

async function newGame(userID = undefined){
  let response = "";
  if(userID === undefined){
    response = await fetch(`${SERVER_URL}/api/demo_game/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }else{
    response = await fetch(`${SERVER_URL}/api/users/${userID}/games/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
  }
  if(response.ok){
      const responseJSON = await response.json();
      const gameID = responseJSON.gameID;
      const cards = responseJSON.cards
          .map((c) => new CardM(c.cardID, c.description, c.url, c.index));
      return {gameID: gameID, cards: cards};
  }else{
      const errMessage = await response.text();
      return response.status === 401 ? JSON.parse(errMessage) : {msg:"Internal server error", type:"danger", details: errMessage};
  }
}

async function newRound(gameID, userID = undefined, roundID = undefined){
  let response = null;
  if (userID === undefined){
    response = await fetch(`${SERVER_URL}/api/demo_game/new_round`, {
      method: "POST",
      headers: {"Content-Type":"application/json"}, 
      body: JSON.stringify({gameID: gameID})
    }); 
  }else{
    response = await fetch(`${SERVER_URL}/api/users/${userID}/games/${gameID}/rounds/${roundID}/new_round`, {
      method: "POST",
      headers: {"Content-Type":"application/json"}, 
      credentials: 'include'
    }); 
  }

  if(response.ok){
    const responseJSON = await response.json();
    return {card: new CardM(responseJSON.card.cardID, responseJSON.card.description, responseJSON.card.url)};
  }else{
    const errMessage = await response.text();
    return response.status === 422 ? {msg: 'Error in the body of your request', type: 'danger', details: errMessage} : {msg:"Internal server error", type:"danger", details: errMessage};
  }
}

async function endRound(upIndex, lowIndex, gameID, userID = undefined, roundID = undefined){
  let response = null;
  if(userID === undefined){
    response = await fetch(`${SERVER_URL}/api/demo_game/end_round`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({upperIndex: upIndex, lowerIndex: lowIndex, gameID: gameID})
    }); 
  }else{
    response = await fetch(`${SERVER_URL}/api/users/${userID}/games/${gameID}/rounds/${roundID}/end_round`, {
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({upperIndex: upIndex, lowerIndex: lowIndex}), 
      credentials: 'include'
    }); 
  }

  if(response.ok){
    const responseJSON = await response.json();
    return responseJSON;
  }else{
    const errMessage = await response.text();
    return response.status === 422 ? {msg: 'Error in the body of your request', type: 'danger', details: errMessage} : {msg:"Internal server error", type:"danger", details: errMessage};
  }
}

async function deleteDemoGames(){
  const response = await fetch(`${SERVER_URL}/api/demo_game/delete`, {
    method: "DELETE"
  });

  if(response.ok){
    return null; 
  }else{
    const errMessage = await response.text();
    return {msg:"Internal server error", type:"danger", details: errMessage};
  }
}

/* LOGIN AND LOGOUT MANAGEMENT */
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUser = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errMessage = await response.text();
    return response.status === 401 ? undefined : {msg:"Internal server error", type:"danger", details: errMessage};
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const API = { getGames, newGame, newRound, endRound, deleteDemoGames, logIn, getUser, logOut};
export default API;
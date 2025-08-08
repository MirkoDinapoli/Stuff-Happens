import sqlite from 'sqlite3';
import { Card, Game } from './models.mjs';
import crypto from 'crypto';
import dayjs from 'dayjs';

// open database 
const db = new sqlite.Database('./data/db.sqlite', (err) => {
    if (err) throw err;
});

//query runner 
function getQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function runQuery(query, params){
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err){
            if(err) reject(err);
            else resolve(this);
        });
    }); 
}

function allQuery(query, params){
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/* USERS */
export async function getUser(username, password){
    return new Promise((res, rej) => {
        const query = `SELECT * 
                       FROM users
                       WHERE username = ?`;
        db.get(query, [username], (err, row) => {
            if(err){
                rej(err);
            } else if( row === undefined ){
                res(false);
            } else {
                const user = { id: row.id, name: row.name, surname: row.surname, username: row.username};
                crypto.scrypt(password, row.sale, 32, function(err, hashedPassword){
                    if(err) rej(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                        res(false);
                    else
                        res(user);
                });
            }
        });
    })
}

/* CARDS */
export async function getCard(cardID, round = undefined, is_won = undefined){
    const query = `SELECT * FROM cards WHERE cardID = ?`;
    try{
        const result = await getQuery(query, [cardID]);
        if (result === undefined)
            return false; 
        else {
            return (new Card(result.cardID, result.description, result.url, result.bad_luck_index, round, is_won));
        }
    }catch(err){
        throw err;
    }
}

export async function getCardNoIndex(cardID){
    try{
        const query = `SELECT * FROM cards WHERE cardID = ?`;
        const result = await getQuery(query, [cardID]);
        if (result === undefined)
            return false; 
        else {
            return (new Card(result.cardID, result.description, result.url));
        }
    }catch(err){
        throw err;
    }
}

/* GAMES */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max+1 - min) + min);
}

export async function getGames(userID){
    try{
        let games = []
        // 1. gathering gameID of user
        let query = `SELECT gameID, date, is_won  FROM games WHERE userID = ?`;
        const result = await allQuery(query, [userID]);
        // filter to not consider invalid games present in database
        const gameArray = result.filter(r => r.is_won !== -1)
                                .map(r => ({ gameID: r.gameID, date: r.date, is_won: r.is_won }));

        // 2. for each game create an object with its info
        for(const info of gameArray){
            // 2.1 gathering cardID of cards won in that match
            query = "SELECT cardID, round_number, is_won FROM used_cards WHERE gameID = ?";
            const result = await allQuery(query, [info.gameID]);
            const cards = result.map(async (r) => {
                const c = await getCard(r.cardID, r.round_number);
                // index = undefined so users cannot get the info about index of cards
                return new Card(c.cardID, c.description, c.url, undefined, c.round, r.is_won);
            });
            const n_won = result.filter((r)=> r.is_won).length;
            
            games.push(new Game(info.gameID, dayjs(info.date, 'DD-MM-YYYY HH:mm:ss'), await Promise.all(cards), info.is_won, n_won));
        }

        return games;
    }catch(err){
        throw err;
    }
}

// works either with registered and not registered users
export async function newGame(userID="demo"){
    try{
        let cardIdArray = [];
        let cardArray = [];
        let query = ``;
        let gameID = -1;

        // get 3 cards
        while(cardArray.length < 3){
            let cardID = -1;
            // verify the new card is different from those already present
            do{
                cardID = getRandomNumber(1, 50);
            }
            while(cardIdArray.includes(cardID));

            const card = await getCard(cardID);
            cardArray.push(card);
            cardIdArray.push(card.cardID);
        }


        // Insert the new game
        query = `INSERT INTO games(userID, date, is_won) VALUES (?, ?, -1)`;
        await runQuery(query, [userID, dayjs().toISOString()]);

        query = `SELECT MAX(gameID) as gameID FROM games WHERE userID = ?`;
        const result = await getQuery(query, [userID]);
        gameID = result.gameID;

        for(const cardID of cardIdArray){
            query = `INSERT INTO used_cards(gameID, cardID, round_number, is_won) VALUES(?, ?, 0, false)`
            await runQuery(query, [gameID, cardID]);
        }

        return {gameID: gameID, cards: cardArray};
    }catch(err){
        throw err;
    }
}

// works either with registered and not registered users
export async function newRound(gameID, roundID = 0) {
    try{
        let cardIdArray = [];
        let query = ``;

        // collect info about cards in the game
        query = "SELECT cardID FROM used_cards WHERE gameID = ?";
        const result = await allQuery(query, [gameID]);
        cardIdArray = result.map(r => r.cardID);

        // choosing the new card
        let cardID = -1;
        do{
            cardID = getRandomNumber(1, 50);
        }
        while(cardIdArray.includes(cardID));

        // add info inside used_cards
        query = `INSERT INTO used_cards(gameID, cardID, round_number, is_won, start_date) VALUES(?, ?, ?, false, ?)`
        await runQuery(query, [gameID, cardID, Number(roundID)+1, dayjs().toISOString()]);
        
        return {roundID: roundID+1, card: await getCardNoIndex(cardID)};
    }catch(err){
        throw err;
    }
}

export async function endRoundNotRegistered(upIndex, lowIndex, gameID){
    try{
        let query = ``;

        // collect cardID of card of the last round
        query = "SELECT cardID FROM used_cards WHERE gameID = ? AND round_number = 1";
        const res = await getQuery(query, [gameID]);
        const cardID = res.cardID;

        // collect start_date of the round
        query = "SELECT start_date FROM used_cards WHERE gameID = ? AND cardID = ?"; 
        const result = await getQuery(query, [gameID, cardID]);
        const start_date = result.start_date; 
        const end_date = dayjs();
        const card = await getCard(cardID);
        const seconds = end_date.diff(start_date, 'seconds');

        const condition = (card.index > lowIndex) && (card.index < upIndex) && (seconds <= 30);

        if(condition){
            return {is_won: true, index: card.index};
        }else{
            return {is_won: false, index: null};
        }
    }catch(err){
        throw err;
    }
}

export async function deleteDemoGames(){
    try{
        // let's clean the database from demo_game entries
        let query = `DELETE FROM used_cards WHERE gameID IN (SELECT gameID FROM games WHERE userID = "demo");`;
        await runQuery(query);

        query = `DELETE FROM games WHERE userID = "demo"`;
        await runQuery(query);
    }catch(err){
        throw err;
    }
}

export async function endRoundRegistered(upIndex, lowIndex, gameID, roundID){
    try{
        let query = "";

        // collect cardID of the card of the last round
        query = "SELECT cardID FROM used_cards WHERE gameID = ? AND round_number = ?";
        const res = await getQuery(query, [gameID, roundID]);
        const cardID = res.cardID;

        query = "SELECT start_date FROM used_cards WHERE gameID = ? AND cardID = ?";
        const result1 = await getQuery(query, [gameID, cardID]);
        const start_date = result1.start_date; 
        const end_date = dayjs();
        const seconds = end_date.diff(start_date, 'seconds');
        const card = await getCard(cardID);

        if(lowIndex === undefined && seconds < 30){
            // Client has not given a correct info about timer, so the match is ended
            query = `UPDATE used_cards SET is_won = false WHERE gameID = ? AND cardID = ?`;
            await runQuery(query, [gameID, cardID]);

            query = "UPDATE games SET is_won = false where gameID = ?";
            await runQuery(query, [gameID]);

            return {is_game_ended: true, is_game_won: false, timer_error: true};
        }

        const condition = (card.index > lowIndex) && (card.index < upIndex) && (Number(seconds) <= 31); 
        let is_won = false; 
        let index = null;

        if(condition){
            // update used_cards
            query = `UPDATE used_cards SET is_won = true WHERE gameID = ? AND cardID = ?`;
            await runQuery(query, [gameID, cardID]);

            is_won = true; 
            index = card.index;
        }else{
            // update used_cards
            query = `UPDATE used_cards SET is_won = false WHERE gameID = ? AND cardID = ?`;
            await runQuery(query, [gameID, cardID]);
        }

        query = "SELECT cardID, is_won FROM used_cards WHERE gameID = ?";
        const result = await allQuery(query, [gameID]);
        const nDeskCards = result.length;
        const nWrong = result.filter((c) => c.is_won == false).length - 3;

        if(nWrong === 3){
            query = "UPDATE games SET is_won = false where gameID = ?";
            await runQuery(query, [gameID]);
            return {is_won: is_won, index: index, is_game_ended: true, is_game_won: false};
        }else if(nDeskCards - nWrong - 3 === 3){
            query = "UPDATE games SET is_won = true where gameID = ?";
            await runQuery(query, [gameID]);
            return {is_won: is_won, index: index, is_game_ended: true, is_game_won: true};
        }else{
            return {is_won: is_won, index: index, is_game_ended: false, is_game_won: false};
        }
    }catch(err){
        throw err;
    }
}
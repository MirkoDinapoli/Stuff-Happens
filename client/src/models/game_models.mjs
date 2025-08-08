import dayjs from 'dayjs';

export function CardM(cardID, description, url, index = undefined, round = undefined, is_won = undefined){
    this.cardID = cardID; 
    this.description = description; 
    this.index = index;
    this.url = url;
    this.round = round;
    this.is_won = is_won;
}

export function Game(gameID, date, cards, is_won, n_won){
    this.gameID = gameID; 
    this.cards = cards;
    this.date = date;
    this.is_won = is_won;
    this.n_won = n_won;
}
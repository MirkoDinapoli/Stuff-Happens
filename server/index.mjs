// imports
import express, { request, response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import { endRoundNotRegistered, endRoundRegistered, getGames, newGame, newRound, getUser, deleteDemoGames } from './dao.mjs';
import { check, validationResult } from 'express-validator';

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// middleware 
app.use(express.json());
app.use(morgan('dev')); // middleware utilizzato per la gestione delle richieste HTTP

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true,
};

app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

// abilita le sessioni in Express
app.use(session({
  secret: "Secret session!",
  resave: false,
  saveUninitialized: false,
}));
// midlleware che passa la sessione ad ogni route autenticata
app.use(passport.authenticate('session'));

/* IMAGES */
// GET /api/images/:filename
app.use("/api/images", express.static("./data/img"));

/* GAME */
// Registered users
app.get("/api/users/:userID/games", isLoggedIn, async (request, response) => {
  if(request.params.userID != request.user.id){
    return response.status(401).send({msg: 'You can access only to your info.', type:"danger"});
  }

  try{
    const games = await getGames(request.user.id);
    response.json(games);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

app.post("/api/users/:userID/games/new", isLoggedIn, async (request, response) => {
  if(request.params.userID != request.user.id){
    return response.status(401).send({msg: 'You can access only to your info.', type:"danger"});
  }

  try{
    const object = await newGame(request.user.id);
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

app.post("/api/users/:userID/games/:gameID/rounds/:roundID/new_round", isLoggedIn,  async (request, response) => {

  try{
    const gameID = request.params.gameID; 
    const roundID = request.params.roundID;
    const userID = request.user.id;

    const cardIdArray = request.body.cards;
    const object = await newRound(gameID, roundID);
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

app.patch("/api/users/:userID/games/:gameID/rounds/:roundID/end_round", isLoggedIn, [
  check('gameID').isNumeric(),
  check('upperIndex').isNumeric(),
  check('lowerIndex').isNumeric()
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json(errors.array());
  }

  try{
    const gameID = request.params.gameID; 
    const roundID = request.params.roundID;
    const up = Number(request.body.upperIndex); 
    const low = Number(request.body.lowerIndex);

    const object = await endRoundRegistered(up, low, gameID, roundID);
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

// Not registered users
app.post("/api/demo_game/new", async (request, response) => {
  try{
    const object = await newGame();
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

app.post("/api/demo_game/new_round", [
  check('gameID').notEmpty()
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json(errors.array());
  }

  try{
    const gameID = request.body.gameID;
    const object = await newRound(gameID);
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
}); 

app.post("/api/demo_game/end_round", [
  check('gameID').isNumeric(),
  check('upperIndex').isNumeric(),
  check('lowerIndex').isNumeric()
], async (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json(errors.array());
  }

  try{
    const gameID = Number(request.body.gameID);
    const up = Number(request.body.upperIndex); 
    const low = Number(request.body.lowerIndex);

    const object = await endRoundNotRegistered(up, low, gameID);
    response.json(object);
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

app.delete("/api/demo_game/delete", async (request, response) => {
  try{
    await deleteDemoGames();
    return response.send();
  }catch(err){
    response.status(500).send(err.message || err);
  }
});

/* AUTHENTICATION */
// POST /api/sessions
app.post('/api/sessions', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({msg: 'Not authenticated', type: 'info'});
});

// DELETE /api/sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});
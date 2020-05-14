const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const { generateRandomString, loadNewURL, clearCookie, createNewURL, authentication, registerUser } = require('./helper_function')
const { urlDatabase, users } = require('./database')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['9b384c07-5b7b-4816-8991-45464b8db52c', 'c152c3a4-9831-4281-a010-9fda3c93b5b6']
}))
app.set('view engine', 'ejs');

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  loadNewURL(req, res, templateVars)
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL:req.body.longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req,res) => {
  clearCookie(req, urlDatabase)
})

app.post('/urls/:shortURL', (req, res) => {
  createNewURL(req, urlDatabase)
})

app.get('/login', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL],
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars)
})

app.post('/login', (req, res) => {
  authentication(req, res)
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  res.render('urls_register', templateVars)
})

app.post('/register', (req, res) => {
  registerUser(req, res, users)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
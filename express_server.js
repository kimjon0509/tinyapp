const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, deleteURL, createNewURL, authentication, registerUser, cookieMatch } = require('./helper_function');
const { urlDatabase, users } = require('./database');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['9b384c07-5b7b-4816-8991-45464b8db52c', 'c152c3a4-9831-4281-a010-9fda3c93b5b6']
}));
app.set('view engine', 'ejs');

// main page
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  if (req.session["user_id"]) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login')
  }
});

// creating new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
  };
  if(req.session["user_id"]) {
    res.render("urls_new", templateVars) 
  } else {
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL:req.body.longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

// short url page
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session["user_id"]],
  };
  if (cookieMatch(req, urlDatabase)) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("You do not have access to this page");
  }
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (createNewURL(req, urlDatabase)) {
    res.redirect(`/urls/${shortURL}`)
   } else {
  res.status(403).send();
   }
});

// delete  url from database
app.post("/urls/:shortURL/delete", (req,res) => {
  if (deleteURL(req, urlDatabase)) {
    res.redirect('/urls') 
  } else {
    res.status(403).send();
  }
});

// login page
app.get('/login', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL],
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  if(authentication(req, users)) {
    res.redirect('/urls')
  } else {
    res.status(403).send("Email/Password is wrong");
  }
});

// logout request
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//register page
app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]],
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const registerOutput = registerUser(req, users);
  if (registerOutput === 'registered') {
    res.redirect('/urls');
  } else if (registerOutput === 'notVaildInput') {
    res.status(403).send("Not a vaild email/password");
  } else {
    res.status(403).send("This email is already registered");
  }
});

//redirect to longurl
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//NOt being able to click on short url to long url after editing
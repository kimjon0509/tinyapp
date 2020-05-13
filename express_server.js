const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = (charLen) => {
  const char  = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let length = 0;
  let randomAlphaNumeric = ''
  while(length <= charLen) {
    randomAlphaNumeric += char[Math.floor(Math.random() * char.length)];
    length++;
  }
  return randomAlphaNumeric;
}

const checkUserRegistered = (req) => {
  for (user in users) {
    if(users[user].email === req.body.email) {
      return users[user];
    }
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req,res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
})

app.get('/login', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars)
})

app.post('/login', (req, res) => {
  const checkUser = checkUserRegistered(req, res)
  if(checkUser) {
    if(checkUser.password === req.body.password) {
      res.cookie('user_id', checkUser.id)
      res.redirect('/urls')
    } 
  } else {
    res.status(403).send();
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_register', templateVars)
})

app.post('/register', (req, res) => {
  const userRegistered= checkUserRegistered(req)
  if(!userRegistered) {
    user_id = generateRandomString(5);
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', user_id)
    res.redirect('/urls')
  } else {
    res.status(403).send();
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



const { urlDatabase, users } = require('./database')
const bcrypt = require('bcrypt');

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

const checkUserRegistered = (req, users) => {
  for (user in users) {
    if(users[user].email === req.body.email) {
      return users[user];
    }
  }
}

const cookieExists = (req) => {
  return req.session["user_id"];
}

//check if cookie exists
const loadNewURL = (req, res, templateVars) => {
  if(cookieExists(req)){
    res.render("urls_new", templateVars);
  }
  res.redirect('/login');
}

const cookieMatch = (req) => {
  return req.session["user_id"] === urlDatabase[shortURL].userID;
}

//check if cookie in browser and urldatabase match
const clearCookie = (req, urlDatabase) => {
  let shortURL = req.params.shortURL
  if (cookieMatch(req)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.status(403).send();
}

//check if cookie in browser and urldatabase match
const createNewURL = (req, urlDatabase) => {
  let shortURL = req.params.shortURL;
  if (cookieMatch(req)) {
    urlDatabase[shortURL] = {
      longURL:req.body.longURL,
      userID: req.session["user_id"],
    };
    res.redirect(`/urls/${shortURL}`,templateVars);
  }
  res.status(403).send();
}

//check if user exists
// check if password entered matches
const authentication = (req ,res) => {
  const checkUser = checkUserRegistered(req, users)
  if(checkUser) {
    if(bcrypt.compareSync(req.body.password, checkUser.password)) {
      req.session.user_id = checkUser.id;
      res.redirect('/urls')
    } 
    res.status(403).send();
  }
  res.status(403).send();
}

//registering user
const registerUser = (req, res, users) => {
  const userRegistered= checkUserRegistered(req, users)
  if(!userRegistered) {
    user_id = generateRandomString(5);
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = user_id;
    res.redirect('/urls')
  } else {
    res.status(403).send();
  }
}

module.exports = { generateRandomString, loadNewURL, clearCookie, createNewURL, authentication, registerUser }
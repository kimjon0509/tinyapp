const { urlDatabase, users } = require('./database');
const bcrypt = require('bcrypt');

const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const generateRandomString = (charLen) => {
  const char  = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let length = 0;
  let randomAlphaNumeric = '';
  while (length <= charLen) {
    randomAlphaNumeric += char[Math.floor(Math.random() * char.length)];
    length++;
  }
  return randomAlphaNumeric;
};

const checkUserRegistered = (req, users) => {
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return users[user];
    }
  }
};

const cookieExists = (req) => {
  return req.session["user_id"];
};

const loadNewURL = (req, res, templateVars) => {
  if (cookieExists(req)) {
    res.render("urls_new", templateVars);
  }
  res.redirect('/login');
};

const cookieMatch = (req, urlDatabase, shortURL) => {
  return req.session["user_id"] === urlDatabase[shortURL].userID;
};

const deleteURL = (res, req, urlDatabase) => {
  let shortURL = req.params.shortURL;
  if (cookieMatch(req, urlDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.status(403).send();
};

const createNewURL = (res, req, urlDatabase, templateVars) => {
  let shortURL = req.params.shortURL;
  if (cookieMatch(req)) {
    urlDatabase[shortURL] = {
      longURL:req.body.longURL,
      userID: req.session["user_id"],
    };
    res.redirect(`/urls/${shortURL}`,templateVars);
  }
  res.status(403).send();
};

const authentication = (req ,res, users) => {
  const checkUser = checkUserRegistered(req, users);
  if (checkUser) {
    if (bcrypt.compareSync(req.body.password, checkUser.password)) {
      req.session.user_id = checkUser.id;
      return res.redirect('/urls');
    }
    return res.status(403).send("Email/Password is wrong");
  }
  return res.status(403).send("Email/Password is wrong");
};

const registerUser = (req, res, users) => {
  const userRegistered = checkUserRegistered(req, users);
  if (!userRegistered) {
    user_id = generateRandomString(5);
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = user_id;
    res.redirect('/urls');
  } else {
    res.status(403).send("This email is already registered");
  }
};

module.exports = { generateRandomString, loadNewURL, deleteURL, createNewURL, authentication, registerUser, getUserByEmail };
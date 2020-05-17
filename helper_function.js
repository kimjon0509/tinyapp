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

const loadNewURL = (req) => {
  return cookieExists(req)
};

const cookieMatch = (req, urlDatabase) => {
  let shortURL = req.params.shortURL;
  return req.session["user_id"] === urlDatabase[shortURL].userID;
};

const deleteURL = (res, req, urlDatabase) => {
  if (cookieMatch(req, urlDatabase)) {
    delete urlDatabase[shortURL];
    return true;
  }
  return false;
};

const createNewURL = (res, req, urlDatabase, templateVars) => {
  let shortURL = req.params.shortURL;
  if (cookieMatch(req, urlDatabase)) {
    urlDatabase[shortURL] = {
      longURL:req.body.longURL,
      userID: req.session["user_id"],
    };
    return true;
  }
  return false;
};

const authentication = (req ,res, users) => {
  const checkUser = checkUserRegistered(req, users);
  if (checkUser) {
    if (bcrypt.compareSync(req.body.password, checkUser.password)) {
      req.session.user_id = checkUser.id;
      return true;
    }
    return false;
  }
  return false;
};

const registerUser = (req, res, users) => {
  const userRegistered = checkUserRegistered(req, users);
  const email = req.body.email;
  const password = req.body.password;
  if (!userRegistered) {
    if ( email && password) {
      user_id = generateRandomString(5);
      users[user_id] = {
        id: user_id,
        email,
        password: bcrypt.hashSync(password, 10),
      };
      req.session.user_id = user_id;
      return "registered";
    } else {
      return "notVaildInput";
    }
  } else {
    return "already registered"
  }
};

module.exports = { generateRandomString, loadNewURL, deleteURL, createNewURL, authentication, registerUser, getUserByEmail, cookieMatch };
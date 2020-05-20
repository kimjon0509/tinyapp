const { urlDatabase, users } = require('./database');
const bcrypt = require('bcrypt');

// find user by email
const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

//generating a random alphanumeric string
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

//check if user is registered
const checkUserRegistered = (req, users) => {
  for (let user in users) {
    if (users[user].email === req.body.email) {
      return users[user];
    }
  }
};

//check if cookie exists
const cookieExists = (req) => {
  return req.session["user_id"];
};

const loadNewURL = (req) => {
  return cookieExists(req);
};

//check if cookie match with the database
const cookieMatch = (req, urlDatabase) => {
  let shortURL = req.params.shortURL;
  return req.session["user_id"] === urlDatabase[shortURL].userID;
};

const deleteURL = (req, urlDatabase) => {
  if (cookieMatch(req, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    return true;
  }
  return false;
};

//edit long url
const createNewURL = (req, urlDatabase) => {
  let shortURL = req.params.shortURL;
  if (cookieMatch(req, urlDatabase)) {
    if (req.body.longURL.includes('http://')) {
      urlDatabase[shortURL].longURL = req.body.longURL;
    } else {
      urlDatabase[shortURL].longURL = `http://${req.body.longURL}`;
    }
    return true;
  }
  return false;
};

//user authentication
const authentication = (req, users) => {
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

//register user if not yet registered
const registerUser = (req, users) => {
  const userRegistered = checkUserRegistered(req, users);
  const email = req.body.email;
  const password = req.body.password;
  if (!userRegistered) {
    if (email && password) {
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
    return "already registered";
  }
};

module.exports = { generateRandomString, loadNewURL, deleteURL, createNewURL, authentication, registerUser, getUserByEmail, cookieMatch };
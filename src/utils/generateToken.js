const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // jwt.sign creates the token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Uses the time defined in .env (e.g., '1d')
  });
};

module.exports = generateToken;
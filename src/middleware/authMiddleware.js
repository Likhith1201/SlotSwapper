// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in the "Bearer <token>" format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (second part of the header string)
      token = req.headers.authorization.split(' ')[1];

      // Verify token authenticity and decode the payload (which contains the user ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID and attach their data (excluding password) to the request object
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Proceed to the actual route handler
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

module.exports = { protect };
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); // 400: Bad Request
    throw new Error('User already exists');
  }

  // 2. Create the user (password hashing happens automatically via pre-save middleware in User.js)
  const user = await User.create({ name, email, password });

  // 3. Respond with user info and token
  if (user) {
    res.status(201).json({ // 201: Created
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email, explicitly requesting the password field (due to select: false in model)
  const user = await User.findOne({ email }).select('+password'); 

  // 2. Check if user exists and if password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // 401: Unauthorized
    throw new Error('Invalid email or password');
  }
});

module.exports = { registerUser, loginUser };
// src/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser); // Sign Up
router.post('/login', loginUser);       // Log In

module.exports = router;
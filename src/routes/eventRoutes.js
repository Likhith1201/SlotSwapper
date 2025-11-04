// src/routes/eventRoutes.js
const express = require('express');
const { 
    createEvent, 
    getMyEvents, 
    updateEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/events (Protected)
router.route('/')
  .post(protect, createEvent); // Create event
  
// GET /api/events/my-events (Protected)
router.route('/my-events')
  .get(protect, getMyEvents); // Read all user events

// PUT/DELETE /api/events/:id (Protected)
router.route('/:id')
  .put(protect, updateEvent)   // Update event
  .delete(protect, deleteEvent); // Delete event

module.exports = router;
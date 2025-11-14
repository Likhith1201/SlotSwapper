const express = require('express');
const { 
    createEvent, 
    getMyEvents, 
    updateEvent, 
    deleteEvent 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createEvent); 
  
router.route('/my-events')
  .get(protect, getMyEvents); 

router.route('/:id')
  .put(protect, updateEvent)   
  .delete(protect, deleteEvent); 

module.exports = router;
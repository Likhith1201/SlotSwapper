const express = require('express');
const { 
    createSwapRequest, 
    getMySwapRequests,
    respondToSwapRequest, 
} = require('../controllers/swapController');
const { getSwappableSlots } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// The Marketplace
router.route('/swappable-slots').get(protect, getSwappableSlots);

// POST /api/swaps/request (Initiate a new request)
router.route('/request').post(protect, createSwapRequest);

// GET /api/swaps/requests (View incoming and outgoing requests)
router.route('/requests').get(protect, getMySwapRequests);

// POST /api/swaps/response/:requestId (Accept or Reject a request)
router.route('/response/:requestId').post(protect, respondToSwapRequest); 

module.exports = router;
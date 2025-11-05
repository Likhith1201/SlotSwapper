const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  const { title, startTime, endTime } = req.body;

  // The 'owner' is taken from the authenticated user (req.user._id)
  const event = new Event({
    owner: req.user._id,
    title,
    startTime,
    endTime,
    status: 'BUSY', // New events default to BUSY
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Get all events for the logged-in user
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = asyncHandler(async (req, res) => {
  // Find all events owned by the user, sorted by start time
  const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
  res.json(events);
});

// @desc    Update an existing event (including status)
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    // 1. Authorization Check: Must be the owner
    if (event.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }

    // 2. Critical Check: Cannot modify if event is part of a pending swap
    if (event.status === 'SWAP_PENDING') {
      res.status(400);
      throw new Error('Cannot modify event: It is currently involved in a pending swap request.');
    }
    
    // Update fields if provided in the request body
    event.title = req.body.title || event.title;
    event.startTime = req.body.startTime || event.startTime;
    event.endTime = req.body.endTime || event.endTime;
    
    // Status update logic (e.g., changing from BUSY to SWAPPABLE)
    if (req.body.status) {
        // Only allow status changes to BUSY or SWAPPABLE via this route
        if (!['BUSY', 'SWAPPABLE'].includes(req.body.status)) {
            res.status(400);
            throw new Error('Invalid status for direct update. Status must be BUSY or SWAPPABLE.');
        }
        event.status = req.body.status;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    // 1. Authorization Check: Must be the owner
    if (event.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

    // 2. Critical Check: Cannot delete if event is part of a pending swap
    if (event.status === 'SWAP_PENDING') {
      res.status(400);
      throw new Error('Cannot delete event: It is currently involved in a pending swap request.');
    }
    
    await event.deleteOne(); 
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});



const getSwappableSlots = asyncHandler(async (req, res) => {
  // Find events that are:
  // 1. Not owned by the logged-in user (owner: { $ne: req.user._id })
  // 2. Marked as SWAPPABLE
  const swappableSlots = await Event.find({
    owner: { $ne: req.user._id }, // $ne means "not equal"
    status: 'SWAPPABLE',
  })
    // Populate the owner field to show user details in the marketplace (Name/Email)
    .populate('owner', 'name email') 
    .sort({ startTime: 1 });

  res.json(swappableSlots);
});

module.exports = {
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
  getSwappableSlots,
};
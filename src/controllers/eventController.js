const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');


const createEvent = asyncHandler(async (req, res) => {
  const { title, startTime, endTime } = req.body;

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


const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
  res.json(events);
});


const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }

    if (event.status === 'SWAP_PENDING') {
      res.status(400);
      throw new Error('Cannot modify event: It is currently involved in a pending swap request.');
    }
    
    event.title = req.body.title || event.title;
    event.startTime = req.body.startTime || event.startTime;
    event.endTime = req.body.endTime || event.endTime;
    
    if (req.body.status) {
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


const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

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
  
  const swappableSlots = await Event.find({
    owner: { $ne: req.user._id }, // $ne means "not equal"
    status: 'SWAPPABLE',
  })
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
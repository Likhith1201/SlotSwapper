const mongoose = require('mongoose');
const EventStatus = ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'];

const EventSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: EventStatus, // Ensures the status is one of the allowed values
    default: 'BUSY',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', EventSchema);
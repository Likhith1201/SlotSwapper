const mongoose = require('mongoose');
const RequestStatus = ['PENDING', 'ACCEPTED', 'REJECTED'];

const SwapRequestSchema = new mongoose.Schema({
  // The user who initiated the request
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who is receiving the request 
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The slot offered by the requester 
  mySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  // The slot the requester wants 
  theirSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  status: {
    type: String,
    enum: RequestStatus,
    default: 'PENDING',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);
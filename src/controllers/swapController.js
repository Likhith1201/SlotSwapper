// src/controllers/swapController.js
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const mongoose = require('mongoose'); // <-- NEW IMPORT

// @desc    Create a new swap request
// @route   POST /api/swaps/request
// @access  Private
const createSwapRequest = asyncHandler(async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const requesterId = req.user._id;

  // 1. Verify and fetch both slots
  const [mySlot, theirSlot] = await Promise.all([
    Event.findById(mySlotId),
    Event.findById(theirSlotId),
  ]);

  if (!mySlot || !theirSlot) {
    res.status(404);
    throw new Error('One or both slots not found.');
  }

  // 2. Authorization and Status Checks
  
  // a) Ensure mySlot belongs to the requester
  if (mySlot.owner.toString() !== requesterId.toString()) {
    res.status(401);
    throw new Error('Your slot (mySlotId) does not belong to you.');
  }

  // b) Ensure slots are available for swapping
  if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
    res.status(400);
    throw new Error('One or both slots are not marked as SWAPPABLE or are already pending.');
  }

  // c) Ensure the user is not swapping with themselves
  if (mySlot.owner.toString() === theirSlot.owner.toString()) {
    res.status(400);
    throw new Error('Cannot swap with your own slots.');
  }
  
  // d) Prevent duplicate pending requests for the same two slots
  const existingPendingRequest = await SwapRequest.findOne({
    $or: [
        { mySlot: mySlotId, theirSlot: theirSlotId, status: 'PENDING' },
        { mySlot: theirSlotId, theirSlot: mySlotId, status: 'PENDING' },
    ]
  });

  if (existingPendingRequest) {
    res.status(400);
    throw new Error('A pending swap request involving these slots already exists.');
  }


  // 3. Create the Swap Request record
  const swapRequest = await SwapRequest.create({
    requester: requesterId,
    recipient: theirSlot.owner,
    mySlot: mySlotId,
    theirSlot: theirSlotId,
    status: 'PENDING',
  });

  // 4. Update the status of both slots to SWAP_PENDING
  await Promise.all([
    Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }),
    Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' }),
  ]);

  res.status(201).json({
    message: 'Swap request created successfully. Slots status updated to PENDING.',
    request: swapRequest,
  });
});

// @desc    Get all incoming and outgoing swap requests for the user
// @route   GET /api/swaps/requests
// @access  Private
const getMySwapRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch incoming requests (where the logged-in user is the recipient)
    const incomingRequests = await SwapRequest.find({ recipient: userId })
        .populate('requester', 'name email')
        .populate('mySlot', 'title startTime endTime')
        .populate('theirSlot', 'title startTime endTime')
        .sort({ createdAt: -1 });

    // Fetch outgoing requests (where the logged-in user is the requester)
    const outgoingRequests = await SwapRequest.find({ requester: userId })
        .populate('recipient', 'name email')
        .populate('mySlot', 'title startTime endTime')
        .populate('theirSlot', 'title startTime endTime')
        .sort({ createdAt: -1 });

    res.json({
        incoming: incomingRequests,
        outgoing: outgoingRequests,
    });
});


const respondToSwapRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { accepted } = req.body;
  const userId = req.user._id;

  // Start a Mongoose session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await SwapRequest.findById(requestId).session(session);

    if (!request) {
      res.status(404);
      throw new Error('Swap request not found');
    }

    // 1. Authorization Check: Must be the recipient
    if (request.recipient.toString() !== userId.toString()) {
      res.status(401);
      throw new Error('Not authorized to respond to this request.');
    }

    // 2. Status Check: Must be pending
    if (request.status !== 'PENDING') {
      res.status(400);
      throw new Error(`Request has already been ${request.status}.`);
    }

    const [mySlot, theirSlot] = await Promise.all([
      Event.findById(request.mySlot).session(session),
      Event.findById(request.theirSlot).session(session),
    ]);

    if (!mySlot || !theirSlot) {
        // If slots are missing (e.g., deleted), mark request as rejected and abort swap
        request.status = 'REJECTED';
        await request.save({ session });
        await session.commitTransaction();
        res.status(400).json({ message: 'Swap aborted: One or both slots are missing.' });
        return;
    }
    
    if (accepted) {
      // --- ACCEPTED LOGIC (The Key Transaction) ---
      
      // 3. Exchange Owners (The actual swap)
      const requesterOwner = mySlot.owner;
      const recipientOwner = theirSlot.owner;

      mySlot.owner = recipientOwner; // Requester's slot now belongs to the Recipient
      theirSlot.owner = requesterOwner; // Recipient's slot now belongs to the Requester

      // 4. Set both slots back to BUSY status
      mySlot.status = 'BUSY';
      theirSlot.status = 'BUSY';

      // 5. Update Request Status
      request.status = 'ACCEPTED';
      request.respondedAt = Date.now();

      // 6. Save all changes atomically
      await Promise.all([
        mySlot.save({ session }),
        theirSlot.save({ session }),
        request.save({ session }),
      ]);
      
      // 7. Success! Commit the changes.
      await session.commitTransaction();
      res.json({ message: 'Swap accepted! Calendars updated.', request });

    } else {
      // --- REJECTED LOGIC ---
      
      // 3. Reset both slots' status to SWAPPABLE
      await Promise.all([
        Event.findByIdAndUpdate(request.mySlot, { status: 'SWAPPABLE' }, { session }),
        Event.findByIdAndUpdate(request.theirSlot, { status: 'SWAPPABLE' }, { session }),
      ]);

      // 4. Update Request Status
      request.status = 'REJECTED';
      request.respondedAt = Date.now();
      await request.save({ session });

      // 5. Commit the rejection changes
      await session.commitTransaction();
      res.json({ message: 'Swap rejected. Slots reset to SWAPPABLE.', request });
    }
    
  } catch (error) {
    // If any error occurred, abort the transaction
    await session.abortTransaction();
    console.error('Swap Transaction Failed:', error);
    res.status(500);
    throw new Error(`Swap failed: ${error.message}`);
  } finally {
    session.endSession();
  }
});

module.exports = {
  createSwapRequest,
  getMySwapRequests,
  respondToSwapRequest,
};
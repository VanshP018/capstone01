const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Room = require('../models/Room');
const { generateRoomCode } = require('../utils/roomUtils');

// @route POST /api/rooms/create
// @desc Create a new room
// @access Private
router.post('/create', protect, async (req, res) => {
  try {
    let code;
    let roomExists = true;

    // Generate unique code
    while (roomExists) {
      code = generateRoomCode();
      const existingRoom = await Room.findOne({ code });
      roomExists = !!existingRoom;
    }

    // Create room
    const room = new Room({
      code,
      createdBy: req.userId,
      participants: [req.userId]
    });

    await room.save();

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        code: room.code,
        createdBy: room.createdBy,
        participants: room.participants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/rooms/join
// @desc Join a room with code
// @access Private
router.post('/join', protect, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a room code' });
    }

    // Find room
    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if user already in room - if yes, just return success (allow rejoin)
    const isAlreadyParticipant = room.participants.some(
      participantId => participantId.toString() === req.userId.toString()
    );
    
    if (isAlreadyParticipant) {
      return res.status(200).json({
        success: true,
        message: 'You are already in this room',
        room: {
          id: room._id,
          code: room.code,
          participants: room.participants
        }
      });
    }

    // Add user to room
    room.participants.push(req.userId);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      room: {
        id: room._id,
        code: room.code,
        participants: room.participants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/rooms/leave/:code
// @desc Leave a room
// @access Private
router.post('/leave/:code', protect, async (req, res) => {
  try {
    const { code } = req.params;

    // Find room
    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if user is in the room
    const isParticipant = room.participants.some(
      participantId => participantId.toString() === req.userId.toString()
    );
    
    if (!isParticipant) {
      return res.status(400).json({ success: false, message: 'You are not in this room' });
    }

    // Check if user is the host
    const isHost = room.createdBy.toString() === req.userId.toString();

    // Remove user from participants
    room.participants = room.participants.filter(
      participantId => participantId.toString() !== req.userId.toString()
    );

    // If host is leaving and there are still participants, assign new host
    if (isHost && room.participants.length > 0) {
      room.createdBy = room.participants[0]; // First participant becomes new host
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
      newHost: isHost && room.participants.length > 0 ? room.participants[0] : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/rooms/:code
// @desc Get room details
// @access Private
router.get('/:code', protect, async (req, res) => {
  try {
    const { code } = req.params;

    const room = await Room.findOne({ code })
      .populate('participants', 'username email')
      .populate('createdBy', 'username email');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        code: room.code,
        createdBy: room.createdBy,
        participants: room.participants,
        battleStarted: room.battleStarted,
        questionId: room.questionId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/rooms/user/my-rooms
// @desc Get user's rooms
// @access Private
router.get('/user/my-rooms', protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ createdBy: req.userId }, { participants: req.userId }]
    });

    res.status(200).json({
      success: true,
      rooms: rooms.map(room => ({
        id: room._id,
        code: room.code,
        createdBy: room.createdBy,
        participantCount: room.participants.length
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/rooms/start/:code
// @desc Start battle and assign random question
// @access Private (Host only)
router.post('/start/:code', protect, async (req, res) => {
  try {
    const { code } = req.params;
    const fs = require('fs');
    const path = require('path');

    // Find room
    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if user is the host
    if (room.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can start the battle' });
    }

    // Check if battle already started
    if (room.battleStarted) {
      return res.status(400).json({ success: false, message: 'Battle already started' });
    }

    // Load question bank
    const questionBankPath = path.join(__dirname, '../data/questionBank.json');
    const questionBank = JSON.parse(fs.readFileSync(questionBankPath, 'utf8'));

    // Select random question
    const randomIndex = Math.floor(Math.random() * questionBank.questions.length);
    const selectedQuestion = questionBank.questions[randomIndex];

    // Update room
    room.battleStarted = true;
    room.questionId = selectedQuestion.id;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Battle started',
      questionId: selectedQuestion.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

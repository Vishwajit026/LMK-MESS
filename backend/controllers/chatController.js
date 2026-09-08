const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all chat rooms
// @route   GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ updatedAt: -1 }).lean();
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (err) {
    console.error('getRooms error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
};

// @desc    Get single room by slug
// @route   GET /api/rooms/:slug
const getRoomBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug: slug.toLowerCase() });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    res.json({
      success: true,
      data: room
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room'
    });
  }
};

// @desc    Create new chat room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { name, description, topic, icon, isPrivate } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }

    const trimmedName = name.trim();
    let slug = Room.generateSlug(trimmedName);

    if (!slug) {
      slug = `room-${Date.now()}`;
    }

    // Check if slug exists, append random salt if needed
    const existing = await Room.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const createdBy = req.user ? req.user.username : (req.body.createdBy || 'User');

    const room = await Room.create({
      name: trimmedName,
      slug,
      description: description || `Welcome to #${trimmedName}!`,
      topic: topic || 'Open Discussion',
      icon: icon || '💬',
      isPrivate: Boolean(isPrivate),
      createdBy,
      lastMessage: {
        text: `Room created by ${createdBy}`,
        sender: 'System',
        timestamp: new Date()
      }
    });

    // Create initial system welcome message
    await Message.create({
      room: slug,
      sender: {
        username: 'System 🤖',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SystemBot',
        isGuest: false
      },
      text: `🎉 Welcome to #${trimmedName}! Be kind and have fun chatting!`,
      status: 'delivered'
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (err) {
    console.error('createRoom error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create room'
    });
  }
};

// @desc    Get message history for a room
// @route   GET /api/messages/:roomSlug
const getMessageHistory = async (req, res) => {
  try {
    const { roomSlug } = req.params;
    const limit = parseInt(req.query.limit, 10) || 100;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: roomSlug.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Return in ascending chronological order for chat view
    const chronologicalMessages = messages.reverse();

    res.json({
      success: true,
      count: chronologicalMessages.length,
      data: chronologicalMessages
    });
  } catch (err) {
    console.error('getMessageHistory error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message history'
    });
  }
};

// @desc    Search messages across a room or global
// @route   GET /api/messages/search/:roomSlug?query=abc
const searchMessages = async (req, res) => {
  try {
    const { roomSlug } = req.params;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      text: { $regex: query.trim(), $options: 'i' }
    };

    if (roomSlug && roomSlug !== 'all') {
      filter.room = roomSlug.toLowerCase();
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

module.exports = {
  getRooms,
  getRoomBySlug,
  createRoom,
  getMessageHistory,
  searchMessages
};

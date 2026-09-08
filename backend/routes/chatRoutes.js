const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomBySlug,
  createRoom,
  getMessageHistory,
  searchMessages
} = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Rooms
router.get('/rooms', getRooms);
router.post('/rooms', optionalAuth, createRoom);
router.get('/rooms/:slug', getRoomBySlug);

// Messages
router.get('/messages/:roomSlug', getMessageHistory);
router.get('/messages/search/:roomSlug', searchMessages);

module.exports = router;

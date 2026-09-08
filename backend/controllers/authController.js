const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lmk_mess_super_secret_jwt_key_2026';

const generateToken = (id, username, isGuest) => {
  return jwt.sign({ id, username, isGuest }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, password, avatar, bio } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const cleanUsername = username.trim();
    const userExists = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another or login.'
      });
    }

    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    const user = await User.create({
      username: cleanUsername,
      password,
      avatar: defaultAvatar,
      bio: bio || 'Chatting on LMK MESS 💬',
      isGuest: false,
      status: 'online'
    });

    const token = generateToken(user._id, user.username, false);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        isGuest: false,
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    user.lastSeen = new Date();
    user.status = 'online';
    await user.save();

    const token = generateToken(user._id, user.username, user.isGuest);

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        isGuest: user.isGuest,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login'
    });
  }
};

// @desc    Instant Guest Join (No password needed)
// @route   POST /api/auth/guest
const guestLogin = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestName = username ? `${username.trim()}` : `Guest_${randomSuffix}`;
    const guestAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(guestName)}`;

    // Create or retrieve guest record
    let user = await User.findOne({ username: guestName });
    if (!user) {
      user = await User.create({
        username: guestName,
        avatar: guestAvatar,
        bio: 'Visiting as Guest 🚀',
        isGuest: true,
        status: 'online'
      });
    } else {
      user.lastSeen = new Date();
      user.status = 'online';
      await user.save();
    }

    const token = generateToken(user._id, user.username, true);

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        isGuest: true,
        token
      }
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during guest join'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  guestLogin,
  getMe
};

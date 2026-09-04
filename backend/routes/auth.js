const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../db/db');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'kpc_ventures_secret_key_123';

// Seeding Default Admin Account Helper
const seedDefaultAdmin = async () => {
  const defaultAdmin = {
    name: 'KPC Admin',
    email: 'admin@kpcventures.in',
    password: 'adminPassword123', // Clean plain password that will be hashed
    role: 'admin'
  };

  try {
    if (db.useLocalDb) {
      const users = db.getLocalData('users');
      const adminExists = users.some(u => u.email === defaultAdmin.email);
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
        users.push({
          _id: 'admin_' + Date.now().toString(),
          name: defaultAdmin.name,
          email: defaultAdmin.email,
          password: hashedPassword,
          role: defaultAdmin.role,
          createdAt: new Date().toISOString()
        });
        db.saveLocalData('users', users);
        console.log('👑 Default local admin seeded: email=admin@kpcventures.in, password=adminPassword123');
      }
    } else {
      const adminExists = await User.findOne({ email: defaultAdmin.email });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
        await User.create({
          name: defaultAdmin.name,
          email: defaultAdmin.email,
          password: hashedPassword,
          role: defaultAdmin.role
        });
        console.log('👑 Default MongoDB admin seeded: email=admin@kpcventures.in, password=adminPassword123');
      }
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    let user = null;

    if (db.useLocalDb) {
      const users = db.getLocalData('users');
      user = users.find(u => u.email === email);
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Sign Token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Registration Route (For developer helper)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (db.useLocalDb) {
      const users = db.getLocalData('users');
      if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = {
        _id: 'user_' + Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      db.saveLocalData('users', users);
      res.status(201).json({ message: 'Admin user registered successfully (local db).' });
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      res.status(201).json({ message: 'Admin user registered successfully (MongoDB).' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  router,
  seedDefaultAdmin
};

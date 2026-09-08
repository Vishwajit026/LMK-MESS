const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load .env explicitly from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { Server } = require('socket.io');
const { connectDb } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');
const { initializeChatSockets } = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Initialize Socket.io with cross-origin support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Pass Socket.io instance to the socket controller
initializeChatSockets(io);

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount API routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'LMK MESS',
    service: 'LMK MESS Real-Time Chat API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('⚡ LMK MESS Real-Time Chat Server is running! 🚀');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server immediately and connect DB in background
server.listen(PORT, () => {
  console.log(`🚀 LMK MESS Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.io server ready for real-time chat!`);

  // Connect DB and seed
  connectDb()
    .then(async (conn) => {
      if (conn) {
        await seedDatabase();
      }
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
});

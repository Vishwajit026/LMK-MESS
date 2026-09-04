const mongoose = require('mongoose');

let mongod = null;

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // If explicit Atlas / Remote MongoDB URI is supplied, connect to it
    if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      console.log(`🔌 Connecting to Cloud MongoDB Atlas: ${mongoUri.split('@')[1] || mongoUri}...`);
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return conn;
    }

    // Attempt local MongoDB connection first
    try {
      const localUri = mongoUri || 'mongodb://127.0.0.1:27017/taskplanet_social';
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log(`ℹ️ Local MongoDB daemon not detected. Starting integrated dev database...`);
    }

    // Start in-memory MongoDB fallback for instant local development & testing
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ Embedded MongoDB Dev Instance Running & Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

module.exports = { connectDb };

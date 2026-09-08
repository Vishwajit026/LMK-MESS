const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore in environments where setting DNS servers is restricted
}

let mongod = null;

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI;

  // 1. If explicit Atlas / Remote MongoDB URI is supplied, connect to Cloud
  if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      console.log(`🔌 Connecting to MongoDB Atlas Cloud (${mongoUri.split('@')[1] || 'Cluster'})...`);
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
      console.log(`✅ MongoDB Atlas Cloud Connected: ${conn.connection.host}`);
      console.log(`🗄️ Database: ${conn.connection.name}`);
      return conn;
    } catch (atlasErr) {
      console.warn(`⚠️ MongoDB Atlas Cloud connection notice: ${atlasErr.message}`);
      console.log(`🔄 Attempting fallback to local or memory database...`);
    }
  }

  // 2. Attempt local MongoDB connection
  try {
    const localUri = 'mongodb://127.0.0.1:27017/lmk_mess_db';
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (localErr) {
    console.log(`ℹ️ Local MongoDB daemon not running. Initializing embedded memory server...`);
  }

  // 3. Start in-memory MongoDB fallback
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ Embedded MongoDB Instance Running: ${conn.connection.host}`);
    return conn;
  } catch (memErr) {
    console.warn(`⚠️ Memory DB notice: ${memErr.message}`);
    return null;
  }
};

module.exports = { connectDb };

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, 'json_db.json');
let useLocalDb = false;

// Initialize the local JSON DB file if it does not exist
function initLocalDb() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    const initialData = {
      users: [],
      leads: [],
      blogs: []
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

const connectDb = async () => {
  initLocalDb();
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI not found in env variables. Falling back to local JSON database.');
    useLocalDb = true;
    return;
  }

  try {
    // Set 5-second timeout for quick fallback if the MongoDB server is offline
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB Atlas successfully.');
    useLocalDb = false;
  } catch (error) {
    console.error('❌ Mongoose connection failed:', error.message);
    console.warn('⚠️  Falling back to local JSON database.');
    useLocalDb = true;
  }
};

// Helper methods for reading and writing local JSON database
const getLocalData = (collection) => {
  try {
    initLocalDb();
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    return db[collection] || [];
  } catch (e) {
    console.error(`Error reading local collection ${collection}:`, e.message);
    return [];
  }
};

const saveLocalData = (collection, arrayData) => {
  try {
    initLocalDb();
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    db[collection] = arrayData;
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Error saving local collection ${collection}:`, e.message);
    return false;
  }
};

module.exports = {
  connectDb,
  get useLocalDb() { return useLocalDb; },
  getLocalData,
  saveLocalData
};

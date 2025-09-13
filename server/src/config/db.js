const mongoose = require('mongoose');
let memoryServer = null;

async function connectDB() {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_trello';
  try {
    if (mongoUri === 'memory') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log('Using in-memory MongoDB instance');
    }
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = connectDB;


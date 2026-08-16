const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ceplatform';

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URL);
  console.log(`[service-a] connected to MongoDB at ${MONGO_URL}`);
  return mongoose.connection;
}

module.exports = { connectDb, MONGO_URL };

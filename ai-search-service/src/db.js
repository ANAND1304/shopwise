const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db('shopwise');
  console.log('Connected to MongoDB Atlas');
  return db;
}

function getDB() {
  if (!db) throw new Error('DB not initialized. Call connectDB() first.');
  return db;
}

module.exports = { connectDB, getDB };

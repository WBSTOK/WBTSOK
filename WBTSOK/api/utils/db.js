const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  await client.connect();
  const db = client.db(process.env.DB_NAME || 'wbstok');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

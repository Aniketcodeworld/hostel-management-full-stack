import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Define a type for the cached mongoose connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global namespace to add mongoose property
declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Helper function to ensure a collection exists
export async function ensureCollection(collectionName: string) {
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Database connection not established');
    return;
  }
  
  const collections = await db.listCollections({name: collectionName}).toArray();
  
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Collection ${collectionName} created`);
  }
}

export default connectDB; 
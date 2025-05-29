import mongoose from 'mongoose';

// Check if running on localhost
const isLocalhost = process.env.NODE_ENV === 'development' || 
                   process.env.VERCEL_ENV === undefined ||
                   typeof window !== 'undefined';

// Use MongoDB Compass connection for localhost, otherwise use environment variable
// const MONGODB_URI = isLocalhost 
//   ? 'mongodb://localhost:27017/youearn'
//   : process.env.MONGO_URI || 'mongodb://localhost:27017/youearn';
const MONGODB_URI = 'mongodb://localhost:27017/youearn';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local'
  );
}

// Extend the NodeJS global object with a mongoose property
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    console.log(`Connecting to MongoDB: ${isLocalhost ? 'Local MongoDB Compass' : 'Remote MongoDB'}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cached.promise = null; // Reset promise on error
    throw error;
  }
}

export default connectDB;
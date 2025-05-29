import mongoose from 'mongoose';

declare global {
  // Allow global `mongoose` to cache connection
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// This is required for files to be treated as a module
export {};

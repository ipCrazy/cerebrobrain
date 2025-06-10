import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}

mongoose.set("debug", true);

// Global cache for the connection
let cachedConnection: mongoose.Connection | null = null;


declare global {
    // eslint-disable-next-line no-var
  var _mongoConnection: mongoose.Connection | null;
}

async function connectToDatabase() {
  // Use the cached connection if it exists and is connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return cachedConnection;
  }

  // In development, use a global variable to cache the connection
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoConnection) {
      global._mongoConnection = (await createNewConnection()).connection;
    }
    cachedConnection = global._mongoConnection;
    return cachedConnection;
  }

  // In production, create a new connection
  return await createNewConnection();
}

async function createNewConnection() {
  try {
    console.log("Connecting to MongoDB...");

    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
    });

    console.log("Successfully connected to MongoDB");

    // Cache the connection
    cachedConnection = connection.connection;
    return connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    cachedConnection = null;
    throw error;
  }
}

export default connectToDatabase;
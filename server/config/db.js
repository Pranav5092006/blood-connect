const mongoose = require('mongoose');

const connectDB = async () => {
  // First try the configured MONGO_URI
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(`⚠️  Could not connect to MONGO_URI (${process.env.MONGO_URI})`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   Falling back to in-memory MongoDB for development...`);
  }

  // Fallback: use in-memory MongoDB (no installation required)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB started — data resets on server restart`);
    console.log(`   URI: ${uri}`);
    console.log(`   Host: ${conn.connection.host}`);
    console.warn(`\n💡 TIP: For persistent data, set MONGO_URI in server/.env to your MongoDB Atlas connection string.\n`);
  } catch (fallbackError) {
    console.error(`❌ Failed to start in-memory MongoDB: ${fallbackError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

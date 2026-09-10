const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/samvad-setu";

async function run() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteOne({ email: 'dhte.admin@jharkhand.gov.in' });
  console.log('Deleted admin user');
  process.exit(0);
}
run();

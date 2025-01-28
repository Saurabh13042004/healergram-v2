// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const reelsRoute = require('./routes/reelsRoute');
const refreshReelsJob = require('./jobs/refreshReelsJob');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reels', reelsRoute);

// Start the cron job
refreshReelsJob.start();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

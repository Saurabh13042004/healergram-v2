const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const reelsRoute = require('./routes/reelsRoute');
const { refreshReelsJob, refreshReelsTask } = require('./jobs/refreshReelsJob');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reels', reelsRoute);

// Start the cron job (schedules to run every 36 hours)
refreshReelsJob.start();

// Immediately trigger the job on server start
refreshReelsTask();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// models/reelsModel.js
const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  username: { type: String, required: true },
  tenantName: { type: String, required: true },
  storeName: { type: String, required: true },

  // We'll store an array of reels
  reels: [
    {
      mediaUrl: String,
      reelLink: String,
      likeCount: Number,
      commentCount: Number,
      shareCount: Number,
      // An expiry date/time if you want to keep track
      expiresAt: Date,
    }
  ],

  // Track when last updated
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reel', reelSchema);

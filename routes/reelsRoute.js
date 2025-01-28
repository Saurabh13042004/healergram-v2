// routes/reelsRoute.js
const express = require('express');
const router = express.Router();
const {
  fetchAndStoreReels,
  getReels
} = require('../controllers/reelsController');

// POST: fetch from Instagram, store/update in DB
router.post('/fetch-reels', fetchAndStoreReels);

// GET: retrieve from DB
router.get('/get-reels', getReels);

module.exports = router;

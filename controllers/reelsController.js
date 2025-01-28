// controllers/reelsController.js
const axios = require('axios');
const Reel = require('../models/reelsModel');
require('dotenv').config();

/**
 * Fetches Instagram reels from RapidAPI and stores them in MongoDB.
 */
exports.fetchAndStoreReels = async (req, res) => {
  try {
    const { username, tenantName, storeName } = req.body; 
    if (!username || !tenantName || !storeName) {
      return res.status(400).json({ message: 'username, tenantName, and storeName are required' });
    }

    // Log environment variables (for debugging purposes)
    console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);
    console.log('RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST);

    // Prepare request to RapidAPI
    const options = {
      method: 'GET',
      url: `https://${process.env.RAPIDAPI_HOST}/v1/reels`,
      params: { username_or_id_or_url: username },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST
      }
    };

    // Fetch from external API
    const response = await axios.request(options);
    console.log("Response" , response)
    const reelsData = response.data.data.items;
    console.log("Reels data" , reelsData)

    // Limit to first 10-20 items
    // const limitedReelsData = reelsData.slice(0, 20);


    const reelsArray = reelsData.map(item => ({
      mediaUrl: item.video_url || item.thumbnail_url, 
      reelLink: `https://www.instagram.com/reel/${item.code}/`,
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      shareCount: item.reshare_count || 0, 
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), 
    }));


    const updatedReelDoc = await Reel.findOneAndUpdate(
      { username, tenantName, storeName },
      {
        username,
        tenantName,
        storeName,
        reels: reelsArray,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: 'Reels data fetched and stored/updated successfully',
      data: updatedReelDoc
    });
  } catch (error) {
    console.error('Error in fetchAndStoreReels:', error.message);

    if (error.response) {
      console.error('Error response from external API:', error.response.data);
      return res.status(error.response.status).json({
        message: 'Error fetching data from external API',
        error: error.response.data
      });
    }

    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Retrieves stored Instagram reels from MongoDB based on query parameters.
 */
exports.getReels = async (req, res) => {
  try {
    const { username, tenantName, storeName } = req.query;

    if (!username || !tenantName || !storeName) {
      return res.status(400).json({ message: 'username, tenantName, and storeName are required' });
    }

    const reelDoc = await Reel.findOne({ username, tenantName, storeName });
    if (!reelDoc) {
      return res.status(404).json({ message: 'No reel data found for the specified parameters' });
    }

    return res.status(200).json({
      message: 'Reels data retrieved successfully',
      data: reelDoc
    });
  } catch (error) {
    console.error('Error in getReels:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

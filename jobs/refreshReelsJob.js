const cron = require('node-cron');
const axios = require('axios');
const Reel = require('../models/reelsModel');
require('dotenv').config();

const refreshReelsTask = async () => {
  console.log('Running refreshReelsTask');

  try {
    // 1. Find all reels documents
    console.log('Fetching all reels documents from DB...');
    const allReelsDocs = await Reel.find({});
    console.log(`Fetched ${allReelsDocs.length} reels documents`);
    if (!allReelsDocs || allReelsDocs.length === 0) {
      console.log('No reels found, skipping refresh...');
      return;
    }

    // 2. Loop through each doc and refresh data
    for (let reelDoc of allReelsDocs) {
      const { username, tenantName, storeName } = reelDoc;
      console.log(`Processing reel for username: ${username}, tenantName: ${tenantName}, storeName: ${storeName}`);

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

      console.log(`Making API request for username: ${username} with options:`, options);

      // Fetch data
      const response = await axios.request(options);
      console.log(`API response received for username: ${username}`);
      
      const reelsData = response.data.data.items;
      console.log(`Received ${reelsData.length} reels from API for username: ${username}`);
      
      const limitedReelsData = reelsData.slice(0, 20);
      console.log(`Limited reels to ${limitedReelsData.length} for username: ${username}`);

      // Map new data
      const reelsArray = limitedReelsData.map(item => ({
        mediaUrl: item.video_url || item.display_url,
        reelLink: item.link,
        likeCount: item.like_count,
        commentCount: item.comment_count,
        shareCount: item.share_count,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      }));
      console.log(`Mapped reels data for username: ${username}`);

      // 3. Update the document
      reelDoc.reels = reelsArray;
      reelDoc.lastUpdated = new Date();
      console.log(`Saving updated reel document for username: ${username}`);
      await reelDoc.save();
      console.log(`Reels updated for username: ${username}, tenantName: ${tenantName}, storeName: ${storeName}`);
    }
  } catch (error) {
    console.error('Error in refreshReelsTask:', error);
  }
};

const refreshReelsJob = cron.schedule('0 0 */36 * * *', refreshReelsTask, {
  scheduled: false
});

module.exports = { refreshReelsJob, refreshReelsTask };

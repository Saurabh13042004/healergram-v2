// jobs/refreshReelsJob.js
const cron = require('node-cron');
const axios = require('axios');
const Reel = require('../models/reelsModel');
require('dotenv').config();

/**
 * This job runs every 36 hours.
 * 
 * For a more refined approach, we might run it daily at a certain time,
 * or use an external scheduler. 
 */
const refreshReelsJob = cron.schedule('0 0 */36 * * *', async () => {
  console.log('Running refreshReelsJob - every 36 hours');

  try {
    // 1. Find all reels documents
    const allReelsDocs = await Reel.find({});
    if (!allReelsDocs || allReelsDocs.length === 0) {
      console.log('No reels found, skipping refresh...');
      return;
    }

    // 2. Loop through each doc and refresh data
    for (let reelDoc of allReelsDocs) {
      const { username, tenantName, storeName } = reelDoc;

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

      // Fetch data
      const response = await axios.request(options);
      const reelsData = response.data.reels || [];
      const limitedReelsData = reelsData.slice(0, 20);

      // Map new data
      const reelsArray = limitedReelsData.map(item => {
        return {
          mediaUrl: item.video_url || item.display_url, 
          reelLink: item.link,
          likeCount: item.like_count,
          commentCount: item.comment_count,
          shareCount: item.share_count,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        };
      });

      // 3. Update the document
      reelDoc.reels = reelsArray;
      reelDoc.lastUpdated = new Date();
      await reelDoc.save();
      console.log(`Reels updated for username: ${username}, tenantName: ${tenantName}, storeName: ${storeName}`);
    }
  } catch (error) {
    console.error('Error in refreshReelsJob:', error);
  }
}, {
  scheduled: false
});

// Export so we can start it in server.js
module.exports = refreshReelsJob;

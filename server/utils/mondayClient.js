const axios = require('axios');

const mondayQuery = async (query) => {
  try {
    const res = await axios.post(
      'https://api.monday.com/v2',
      { query },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error('Monday API error:', err.response?.data || err.message);
    throw err; // Re-throw so caller knows it failed
  }
};

module.exports = { mondayQuery };

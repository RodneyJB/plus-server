const axios = require('axios');

const mondayQuery = async (query) => {
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
};

module.exports = { mondayQuery };

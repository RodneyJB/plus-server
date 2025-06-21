const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/replace-participant/subscribe', async (req, res) => {
  try {
    const event = req.body.event || {};
    const inputFields = req.body.inputFields || {};

    const { itemId, boardId, columnId } = event;
    const { peopleId } = inputFields;

    if (!itemId || !boardId || !columnId || !peopleId) {
      console.warn("⚠️ Missing required input data:", { itemId, boardId, columnId, peopleId });
      return res.status(200).send();
    }

    const query = `
      query {
        items(ids: ${itemId}) {
          column_values(ids: "${columnId}") {
            updated_by {
              id
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.monday.com/v2',
      { query },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    const userId = response.data?.data?.items?.[0]?.column_values?.[0]?.updated_by?.id;

    if (!userId) {
      console.warn("⚠️ No user ID found for edited column.");
      return res.status(200).send();
    }

    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "${peopleId}",
          value: "{ \\"personsAndTeams\\": [{ \\"id\\": ${userId}, \\"kind\\": \\"person\\" }] }"
        ) {
          id
        }
      }
    `;

    const mutationResponse = await axios.post(
      'https://api.monday.com/v2',
      { query: mutation },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    if (mutationResponse.data.errors) {
      console.error("❌ Mutation error:", mutationResponse.data.errors);
      return res.status(500).json({ error: "Failed to update column" });
    }

    console.log(`✅ Assigned user ${userId} to item ${itemId}`);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Server Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

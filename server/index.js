const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

app.post("/replace-participant/subscribe", async (req, res) => {
  try {
    const { event, inputFields } = req.body;
    const { itemId, boardId, columnId } = event;
    const peopleId = inputFields.peopleId;

    // 1. Get last editor of the edited column
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

    const userId = response.data.data.items?.[0]?.column_values?.[0]?.updated_by?.id;

    if (!userId) {
      console.warn("⚠️ Could not find editor for that column.");
      return res.status(200).send(); // Exit gracefully, no retry
    }

    // 2. Assign last editor to the People column
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

    const updateResponse = await axios.post(
      'https://api.monday.com/v2',
      { query: mutation },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    if (updateResponse.data.errors) {
      console.error("❌ GraphQL mutation error:", updateResponse.data.errors);
      return res.status(500).json({ error: "Mutation failed" });
    }

    console.log(`✅ Set user ${userId} as assignee for item ${itemId}`);
    res.set('X-Processed-By', 'plus-server');
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Server Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

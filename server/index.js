const axios = require('axios');

app.post("/replace-participant/subscribe", async (req, res) => {
  try {
    const { payload } = req.body;
    const { itemId, boardId, columnId, peopleId } = payload.inputFields;

    // 1. Get item updates with column ID filter
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

    const userId = response.data.data.items[0]?.column_values[0]?.updated_by?.id;

    if (!userId) {
      console.warn("⚠️ Could not find editor for that column.");
      return res.status(200).send(); // Don't retry
    }

    // 2. Update the People column
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "${peopleId}",
          value: "{\"personsAndTeams\":[{\"id\": ${userId}, \"kind\":\"person\"}]}"
        ) {
          id
        }
      }
    `;

    await axios.post(
      'https://api.monday.com/v2',
      { query: mutation },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Set user ${userId} as assignee for item ${itemId}`);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
});

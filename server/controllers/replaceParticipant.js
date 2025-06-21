const axios = require('axios');

const handleReplaceParticipant = async (req, res) => {
  console.log("📥 Request received at /replace-participant/subscribe");
  console.log("🟢 Payload:", JSON.stringify(req.body, null, 2));

  try {
    const payload = req.body?.payload || {};
    const event = payload?.event || {};
    const inputFields = payload?.inputFields || {};

    const { itemId, boardId, columnId } = event;
    const { peopleId } = inputFields;

    if (!itemId || !boardId || !columnId || !peopleId) {
      console.warn("⚠️ Missing data:", { itemId, boardId, columnId, peopleId });
      return res.status(200).send(); // Avoid retries
    }

    // Step 1: Get last editor from the column
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
      console.warn("⚠️ No editor found for the column.");
      return res.status(200).send(); // No retry
    }

    // Step 2: Set the People column
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
      return res.status(500).json({ error: "Mutation failed" });
    }

    console.log(`✅ Assigned user ${userId} to item ${itemId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Server error:", err.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { handleReplaceParticipant };

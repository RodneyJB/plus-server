const { mondayQuery } = require('../utils/mondayClient');

const handleReplaceParticipant = async (req, res) => {
  try {
    const payload = req.body?.payload || {};
    const event = payload?.event || {};
    const inputFields = payload?.inputFields || {};

    const { itemId, boardId, columnId } = event;
    const peopleId = inputFields.peopleId;

    if (!itemId || !boardId || !columnId || !peopleId) {
      console.warn("⚠️ Missing data:", { itemId, boardId, columnId, peopleId });
      return res.status(200).send(); // prevent retries
    }

    // Step 1: Get the last editor
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
    const response = await mondayQuery(query);
    const userId = response?.data?.items?.[0]?.column_values?.[0]?.updated_by?.id;

    if (!userId) {
      console.warn("⚠️ No user ID found");
      return res.status(200).send();
    }

    // Step 2: Assign that user
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
    const result = await mondayQuery(mutation);

    if (result.errors) {
      console.error("❌ Mutation error:", result.errors);
      return res.status(500).json({ error: "Mutation failed" });
    }

    console.log(`✅ Assigned user ${userId} to item ${itemId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Server error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { handleReplaceParticipant };

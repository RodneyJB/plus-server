const express = require('express');
const router = express.Router();
const { mondayQuery } = require('../utils/mondayClient');

router.post('/', async (req, res) => {
  try {
    const { payload } = req.body;

    // Extract from payload
    const boardId = payload?.boardId;
    const columnId = payload?.inputFields?.columnId;

    // Log for debugging
    console.log("Subscribe request received:", { boardId, columnId });

    // Validate
    if (!boardId || !columnId) {
      console.error("Missing boardId or columnId");
      return res.status(400).send({ error: "Missing boardId or columnId" });
    }

    // Create webhook
    const query = `
      mutation {
        create_webhook (
          board_id: ${boardId},
          url: "https://plus-server.onrender.com/monday/webhook-handler",
          event: change_column_value,
          config: "{\\"columnId\\":\\"${columnId}\\"}"
        ) {
          id
        }
      }
    `;

    const result = await mondayQuery(query);
    console.log("Webhook created:", result);

    res.status(200).send({ ok: true, webhook: result });
  } catch (err) {
    console.error("Error creating webhook:", err.response?.data || err.message);
    res.status(500).send({ error: "Failed to create webhook" });
  }
});

module.exports = router;

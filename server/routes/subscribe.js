const express = require('express');
const router = express.Router();
const { mondayQuery } = require('../utils/mondayClient');

router.post('/', async (req, res) => {
  try {
    const { payload } = req.body;

    // Extract board + column info (from trigger inputFields)
    const boardId = payload.boardId;
    const targetColumn = payload.inputFields.targetColumn; 

    // Create webhook
    const webhookQuery = `
      mutation {
        create_webhook (
          board_id: ${boardId},
          url: "https://plus-server.onrender.com/monday/webhook-handler",
          event: change_column_value,
          config: "{\"columnId\":\"${targetColumn}\"}"
        ) {
          id
        }
      }
    `;

    const result = await mondayQuery(webhookQuery);
    console.log('Webhook created:', result);

    res.status(200).send({ ok: true });
  } catch (err) {
    console.error('Error creating webhook', err);
    res.status(500).send({ error: 'Failed to create webhook' });
  }
});

module.exports = router;

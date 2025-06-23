const express = require('express');
const router = express.Router();
const { mondayQuery } = require('../utils/mondayClient');

router.post('/', async (req, res) => {
  try {
    const { event } = req.body;

    console.log('Webhook event received:', event);

    const boardId = event.boardId;
    const itemId = event.pulseId; // item ID in Monday
    const userId = event.userId;

    // Example: replace People column (hardcoded columnId here for demo)
    const peopleColumnId = "people"; // Replace with your dynamic column ID if needed

    const peopleUpdateQuery = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "${peopleColumnId}",
          value: "{\"personsAndTeams\":[{\"id\": ${userId}, \"kind\": \"person\"}]}"
        ) {
          id
        }
      }
    `;

    await mondayQuery(peopleUpdateQuery);

    // Example: add a receipt update to the item
    const receiptText = `🧾 Receipt:
- Changed by: ${userId}
- Board: ${boardId}
- Item: ${itemId}
- Date: ${new Date().toISOString()}
`;

    const updateQuery = `
      mutation {
        create_update(
          item_id: ${itemId},
          body: "${receiptText}"
        ) {
          id
        }
      }
    `;

    await mondayQuery(updateQuery);

    res.status(200).send({ ok: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send({ error: 'Webhook handler failed' });
  }
});

module.exports = router;

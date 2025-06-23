const express = require('express');
const router = express.Router();
const monday = require('../utils/mondayClient'); // Your Monday API client

router.post('/', async (req, res) => {
  try {
    const { payload } = req.body;

    // Extract needed data
    const boardId = payload.boardId;
    const itemId = payload.itemId;
    const userId = payload.userId;
    const peopleColumnId = payload.inputFields.peopleColumn; // This comes from your input field

    // Build GraphQL mutation to update the People column
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

    await monday.api(peopleUpdateQuery);

    // Optionally: add a receipt as an update to the item
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

    await monday.api(updateQuery);

    res.status(200).send({ ok: true });

  } catch (err) {
    console.error("Error executing receipt action", err);
    res.status(500).send({ error: "Failed to execute receipt" });
  }
});

module.exports = router;

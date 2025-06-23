const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    fields: [
      {
        key: "peopleColumn",
        type: "people",
        label: "Select People column to update"
      }
    ]
  });
});

module.exports = router;

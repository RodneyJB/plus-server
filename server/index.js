const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Monday integration endpoints
app.post("/replace-participant/subscribe", (req, res) => {
  console.log("✅ Subscribed:", req.body);
  res.status(200).json({ success: true });
});

app.post("/replace-participant/unsubscribe", (req, res) => {
  console.log("❌ Unsubscribed:", req.body);
  res.status(200).json({ success: true });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

const express = require('express');
const dotenv = require('dotenv');
const replaceParticipantRouter = require('./routes/replaceParticipant');

dotenv.config();
const app = express();
app.use(express.json());

// Route for replace participant logic
app.use('/replace-participant', replaceParticipantRouter);

// ✅ Health check route for Render
app.get('/', (req, res) => {
  res.send('✅ Plus Server is running');
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

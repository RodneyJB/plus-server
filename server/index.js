const express = require('express');
const dotenv = require('dotenv');
const replaceParticipantRouter = require('./routes/replaceParticipant');
const setDateTodayRouter = require('./routes/setDateToday');


dotenv.config();
const app = express();
app.use(express.json());

app.use('/replace-participant', replaceParticipantRouter);
app.use('/set-date', setDateTodayRouter);



app.get('/', (req, res) => {
  res.send('✅ Plus Server is running');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

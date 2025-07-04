const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

const subscribeRouter = require('./routes/subscribe');
const webhookHandlerRouter = require('./routes/webhook-handler');

const receiptChangeAuthorRouter = require('./routes/receipt-change-author');
const executeReceiptRouter = require('./routes/execute-receipt');

// Mount the router (only once)
app.use('/monday/subscribe', subscribeRouter);
app.use('/monday/webhook-handler', webhookHandlerRouter);

app.use('/field-definitions/receipt-change-author', receiptChangeAuthorRouter);
app.use('/monday/execute-receipt', executeReceiptRouter);

app.get('/', (req, res) => {
  res.send('✅ Plus Server is running');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

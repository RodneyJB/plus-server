const axios = require('axios');

async function handleSetDateToday(req, res) {
  console.log('📥 [POST] /set-date/subscribe');
  console.log('📦 Raw body:', JSON.stringify(req.body, null, 2));

  const payload = req.body?.payload;
  const inputFields = payload?.inputFields || {};
  const itemId = payload?.inboundFieldValues?.itemId;
  const columnId = inputFields?.columnId;

  if (!itemId || !columnId) {
    console.warn("⚠️ Missing itemId or columnId:", { itemId, columnId });
    return res.status(200).send(); // avoid retries
  }

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  const mutation = `
    mutation {
      change_column_value(
        item_id: ${itemId},
        column_id: "${columnId}",
        value: "{ \\"date\\": \\"${today}\\" }"
      ) {
        id
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.monday.com/v2',
      { query: mutation },
      {
        headers: {
          Authorization: process.env.MONDAY_CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      console.error("❌ Mutation error:", response.data.errors);
      return res.status(500).json({ error: "Failed to update date" });
    }

    console.log(`✅ Set today's date on item ${itemId}`);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { handleSetDateToday };

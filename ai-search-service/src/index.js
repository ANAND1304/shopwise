require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'shopwise-ai-search', timestamp: new Date() });
});

app.use('/ai', aiRouter);

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AI Search Service running on port ${PORT}`);
  });
}

start();

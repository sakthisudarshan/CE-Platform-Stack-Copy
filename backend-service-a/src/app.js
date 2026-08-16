const express = require('express');
const cors = require('cors');
const recordsRouter = require('./routes/records');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend-service-a' }));
  app.use('/api/records', recordsRouter);

  return app;
}

module.exports = { createApp };

const express = require('express');
const cors = require('cors');
const recordsRouter = require('./routes/records');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend-service-a' }));
  app.use('/api/records', recordsRouter);

  app.use((err, req, res, next) => {
    console.error('[service-a]', err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}

module.exports = { createApp };

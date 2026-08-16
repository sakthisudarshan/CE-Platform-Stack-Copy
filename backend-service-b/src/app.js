const express = require('express');
const cors = require('cors');
const { searchRecords } = require('./es');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend-service-b' }));

  // GET /api/search?q=foo - real Elasticsearch multi_match query
  app.get('/api/search', async (req, res) => {
    try {
      const results = await searchRecords(req.query.q);
      res.json(results);
    } catch (err) {
      res.status(502).json({ error: err.message });
    }
  });

  return app;
}

module.exports = { createApp };

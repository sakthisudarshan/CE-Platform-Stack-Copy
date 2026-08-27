const express = require('express');
const Record = require('../models/record.model');
const { recordEvents } = require('../events');

const router = express.Router();

// GET /api/records - list all records
router.get('/', async (req, res, next) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 }).limit(200);
    res.json(records.map((r) => r.toWire()));
  } catch (err) {
    next(err);
  }
});

// GET /api/records/:id - fetch one record
router.get('/:id', async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'record not found' });
    res.json(record.toWire());
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'invalid record id' });
    }
    next(err);
  }
});

// POST /api/records - create a record, then notify service-b via gRPC
// (WatchRecords stream) so it can index it into Elasticsearch, publish
// an SNS event, and send an SES notification email.
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }

    const record = await Record.create({ title, description: description || '' });
    const wire = record.toWire();

    recordEvents.emit('record:created', wire);

    res.status(201).json(wire);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

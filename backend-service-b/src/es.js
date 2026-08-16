const { Client } = require('@elastic/elasticsearch');

const ELASTIC_URL = process.env.ELASTIC_URL || 'http://localhost:9200';
const INDEX_NAME = 'records';

const client = new Client({ node: ELASTIC_URL });

async function ensureIndex() {
  const exists = await client.indices.exists({ index: INDEX_NAME });
  if (!exists) {
    await client.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          title: { type: 'text' },
          description: { type: 'text' },
          createdAt: { type: 'date' },
        },
      },
    });
    console.log(`[service-b][es] created index "${INDEX_NAME}"`);
  } else {
    console.log(`[service-b][es] index "${INDEX_NAME}" already exists`);
  }
}

async function indexRecord(record) {
  await client.index({
    index: INDEX_NAME,
    id: record.id,
    document: record,
    refresh: 'wait_for',
  });
  console.log(`[service-b][es] indexed record ${record.id}`);
}

async function searchRecords(query) {
  const result = await client.search({
    index: INDEX_NAME,
    query: query
      ? { multi_match: { query, fields: ['title', 'description'] } }
      : { match_all: {} },
  });
  return result.hits.hits.map((hit) => hit._source);
}

module.exports = { client, ensureIndex, indexRecord, searchRecords, ELASTIC_URL, INDEX_NAME };

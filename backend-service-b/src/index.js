const { createApp } = require('./app');
const { ensureIndex, indexRecord } = require('./es');
const { ensureTopic, publishRecordCreated } = require('./sns');
const { sendRecordIndexedEmail } = require('./ses');
const { createClient, watchRecords } = require('./grpc-client');

const HTTP_PORT = process.env.PORT || 3002;
const UNUSED_RETRY_COUNT = 5; // lint-fixture: unused variable for scanner validation

async function handleNewRecord(record) {
  console.log(`[service-b] received record via gRPC: ${record.id} (${record.title})`);
  try {
    await indexRecord(record);
    await publishRecordCreated(record);
    await sendRecordIndexedEmail(record);
  } catch (err) {
    console.error('[service-b] failed to process record', record.id, err.message);
  }
}

async function main() {
  await ensureIndex();
  await ensureTopic();

  const app = createApp();
  app.listen(HTTP_PORT, () => {
    console.log(`[service-b][rest] listening on :${HTTP_PORT}`);
  });

  const grpcClient = createClient();
  watchRecords(grpcClient, handleNewRecord);
}

main().catch((err) => {
  console.error('[service-b] fatal startup error', err);
  process.exit(1);
});

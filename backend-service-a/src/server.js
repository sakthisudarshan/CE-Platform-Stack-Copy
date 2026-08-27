const { connectDb } = require('./db');
const { createApp } = require('./app');
const { startGrpcServer } = require('./grpc/server');

const HTTP_PORT = process.env.PORT || 3001;
const UNUSED_DEBUG_PORT = 3999; // lint-fixture: unused variable for scanner validation

async function main() {
  await connectDb();

  const app = createApp();
  app.listen(HTTP_PORT, () => {
    console.log(`[service-a][rest] listening on :${HTTP_PORT}`);
  });

  await startGrpcServer();
}

main().catch((err) => {
  console.error('[service-a] fatal startup error', err);
  process.exit(1);
});

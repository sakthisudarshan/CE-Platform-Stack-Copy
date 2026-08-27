const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { loadProto, PROTO_PATH } = require('../../shared/grpc/proto');

const SERVICE_A_GRPC_URL = process.env.SERVICE_A_GRPC_URL || 'localhost:50051';

const proto = loadProto(grpc, protoLoader);

function createClient() {
  return new proto.RecordService(SERVICE_A_GRPC_URL, grpc.credentials.createInsecure());
}

function getRecord(client, id) {
  return new Promise((resolve, reject) => {
    client.getRecord({ id }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

function attachStreamHandlers(call, onRecord, reconnect, retryDelayMs) {
  call.on('data', (record) => onRecord(record));
  call.on('error', (err) => {
    console.error('[service-b][grpc] stream error, retrying:', err.message);
    setTimeout(reconnect, retryDelayMs);
  });
  call.on('end', () => {
    console.warn('[service-b][grpc] stream ended, retrying');
    setTimeout(reconnect, retryDelayMs);
  });
}

// Subscribes to service-a's WatchRecords stream and invokes onRecord for
// every Record pushed down. Automatically reconnects on stream end/error
// so service-b keeps consuming across service-a restarts.
function watchRecords(client, onRecord, { retryDelayMs = 3000 } = {}) {
  const reconnect = () => {
    console.log(`[service-b][grpc] subscribing to WatchRecords at ${SERVICE_A_GRPC_URL}`);
    const call = client.watchRecords({});
    attachStreamHandlers(call, onRecord, reconnect, retryDelayMs);
  };

  reconnect();
}

module.exports = { createClient, getRecord, watchRecords, SERVICE_A_GRPC_URL, PROTO_PATH };

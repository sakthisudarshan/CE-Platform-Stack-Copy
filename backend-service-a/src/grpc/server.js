const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Record = require('../models/record.model');
const { recordEvents } = require('../events');

const PROTO_PATH = path.resolve(__dirname, '../../../shared/proto/record.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).ceplatform;

async function getRecord(call, callback) {
  try {
    const record = await Record.findById(call.request.id);
    if (!record) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'record not found' });
    }
    callback(null, record.toWire());
  } catch (err) {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  }
}

function watchRecords(call) {
  console.log('[service-a][grpc] client subscribed to WatchRecords');

  const onCreated = (wireRecord) => {
    call.write(wireRecord);
  };

  recordEvents.on('record:created', onCreated);

  call.on('cancelled', () => recordEvents.off('record:created', onCreated));
  call.on('error', () => recordEvents.off('record:created', onCreated));
  call.on('end', () => {
    recordEvents.off('record:created', onCreated);
    call.end();
  });
}

function startGrpcServer(port = process.env.GRPC_PORT || 50051) {
  const server = new grpc.Server();
  server.addService(proto.RecordService.service, {
    getRecord,
    watchRecords,
  });

  return new Promise((resolve, reject) => {
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) return reject(err);
      console.log(`[service-a][grpc] RecordService listening on :${boundPort}`);
      resolve(server);
    });
  });
}

module.exports = { startGrpcServer, proto, PROTO_PATH };

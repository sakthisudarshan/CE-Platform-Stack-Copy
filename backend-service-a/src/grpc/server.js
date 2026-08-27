const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Record = require('../models/record.model');
const { recordEvents } = require('../events');
const { loadProto, PROTO_PATH } = require('../../../shared/grpc/proto');

const proto = loadProto(grpc, protoLoader);

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

function unsubscribeRecordCreated(onCreated) {
  recordEvents.off('record:created', onCreated);
}

function watchRecords(call) {
  console.log('[service-a][grpc] client subscribed to WatchRecords');

  const onCreated = (wireRecord) => {
    call.write(wireRecord);
  };

  recordEvents.on('record:created', onCreated);

  const cleanup = () => unsubscribeRecordCreated(onCreated);

  call.on('cancelled', cleanup);
  call.on('error', cleanup);
  call.on('end', () => {
    cleanup();
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

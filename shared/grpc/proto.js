const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '../proto/record.proto');

const LOADER_OPTIONS = {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

function loadProto(grpc, protoLoader) {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, LOADER_OPTIONS);
  return grpc.loadPackageDefinition(packageDefinition).ceplatform;
}

module.exports = { loadProto, PROTO_PATH, LOADER_OPTIONS };

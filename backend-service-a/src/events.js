const { EventEmitter } = require('events');

// Fan-out point between the REST layer (producer, on record creation)
// and the gRPC WatchRecords server-streaming handler (consumer, one
// listener per connected client / service-b instance).
const recordEvents = new EventEmitter();
recordEvents.setMaxListeners(50);

module.exports = { recordEvents };

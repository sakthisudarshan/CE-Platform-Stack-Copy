const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

recordSchema.methods.toWire = function toWire() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description || '',
    createdAt: this.createdAt.toISOString(),
  };
};

module.exports = mongoose.model('Record', recordSchema);

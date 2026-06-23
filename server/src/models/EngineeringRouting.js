const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  sequenceNumber: {
    type: Number,
    required: true
  },
  operationName: {
    type: String,
    required: true
  },
  workCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: true
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  },
  standardTime: {
    type: Number, // In minutes
    required: true,
    min: 0
  },
  description: String
});

const engineeringRoutingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  routingNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  operations: [operationSchema]
}, { timestamps: true });

module.exports = mongoose.model('EngineeringRouting', engineeringRoutingSchema);

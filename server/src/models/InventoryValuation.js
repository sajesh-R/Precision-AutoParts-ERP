const mongoose = require('mongoose');

const inventoryValuationSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
    unique: true
  },
  fifoValuation: {
    type: Number,
    default: 0
  },
  weightedAverageCost: {
    type: Number,
    default: 0
  },
  lastCalculatedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryValuation', inventoryValuationSchema);

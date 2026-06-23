const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  transactionType: {
    type: String,
    enum: ['Goods Receipt', 'Material Issue', 'Stock Transfer', 'Stock Adjustment', 'Stock Return'],
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  sourceWarehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  destinationWarehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  quantity: {
    type: Number,
    required: true
    // Note: Positive means adding to destination, Negative means removing from source
  },
  referenceDocument: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

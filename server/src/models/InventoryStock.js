const mongoose = require('mongoose');

const inventoryStockSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0
  },
  postingDate: {
    type: Date,
    default: Date.now
  },
  sourceGrnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoodsReceipt'
  },
  status: {
    type: String,
    enum: ['Active', 'Quarantined', 'Consumed'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryStock', inventoryStockSchema);

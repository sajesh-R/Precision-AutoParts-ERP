const mongoose = require('mongoose');

const inventoryTraceabilitySchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  trackingType: {
    type: String,
    enum: ['Batch', 'Lot', 'Serial Number'],
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  referenceNumber: {
    type: String, // Actual lot/batch string provided by user or system
    required: true
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  originTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryTransaction'
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTraceability', inventoryTraceabilitySchema);

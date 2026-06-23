const mongoose = require('mongoose');

const productionOutputSchema = new mongoose.Schema({
  outputNumber: {
    type: String,
    required: true,
    unique: true
  },
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true
  },
  recordedDate: {
    type: Date,
    default: Date.now
  },
  goodQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  rejectedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  scrapQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  recordedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductionOutput', productionOutputSchema);

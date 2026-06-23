const mongoose = require('mongoose');

const demandConsolidationSchema = new mongoose.Schema({
  consolidationNumber: {
    type: String,
    required: true,
    unique: true
  },
  period: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  forecastDemand: {
    type: Number,
    default: 0
  },
  salesOrderDemand: {
    type: Number,
    default: 0
  },
  safetyStockRequirement: {
    type: Number,
    default: 0
  },
  totalGrossDemand: {
    type: Number,
    default: 0 // Will typically be forecastDemand + salesOrderDemand + safetyStockRequirement
  },
  status: {
    type: String,
    enum: ['Draft', 'Locked'],
    default: 'Draft'
  },
  notes: String
}, { timestamps: true });

demandConsolidationSchema.pre('save', function() {
  this.totalGrossDemand = (this.forecastDemand || 0) + (this.salesOrderDemand || 0) + (this.safetyStockRequirement || 0);
});

module.exports = mongoose.model('DemandConsolidation', demandConsolidationSchema);

const mongoose = require('mongoose');

const vendorPerformanceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  period: {
    type: String, // e.g. Oct-2026
    required: true
  },
  deliveryScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  costScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  leadTimeAnalysis: {
    type: String
  },
  overallRating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save to auto-calculate overall rating average
vendorPerformanceSchema.pre('save', function() {
  this.overallRating = (this.deliveryScore + this.qualityScore + this.costScore) / 3;
});

module.exports = mongoose.model('VendorPerformance', vendorPerformanceSchema);

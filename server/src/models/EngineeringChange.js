const mongoose = require('mongoose');

const engineeringChangeSchema = new mongoose.Schema({
  ecrNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Review', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  targetBomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EngineeringBOM'
  },
  targetRoutingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EngineeringRouting'
  },
  impactAnalysis: {
    bomImpact: String,
    routingImpact: String,
    productImpact: String
  },
  approvalHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['Submitted', 'Reviewed', 'Approved', 'Rejected'] },
    date: { type: Date, default: Date.now },
    comments: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('EngineeringChange', engineeringChangeSchema);

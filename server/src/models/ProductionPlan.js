const mongoose = require('mongoose');

const productionPlanSchema = new mongoose.Schema({
  planNumber: {
    type: String,
    required: true,
    unique: true
  },
  planDate: {
    type: Date,
    default: Date.now
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  plannedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  capacityValidated: {
    type: Boolean,
    default: false
  },
  notes: String,
  approvedBy: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ProductionPlan', productionPlanSchema);

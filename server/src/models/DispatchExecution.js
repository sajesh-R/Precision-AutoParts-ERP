const mongoose = require('mongoose');

const dispatchExecutionSchema = new mongoose.Schema({
  executionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dispatchPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DispatchPlan',
    required: true,
    unique: true
  },
  packing: {
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    packedBy: { type: String },
    packedDate: { type: Date },
    totalBoxes: { type: Number },
    notes: { type: String }
  },
  loading: {
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    loadingBay: { type: String },
    loadedBy: { type: String },
    loadedDate: { type: Date }
  },
  dispatch: {
    isConfirmed: { type: Boolean, default: false },
    confirmedBy: { type: String },
    dispatchDate: { type: Date },
    dispatchRemarks: { type: String }
  },
  overallStatus: {
    type: String,
    enum: ['Pending', 'Packing', 'Loading', 'Dispatched'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('DispatchExecution', dispatchExecutionSchema);

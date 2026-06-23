const mongoose = require('mongoose');

const allocatedMaterialSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  requiredQty: { type: Number, required: true },
  reservedQty: { type: Number, default: 0 },
  issuedQty: { type: Number, default: 0 },
  consumedQty: { type: Number, default: 0 }
});

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  productionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionPlan',
    required: true
  },
  materialId: { // Product to build
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  targetQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Created', 'Released', 'In-Progress', 'Completed', 'Closed'],
    default: 'Created'
  },
  materialStatus: {
    type: String,
    enum: ['Pending', 'Reserved', 'Issued', 'Consumed'],
    default: 'Pending'
  },
  allocatedMaterials: [allocatedMaterialSchema],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  actualStartDate: Date,
  actualEndDate: Date
}, { timestamps: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);

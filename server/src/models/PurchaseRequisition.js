const mongoose = require('mongoose');

const purchaseRequisitionSchema = new mongoose.Schema({
  requisitionNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  sourceType: {
    type: String,
    enum: ['Manual', 'MRP'],
    required: true
  },
  mrpRecommendationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MrpRecommendation'
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  requiredDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  approvalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('PurchaseRequisition', purchaseRequisitionSchema);

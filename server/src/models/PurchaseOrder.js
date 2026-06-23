const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  scheduledDeliveryDate: {
    type: Date,
    required: true
  }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRFQ'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [poItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Dispatched', 'Cancelled'],
    default: 'Pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['Not Scheduled', 'Scheduled', 'In-Transit', 'Delivered'],
    default: 'Not Scheduled'
  },
  approvalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesQuotation'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'In Production', 'Dispatched', 'Invoiced', 'Cancelled'],
    default: 'Draft'
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    unitPrice: Number,
    taxPercentage: Number,
    discountPercentage: Number,
    total: Number
  }],
  summary: {
    subTotal: Number,
    totalTax: Number,
    totalDiscount: Number,
    grandTotal: Number
  },
  atpCheck: {
    inventoryAvailable: { type: Boolean, default: false },
    capacityAvailable: { type: Boolean, default: false },
    deliveryFeasible: { type: Boolean, default: false },
    notes: String
  },
  deliveryCommitment: Date,
  trackingStatus: {
    orderStatus: { type: String, default: 'Created' },
    productionStatus: { type: String, default: 'Pending' },
    dispatchStatus: { type: String, default: 'Pending' },
    invoiceStatus: { type: String, default: 'Pending' }
  },
  approvalHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    date: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);

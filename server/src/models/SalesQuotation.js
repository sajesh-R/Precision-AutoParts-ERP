const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const quotationVersionSchema = new mongoose.Schema({
  revisionNumber: { type: String, required: true },
  validUntil: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Obsolete'],
    default: 'Draft'
  },
  items: [quotationItemSchema],
  summary: {
    subTotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  changeHistory: [{
    date: { type: Date, default: Date.now },
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }]
});

const salesQuotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInquiry'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  versions: [quotationVersionSchema],
  activeVersionId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

module.exports = mongoose.model('SalesQuotation', salesQuotationSchema);

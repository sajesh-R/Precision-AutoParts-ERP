const mongoose = require('mongoose');

const salesInquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Converted', 'Cancelled'],
    default: 'Draft'
  },
  requirements: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SalesInquiry', salesInquirySchema);

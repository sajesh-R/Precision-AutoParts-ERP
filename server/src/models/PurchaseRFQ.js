const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  quoteAmount: {
    type: Number,
    required: true
  },
  leadTimeDays: {
    type: Number,
    required: true
  },
  notes: String,
  selected: {
    type: Boolean,
    default: false
  }
});

const purchaseRFQSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  requisitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRequisition'
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  invitedVendors: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    sentDate: {
      type: Date,
      default: Date.now
    }
  }],
  receivedQuotations: [quotationSchema],
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Comparing', 'Closed', 'Cancelled'],
    default: 'Draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseRFQ', purchaseRFQSchema);

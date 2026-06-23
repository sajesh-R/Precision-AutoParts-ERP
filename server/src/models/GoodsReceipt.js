const mongoose = require('mongoose');

const goodsReceiptSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true
  },
  receiptDate: {
    type: Date,
    default: Date.now
  },
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  poQuantity: {
    type: Number,
    required: true
  },
  receivedQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Received', 'Inspecting', 'Posted', 'Cancelled'],
    default: 'Received'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('GoodsReceipt', goodsReceiptSchema);

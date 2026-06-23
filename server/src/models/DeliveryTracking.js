const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dispatchExecutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DispatchExecution',
    required: true,
    unique: true
  },
  currentLocation: {
    type: String,
    default: 'Dispatch Hub'
  },
  statusUpdates: [{
    location: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    remarks: { type: String }
  }],
  deliveryConfirmation: {
    isDelivered: { type: Boolean, default: false },
    deliveredDate: { type: Date },
    receiverName: { type: String },
    receiverContact: { type: String },
    proofNotes: { type: String }
  },
  overallStatus: {
    type: String,
    enum: ['In-Transit', 'Delivered', 'Exception'],
    default: 'In-Transit'
  }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryTracking', deliveryTrackingSchema);

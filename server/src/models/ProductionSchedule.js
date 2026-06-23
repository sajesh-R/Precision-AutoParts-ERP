const mongoose = require('mongoose');

const productionScheduleSchema = new mongoose.Schema({
  scheduleType: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  targetDate: {
    type: Date, // Represents the specific day, or start of week/month
    required: true
  },
  mrpRecommendationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MrpRecommendation'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  scheduledQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  assignedWorkCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter'
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'In-Progress', 'Completed'],
    default: 'Draft'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('ProductionSchedule', productionScheduleSchema);

const mongoose = require('mongoose');

const mrpRecommendationSchema = new mongoose.Schema({
  mrpRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MrpRun',
    required: true
  },
  suggestionType: {
    type: String,
    enum: ['Purchase', 'Production', 'Rescheduling'],
    required: true
  },
  itemModel: {
    type: String,
    enum: ['MasterMaterial', 'MasterProduct']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemModel'
  },
  suggestedQuantity: {
    type: Number,
    required: true
  },
  suggestedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Converted', 'Dismissed'],
    default: 'Pending'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('MrpRecommendation', mrpRecommendationSchema);

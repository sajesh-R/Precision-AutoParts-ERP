const mongoose = require('mongoose');

const mrpShortageSchema = new mongoose.Schema({
  mrpRunId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MrpRun',
    required: true
  },
  shortageType: {
    type: String,
    enum: ['RawMaterial', 'Component', 'ProductionConstraint'],
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
  shortageQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  constraintDetails: String
}, { timestamps: true });

module.exports = mongoose.model('MrpShortage', mrpShortageSchema);

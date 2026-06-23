const mongoose = require('mongoose');

const inventoryOptimizationSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
    unique: true
  },
  reorderLevel: {
    type: Number,
    default: 0
  },
  safetyStock: {
    type: Number,
    default: 0
  },
  abcClassification: {
    type: String,
    enum: ['A', 'B', 'C', 'Unclassified'],
    default: 'Unclassified'
  },
  isDeadStock: {
    type: Boolean,
    default: false
  },
  lastAnalysisDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryOptimization', inventoryOptimizationSchema);

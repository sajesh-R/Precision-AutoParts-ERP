const mongoose = require('mongoose');

const bomComponentSchema = new mongoose.Schema({
  componentType: {
    type: String,
    enum: ['Material', 'Product'],
    required: true
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  uomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UOM',
    required: true
  },
  scrapPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const bomVersionSchema = new mongoose.Schema({
  revisionNumber: {
    type: String,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Approved', 'Obsolete'],
    default: 'Draft'
  },
  components: [bomComponentSchema],
  changeHistory: [{
    date: { type: Date, default: Date.now },
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }]
});

const engineeringBOMSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bomNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  versions: [bomVersionSchema],
  activeVersionId: {
    type: mongoose.Schema.Types.ObjectId // Points to the currently active subdoc inside versions array
  }
}, { timestamps: true });

module.exports = mongoose.model('EngineeringBOM', engineeringBOMSchema);

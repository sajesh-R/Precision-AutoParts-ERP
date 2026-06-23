const mongoose = require('mongoose');

const materialCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory', required: true },
  
  specifications: [{
    key: String,
    value: String
  }],
  
  grade: { type: String },
  preferredVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  standardCost: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const MaterialCategory = mongoose.model('MaterialCategory', materialCategorySchema);
const Material = mongoose.model('Material', materialSchema);

module.exports = { MaterialCategory, Material };

const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const materialCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
materialCategorySchema.plugin(auditPlugin);

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory', required: true },
  uomId: { type: mongoose.Schema.Types.ObjectId, ref: 'UOM', required: true },
  grade: { type: String },
  standardCost: { type: Number, default: 0 },
  preferredVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  leadTimeDays: { type: Number, default: 0 },
  shelfLifeDays: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  defaultBinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
materialSchema.plugin(auditPlugin);

const MaterialCategory = mongoose.model('MaterialCategory', materialCategorySchema);
const Material = mongoose.model('Material', materialSchema);

module.exports = { MaterialCategory, Material };

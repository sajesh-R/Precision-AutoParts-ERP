const mongoose = require('mongoose');

const vendorCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorCategory', required: true },
  
  rating: { type: String, enum: ['A', 'B', 'C', 'D', 'Unrated'], default: 'Unrated' },
  leadTimeDays: { type: Number, default: 0 },
  paymentTerms: { type: String }, // e.g., Net 30, Net 60
  
  performanceTracking: {
    deliveryScore: { type: Number, min: 0, max: 100, default: 100 },
    qualityScore: { type: Number, min: 0, max: 100, default: 100 },
    serviceScore: { type: Number, min: 0, max: 100, default: 100 }
  },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const VendorCategory = mongoose.model('VendorCategory', vendorCategorySchema);
const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = { VendorCategory, Vendor };

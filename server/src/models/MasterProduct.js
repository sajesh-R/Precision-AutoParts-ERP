const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  
  specifications: [{
    key: String,
    value: String
  }],
  
  drawings: [{
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  currentRevision: { type: String, default: '1.0' },
  revisionHistory: [{
    revision: String,
    changes: String,
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  lifecycleStatus: { 
    type: String, 
    enum: ['Draft', 'Active', 'Inactive', 'Obsolete'], 
    default: 'Draft' 
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);
const Product = mongoose.model('Product', productSchema);

module.exports = { ProductCategory, Product };

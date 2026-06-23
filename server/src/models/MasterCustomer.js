const mongoose = require('mongoose');

const customerCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCategory', required: true },
  
  billingAddresses: [{
    label: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false }
  }],
  
  shippingAddresses: [{
    label: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    isDefault: { type: Boolean, default: false }
  }],
  
  creditLimit: { type: Number, default: 0 },
  paymentTerms: { type: String }, // e.g., Net 30, Net 60
  
  taxInformation: {
    taxId: String,
    taxType: String, // e.g., GST, VAT
    exempt: { type: Boolean, default: false }
  },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const CustomerCategory = mongoose.model('CustomerCategory', customerCategorySchema);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = { CustomerCategory, Customer };

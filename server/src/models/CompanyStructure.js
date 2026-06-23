const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String },
  taxId: { type: String },
  address: { type: String },
  contactEmail: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const businessUnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const costCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  CompanyProfile: mongoose.model('CompanyProfile', companyProfileSchema),
  Plant: mongoose.model('Plant', plantSchema),
  Branch: mongoose.model('Branch', branchSchema),
  Warehouse: mongoose.model('Warehouse', warehouseSchema),
  BusinessUnit: mongoose.model('BusinessUnit', businessUnitSchema),
  CostCenter: mongoose.model('CostCenter', costCenterSchema),
};

const mongoose = require('mongoose');
const auditPlugin = require('./plugins/auditPlugin');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
warehouseSchema.index({ code: 1, plantId: 1 }, { unique: true });
warehouseSchema.plugin(auditPlugin);

const storageLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
storageLocationSchema.plugin(auditPlugin);

const storageZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  storageLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
storageZoneSchema.plugin(auditPlugin);

const rackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageZone', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
rackSchema.plugin(auditPlugin);

const binSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  rackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
binSchema.plugin(auditPlugin);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
const StorageLocation = mongoose.model('StorageLocation', storageLocationSchema);
const StorageZone = mongoose.model('StorageZone', storageZoneSchema);
const Rack = mongoose.model('Rack', rackSchema);
const Bin = mongoose.model('Bin', binSchema);

module.exports = { Warehouse, StorageLocation, StorageZone, Rack, Bin };

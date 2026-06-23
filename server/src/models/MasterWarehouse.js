const mongoose = require('mongoose');

const storageLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const storageZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const rackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageZone', required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const binSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  rackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack', required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const StorageLocation = mongoose.model('StorageLocation', storageLocationSchema);
const StorageZone = mongoose.model('StorageZone', storageZoneSchema);
const Rack = mongoose.model('Rack', rackSchema);
const Bin = mongoose.model('Bin', binSchema);

module.exports = { StorageLocation, StorageZone, Rack, Bin };

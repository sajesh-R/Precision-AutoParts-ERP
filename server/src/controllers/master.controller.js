const mongoose = require('mongoose');
const { Customer, CustomerCategory } = require('../models/MasterCustomer');
const { Vendor, VendorCategory } = require('../models/MasterVendor');
const { Product, ProductCategory } = require('../models/MasterProduct');
const { Material, MaterialCategory } = require('../models/MasterMaterial');
const { UOM } = require('../models/MasterUOM');
const { StorageLocation, StorageZone, Rack, Bin } = require('../models/MasterWarehouse');
const { Machine } = require('../models/MasterMachine');
const { WorkCenter } = require('../models/MasterWorkCenter');

const getModelMap = () => ({
  'customer': Customer,
  'customercategory': CustomerCategory,
  'vendor': Vendor,
  'vendorcategory': VendorCategory,
  'product': Product,
  'productcategory': ProductCategory,
  'material': Material,
  'materialcategory': MaterialCategory,
  'uom': UOM,
  'storagelocation': StorageLocation,
  'storagezone': StorageZone,
  'rack': Rack,
  'bin': Bin,
  'machine': Machine,
  'workcenter': WorkCenter
});

// @desc    Get all records for a generic master model
// @route   GET /api/master/:model
exports.getAll = async (req, res) => {
  try {
    const Model = getModelMap()[req.params.model.toLowerCase()];
    if (!Model) return res.status(404).json({ success: false, message: 'Invalid module' });

    let query = Model.find();
    
    // Auto-populate logic based on common relationships
    if (Model === Customer || Model === Vendor || Model === Product || Model === Material) {
      query = query.populate('category');
    }
    if (Model === Rack) query = query.populate('zoneId');
    if (Model === Bin) query = query.populate('rackId');

    const data = await query.sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create record
// @route   POST /api/master/:model
exports.create = async (req, res) => {
  try {
    const Model = getModelMap()[req.params.model.toLowerCase()];
    if (!Model) return res.status(404).json({ success: false, message: 'Invalid module' });

    req.body.createdBy = req.user._id;
    const doc = await Model.create(req.body);
    
    // Create Audit Log (simplified for master data)
    const { AuditLog } = require('../models/Audit');
    await AuditLog.create({
      changedBy: req.user._id,
      action: 'Create',
      module: 'MasterData',
      recordId: doc._id,
      newValue: { message: `Created new ${req.params.model} record: ${req.body.name || req.body.code || 'Item'}` }
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update record
// @route   PUT /api/master/:model/:id
exports.update = async (req, res) => {
  try {
    const Model = getModelMap()[req.params.model.toLowerCase()];
    if (!Model) return res.status(404).json({ success: false, message: 'Invalid module' });

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Record not found' });

    // Create Audit Log
    const { AuditLog } = require('../models/Audit');
    await AuditLog.create({
      changedBy: req.user._id,
      action: 'Update',
      module: 'MasterData',
      recordId: doc._id,
      newValue: { message: `Updated ${req.params.model} record: ${doc.name || doc.code || 'Item'}` }
    });

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete record
// @route   DELETE /api/master/:model/:id
exports.remove = async (req, res) => {
  try {
    const Model = getModelMap()[req.params.model.toLowerCase()];
    if (!Model) return res.status(404).json({ success: false, message: 'Invalid module' });

    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Record not found' });

    // Create Audit Log
    const { AuditLog } = require('../models/Audit');
    await AuditLog.create({
      changedBy: req.user._id,
      action: 'Delete',
      module: 'MasterData',
      recordId: doc._id,
      newValue: { message: `Deleted ${req.params.model} record: ${doc.name || doc.code || 'Item'}` }
    });

    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

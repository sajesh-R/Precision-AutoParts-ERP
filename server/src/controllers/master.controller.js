const { handleError } = require('../utils/errorHandler');
const mongoose = require('mongoose');
const { Customer, CustomerCategory } = require('../models/MasterCustomer');
const { Vendor, VendorCategory } = require('../models/MasterVendor');
const { Product, ProductCategory } = require('../models/MasterProduct');
const { Material, MaterialCategory } = require('../models/MasterMaterial');
const { UOM, UOMConversion } = require('../models/MasterUOM');
const { Currency } = require('../models/MasterCurrency');
const { Tax } = require('../models/MasterTax');
const { PaymentTerms } = require('../models/MasterPaymentTerms');
const { DocumentSeries } = require('../models/MasterDocumentSeries');
const { Warehouse, StorageLocation, StorageZone, Rack, Bin } = require('../models/MasterWarehouse');
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
  'uomconversion': UOMConversion,
  'currency': Currency,
  'tax': Tax,
  'paymentterms': PaymentTerms,
  'documentseries': DocumentSeries,
  'warehouse': Warehouse,
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

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    let query = Model.find({ status: { $ne: 'Inactive' } });
    
    // Auto-populate logic based on common relationships
    if (Model === Customer || Model === Vendor || Model === Product || Model === Material) {
      query = query.populate('categoryId');
    }
    if (Model === UOMConversion) query = query.populate('fromUOM toUOM');
    if (Model === Warehouse) query = query.populate('plantId');
    if (Model === StorageLocation) query = query.populate('warehouseId');
    if (Model === StorageZone) query = query.populate('storageLocationId');
    if (Model === Rack) query = query.populate('zoneId');
    if (Model === Bin) query = query.populate('rackId');
    if (Model === WorkCenter) query = query.populate('plantId departmentId');
    if (Model === Machine) query = query.populate('plantId departmentId workCenterId uomId');

    const total = await Model.countDocuments({ status: { $ne: 'Inactive' } });
    const data = await query.sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    res.status(200).json({ 
      success: true, 
      count: data.length, 
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data 
    });
  } catch (error) {
    handleError(res, error);
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
    handleError(res, error);
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
    handleError(res, error);
  }
};

// @desc    Delete record
// @route   DELETE /api/master/:model/:id
exports.remove = async (req, res) => {
  try {
    const Model = getModelMap()[req.params.model.toLowerCase()];
    if (!Model) return res.status(404).json({ success: false, message: 'Invalid module' });

    const doc = await Model.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true });
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
    handleError(res, error);
  }
};

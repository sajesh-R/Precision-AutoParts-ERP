const { handleError } = require('../utils/errorHandler');
const EngineeringBOM = require('../models/EngineeringBOM');
const EngineeringRouting = require('../models/EngineeringRouting');
const EngineeringChange = require('../models/EngineeringChange');
const MasterProduct = require('../models/MasterProduct');
const { AuditLog } = require('../models/Audit');

// Helper for Auditing
const logAudit = async (action, entityType, entityId, userId, changes) => {
  try {
    await AuditLog.create({
      action,
      module: entityType,
      recordId: entityId,
      changedBy: userId,
      newValue: changes || null
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// ================= BOM Management =================

exports.getAllBOMs = async (req, res) => {
  try {
    const boms = await EngineeringBOM.find().populate('productId', 'name code').sort({ updatedAt: -1 });
    res.json({ success: true, data: boms });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getBOMById = async (req, res) => {
  try {
    const bom = await EngineeringBOM.findById(req.params.id)
      .populate('productId', 'name code')
      .populate('versions.components.materialId', 'name code standardCost')
      .populate('versions.components.productId', 'name code')
      .populate('versions.components.uomId', 'name symbol');
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });
    res.json({ success: true, data: bom });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createBOM = async (req, res) => {
  try {
    const { productId, bomNumber, description, components } = req.body;
    
    // Create first draft version
    const initialVersion = {
      revisionNumber: '1.0',
      effectiveDate: new Date(),
      status: 'Draft',
      components: components || [],
      changeHistory: [{
        action: 'Initial Creation',
        user: req.user._id,
        notes: 'Draft BOM created'
      }]
    };

    const newBOM = await EngineeringBOM.create({
      productId,
      bomNumber,
      description,
      versions: [initialVersion]
    });

    // Set activeVersionId to this first version temporarily
    newBOM.activeVersionId = newBOM.versions[0]._id;
    await newBOM.save();

    await logAudit('CREATE', 'EngineeringBOM', newBOM._id, req.user._id);
    res.status(201).json({ success: true, data: newBOM });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateBOM = async (req, res) => {
  try {
    const updated = await EngineeringBOM.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit('UPDATE', 'EngineeringBOM', updated._id, req.user._id);
    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(res, error);
  }
};

exports.addBOMRevision = async (req, res) => {
  try {
    const bom = await EngineeringBOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    const { revisionNumber, effectiveDate, components, notes } = req.body;
    
    bom.versions.push({
      revisionNumber,
      effectiveDate,
      status: 'Draft',
      components: components || [],
      changeHistory: [{
        action: 'Revision Created',
        user: req.user._id,
        notes: notes || 'New revision added'
      }]
    });

    await bom.save();
    await logAudit('REVISION_ADD', 'EngineeringBOM', bom._id, req.user._id, { revisionNumber });
    res.json({ success: true, data: bom });
  } catch (error) {
    handleError(res, error);
  }
};

exports.changeBOMVersionStatus = async (req, res) => {
  try {
    const { versionId, status, notes } = req.body;
    const bom = await EngineeringBOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, message: 'BOM not found' });

    const version = bom.versions.id(versionId);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    version.status = status;
    version.changeHistory.push({
      action: `Status changed to ${status}`,
      user: req.user._id,
      notes: notes || ''
    });

    // If approving, maybe auto-obsolete others and set as active
    if (status === 'Approved') {
      bom.versions.forEach(v => {
        if (v._id.toString() !== versionId.toString() && v.status === 'Approved') {
          v.status = 'Obsolete';
        }
      });
      bom.activeVersionId = version._id;
    }

    await bom.save();
    await logAudit('STATUS_CHANGE', 'EngineeringBOM', bom._id, req.user._id, { versionId, status });
    res.json({ success: true, data: bom });
  } catch (error) {
    handleError(res, error);
  }
};


// ================= Routing Management =================

exports.getAllRoutings = async (req, res) => {
  try {
    const routings = await EngineeringRouting.find().populate('productId', 'name code').sort({ updatedAt: -1 });
    res.json({ success: true, data: routings });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getRoutingById = async (req, res) => {
  try {
    const routing = await EngineeringRouting.findById(req.params.id)
      .populate('productId', 'name code')
      .populate('operations.workCenterId', 'name code')
      .populate('operations.machineId', 'name code');
    if (!routing) return res.status(404).json({ success: false, message: 'Routing not found' });
    res.json({ success: true, data: routing });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createRouting = async (req, res) => {
  try {
    const newRouting = await EngineeringRouting.create(req.body);
    await logAudit('CREATE', 'EngineeringRouting', newRouting._id, req.user._id);
    res.status(201).json({ success: true, data: newRouting });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateRouting = async (req, res) => {
  try {
    const updated = await EngineeringRouting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit('UPDATE', 'EngineeringRouting', updated._id, req.user._id);
    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(res, error);
  }
};


// ================= Engineering Change Management (ECM) =================

exports.getAllChanges = async (req, res) => {
  try {
    const changes = await EngineeringChange.find()
      .populate('targetBomId', 'bomNumber')
      .populate('targetRoutingId', 'routingNumber')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: changes });
  } catch (error) {
    handleError(res, error);
  }
};

exports.createChange = async (req, res) => {
  try {
    const newChange = await EngineeringChange.create({
      ...req.body,
      approvalHistory: [{
        user: req.user._id,
        action: 'Submitted',
        comments: 'Initial ECR creation'
      }]
    });
    await logAudit('CREATE', 'EngineeringChange', newChange._id, req.user._id);
    res.status(201).json({ success: true, data: newChange });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateChangeStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;
    const change = await EngineeringChange.findById(req.params.id);
    if (!change) return res.status(404).json({ success: false, message: 'Change Request not found' });

    change.status = status;
    change.approvalHistory.push({
      user: req.user._id,
      action: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Reviewed',
      comments: comments || ''
    });

    await change.save();
    await logAudit('STATUS_UPDATE', 'EngineeringChange', change._id, req.user._id, { status });
    res.json({ success: true, data: change });
  } catch (error) {
    handleError(res, error);
  }
};

const { handleError } = require('../utils/errorHandler');
const PurchaseRequisition = require('../models/PurchaseRequisition');
const PurchaseRFQ = require('../models/PurchaseRFQ');
const PurchaseOrder = require('../models/PurchaseOrder');
const VendorPerformance = require('../models/VendorPerformance');
const MrpRecommendation = require('../models/MrpRecommendation');
const { AuditLog } = require('../models/Audit');

const logAudit = async (action, entityType, entityId, userId, changes) => {
  try {
    await AuditLog.create({
      action,
      module: entityType,
      recordId: entityId,
      changedBy: userId,
      newValue: changes || null
    });
  } catch (err) { console.error('Audit Log Error:', err); }
};

// ================= Purchase Requisition =================

exports.getAllRequisitions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const reqs = await PurchaseRequisition.find()
      .populate('materialId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await PurchaseRequisition.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: reqs });
  } catch (error) { handleError(res, error); }
};

exports.createRequisition = async (req, res) => {
  try {
    // Generate PR Number
    req.body.requisitionNumber = `PR-${Date.now().toString().slice(-6)}`;
    const newReq = await PurchaseRequisition.create(req.body);
    
    // If from MRP, update recommendation status
    if (req.body.sourceType === 'MRP' && req.body.mrpRecommendationId) {
      await MrpRecommendation.findByIdAndUpdate(req.body.mrpRecommendationId, { status: 'Converted' });
    }

    await logAudit('CREATE', 'PurchaseRequisition', newReq._id, req.user._id);
    res.status(201).json({ success: true, data: newReq });
  } catch (error) { handleError(res, error); }
};

exports.updateRequisitionStatus = async (req, res) => {
  try {
    const { status, approvalNotes } = req.body;
    const reqDoc = await PurchaseRequisition.findByIdAndUpdate(req.params.id, { status, approvalNotes }, { new: true });
    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }
    await logAudit('UPDATE_STATUS', 'PurchaseRequisition', reqDoc._id, req.user._id, { status });
    res.json({ success: true, data: reqDoc });
  } catch (error) { handleError(res, error); }
};

// ================= Request for Quotation (RFQ) =================

exports.getAllRFQs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const rfqs = await PurchaseRFQ.find()
      .populate('materialId', 'name code')
      .populate('invitedVendors.vendorId', 'name code')
      .populate('receivedQuotations.vendorId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await PurchaseRFQ.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: rfqs });
  } catch (error) { handleError(res, error); }
};

exports.createRFQ = async (req, res) => {
  try {
    req.body.rfqNumber = `RFQ-${Date.now().toString().slice(-6)}`;
    const newRfq = await PurchaseRFQ.create(req.body);
    await logAudit('CREATE', 'PurchaseRFQ', newRfq._id, req.user._id);
    res.status(201).json({ success: true, data: newRfq });
  } catch (error) { handleError(res, error); }
};

exports.addQuotation = async (req, res) => {
  try {
    const rfq = await PurchaseRFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ success: false, message: 'Not found' });
    
    rfq.receivedQuotations.push(req.body);
    rfq.status = 'Comparing';
    await rfq.save();
    
    await logAudit('ADD_QUOTATION', 'PurchaseRFQ', rfq._id, req.user._id);
    res.json({ success: true, data: rfq });
  } catch (error) { handleError(res, error); }
};

exports.selectQuotation = async (req, res) => {
  try {
    const rfq = await PurchaseRFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'Purchase RFQ not found' });
    }
    const quoteId = req.params.quoteId;
    
    rfq.receivedQuotations.forEach(q => {
      q.selected = q._id.toString() === quoteId;
    });
    rfq.status = 'Closed';
    await rfq.save();
    
    await logAudit('SELECT_QUOTATION', 'PurchaseRFQ', rfq._id, req.user._id);
    res.json({ success: true, data: rfq });
  } catch (error) { handleError(res, error); }
};

// ================= Purchase Order =================

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const pos = await PurchaseOrder.find()
      .populate('vendorId', 'name code')
      .populate('items.materialId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await PurchaseOrder.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: pos });
  } catch (error) { handleError(res, error); }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    req.body.poNumber = `PO-${Date.now().toString().slice(-6)}`;
    
    // Auto calculate total
    let total = 0;
    if (req.body.items) {
      req.body.items.forEach(item => {
        item.total = item.quantity * item.unitPrice;
        total += item.total;
      });
    }
    req.body.totalAmount = total;

    const newPo = await PurchaseOrder.create(req.body);
    await logAudit('CREATE', 'PurchaseOrder', newPo._id, req.user._id);
    res.status(201).json({ success: true, data: newPo });
  } catch (error) { handleError(res, error); }
};

exports.updatePOStatus = async (req, res) => {
  try {
    const { status, deliveryStatus } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    
    if (status === 'Approved' && po.status !== 'Approved') {
      return res.status(403).json({ success: false, message: 'Status cannot be manually set to Approved. It must go through the Approval Center.' });
    }

    if (status) po.status = status;
    if (deliveryStatus) po.deliveryStatus = deliveryStatus;
    await po.save();
    
    await logAudit('UPDATE_PO', 'PurchaseOrder', po._id, req.user._id, { status, deliveryStatus });
    res.json({ success: true, data: po });
  } catch (error) { handleError(res, error); }
};

// ================= Vendor Performance =================

exports.getAllPerformances = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const perfs = await VendorPerformance.find()
      .populate('vendorId', 'name code')
      .sort({ period: -1 })
      .skip(skip).limit(limit);
      
    const total = await VendorPerformance.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: perfs });
  } catch (error) { handleError(res, error); }
};

exports.createPerformance = async (req, res) => {
  try {
    const perf = await VendorPerformance.create(req.body);
    await logAudit('CREATE', 'VendorPerformance', perf._id, req.user._id);
    res.status(201).json({ success: true, data: perf });
  } catch (error) { handleError(res, error); }
};

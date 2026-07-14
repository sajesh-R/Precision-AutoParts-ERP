const SalesInquiry = require('../models/SalesInquiry');
const SalesQuotation = require('../models/SalesQuotation');
const SalesOrder = require('../models/SalesOrder');
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

// ================= Inquiry Management =================

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await SalesInquiry.find().populate('customerId', 'name code').sort({ updatedAt: -1 });
    res.json({ success: true, data: inquiries });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createInquiry = async (req, res) => {
  try {
    const newInquiry = await SalesInquiry.create(req.body);
    await logAudit('CREATE', 'SalesInquiry', newInquiry._id, req.user._id);
    res.status(201).json({ success: true, data: newInquiry });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateInquiry = async (req, res) => {
  try {
    const updated = await SalesInquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Sales inquiry not found' });
    await logAudit('UPDATE', 'SalesInquiry', updated._id, req.user._id);
    res.json({ success: true, data: updated });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Quotation Management =================

exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await SalesQuotation.find()
      .populate('customerId', 'name code')
      .populate('inquiryId', 'inquiryNumber')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createQuotation = async (req, res) => {
  try {
    const { quotationNumber, inquiryId, customerId, items, summary, validUntil } = req.body;
    
    const initialVersion = {
      revisionNumber: '1.0',
      validUntil: validUntil || new Date(Date.now() + 30*24*60*60*1000), // Default 30 days
      status: 'Draft',
      items: items || [],
      summary: summary || { subTotal: 0, totalTax: 0, totalDiscount: 0, grandTotal: 0 },
      changeHistory: [{ action: 'Initial Creation', user: req.user._id, notes: 'Draft Quotation created' }]
    };

    const newQuotation = await SalesQuotation.create({
      quotationNumber, inquiryId, customerId, versions: [initialVersion]
    });
    newQuotation.activeVersionId = newQuotation.versions[0]._id;
    await newQuotation.save();

    await logAudit('CREATE', 'SalesQuotation', newQuotation._id, req.user._id);
    res.status(201).json({ success: true, data: newQuotation });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.changeQuotationStatus = async (req, res) => {
  try {
    const { versionId, status, notes } = req.body;
    const quotation = await SalesQuotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const version = quotation.versions.id(versionId);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    version.status = status;
    version.changeHistory.push({ action: `Status changed to ${status}`, user: req.user._id, notes: notes || '' });

    if (status === 'Approved') {
      quotation.versions.forEach(v => {
        if (v._id.toString() !== versionId.toString() && v.status === 'Approved') v.status = 'Obsolete';
      });
      quotation.activeVersionId = version._id;
    }

    await quotation.save();
    await logAudit('STATUS_CHANGE', 'SalesQuotation', quotation._id, req.user._id, { versionId, status });
    res.json({ success: true, data: quotation });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Sales Order Management =================

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find()
      .populate('customerId', 'name code')
      .populate('quotationId', 'quotationNumber')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createOrder = async (req, res) => {
  try {
    const newOrder = await SalesOrder.create({
      ...req.body,
      approvalHistory: [{ user: req.user._id, action: 'Created', notes: 'Initial Order Creation' }]
    });
    await logAudit('CREATE', 'SalesOrder', newOrder._id, req.user._id);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.trackingStatus.orderStatus = status;
    order.approvalHistory.push({ user: req.user._id, action: `Status changed to ${status}`, notes: notes || '' });

    await order.save();
    await logAudit('STATUS_UPDATE', 'SalesOrder', order._id, req.user._id, { status });
    res.json({ success: true, data: order });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.performATPCheck = async (req, res) => {
  try {
    const { inventoryAvailable, capacityAvailable, deliveryFeasible, notes, deliveryCommitment } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.atpCheck = { inventoryAvailable, capacityAvailable, deliveryFeasible, notes };
    if (deliveryCommitment) order.deliveryCommitment = deliveryCommitment;

    await order.save();
    await logAudit('ATP_CHECK', 'SalesOrder', order._id, req.user._id, order.atpCheck);
    res.json({ success: true, data: order });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateTracking = async (req, res) => {
  try {
    const { trackingStatus } = req.body;
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, { $set: { trackingStatus } }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Sales order not found' });
    await logAudit('TRACKING_UPDATE', 'SalesOrder', order._id, req.user._id, trackingStatus);
    res.json({ success: true, data: order });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Sales order not found' });
    await logAudit('UPDATE', 'SalesOrder', order._id, req.user._id);
    res.json({ success: true, data: order });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


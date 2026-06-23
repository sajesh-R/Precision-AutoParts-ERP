const GoodsReceipt = require('../models/GoodsReceipt');
const QualityInspection = require('../models/QualityInspection');
const InventoryStock = require('../models/InventoryStock');
const PurchaseOrder = require('../models/PurchaseOrder');
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

// ================= Goods Receipt Note (GRN) =================

exports.getAllGRNs = async (req, res) => {
  try {
    const grns = await GoodsReceipt.find()
      .populate('purchaseOrderId', 'poNumber')
      .populate('vendorId', 'name code')
      .populate('materialId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: grns });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createGRN = async (req, res) => {
  try {
    // Basic validation against PO
    const po = await PurchaseOrder.findById(req.body.purchaseOrderId);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    if (po.status !== 'Approved' && po.status !== 'Dispatched') {
      return res.status(400).json({ success: false, message: 'PO must be Approved or Dispatched to receive goods' });
    }

    req.body.grnNumber = `GRN-${Date.now().toString().slice(-6)}`;
    const newGrn = await GoodsReceipt.create(req.body);

    // Auto-create pending inspection ticket
    const inspectionNumber = `INSP-${Date.now().toString().slice(-6)}`;
    await QualityInspection.create({
      inspectionNumber,
      grnId: newGrn._id,
      inspectedQuantity: newGrn.receivedQuantity,
      inspectorName: 'Unassigned',
      inspectionStatus: 'Pending'
    });
    
    // Update GRN status
    newGrn.status = 'Inspecting';
    await newGrn.save();

    await logAudit('CREATE', 'GoodsReceipt', newGrn._id, req.user._id);
    res.status(201).json({ success: true, data: newGrn });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Quality Inspection =================

exports.getAllInspections = async (req, res) => {
  try {
    const inspections = await QualityInspection.find()
      .populate({
        path: 'grnId',
        select: 'grnNumber materialId vendorId receivedQuantity',
        populate: [
          { path: 'materialId', select: 'name code' },
          { path: 'vendorId', select: 'name code' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: inspections });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateInspection = async (req, res) => {
  try {
    const { acceptedQuantity, rejectedQuantity, holdQuantity, inspectorName, inspectionStatus, remarks } = req.body;
    
    const insp = await QualityInspection.findById(req.params.id).populate('grnId');
    if (!insp) return res.status(404).json({ success: false, message: 'Not found' });

    // Validate quantities match total
    const totalInput = Number(acceptedQuantity) + Number(rejectedQuantity) + Number(holdQuantity);
    if (totalInput > insp.inspectedQuantity) {
      return res.status(400).json({ success: false, message: 'Sum of parts cannot exceed total inspected quantity' });
    }

    Object.assign(insp, { acceptedQuantity, rejectedQuantity, holdQuantity, inspectorName, inspectionStatus, remarks });
    await insp.save();

    await logAudit('UPDATE', 'QualityInspection', insp._id, req.user._id);
    res.json({ success: true, data: insp });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Inventory Posting =================

exports.getAllInventoryStocks = async (req, res) => {
  try {
    const stocks = await InventoryStock.find()
      .populate('materialId', 'name code')
      .populate('warehouseId', 'name code')
      .populate('sourceGrnId', 'grnNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: stocks });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.postToInventory = async (req, res) => {
  try {
    const { inspectionId, warehouseId } = req.body;
    
    const insp = await QualityInspection.findById(inspectionId).populate('grnId');
    if (!insp) return res.status(404).json({ success: false, message: 'Inspection not found' });
    if (insp.inspectionStatus !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Inspection must be Completed to post to inventory' });
    }
    if (insp.acceptedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'No accepted quantity to post' });
    }

    // Generate Batch and Create Stock Record
    const batchNumber = `BATCH-${Date.now().toString().slice(-6)}`;
    const newStock = await InventoryStock.create({
      batchNumber,
      materialId: insp.grnId.materialId,
      warehouseId,
      quantityAvailable: insp.acceptedQuantity,
      sourceGrnId: insp.grnId._id,
      status: 'Active'
    });

    // Mark GRN as Posted
    await GoodsReceipt.findByIdAndUpdate(insp.grnId._id, { status: 'Posted' });

    await logAudit('INVENTORY_POST', 'InventoryStock', newStock._id, req.user._id, { batchNumber });
    res.status(201).json({ success: true, data: newStock });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

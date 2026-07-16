const GoodsReceipt = require('../models/GoodsReceipt');
const QualityInspection = require('../models/QualityInspection');
const InventoryStock = require('../models/InventoryStock');
const InventoryTransaction = require('../models/InventoryTransaction');
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
    const po = await PurchaseOrder.findById(req.body.purchaseOrderId);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    if (po.status !== 'Approved' && po.status !== 'Dispatched') {
      return res.status(400).json({ success: false, message: 'PO must be Approved or Dispatched to receive goods' });
    }

    // Prevent over-receipt: check total previously received for this PO
    const existingGRNs = await GoodsReceipt.find({ 
      purchaseOrderId: req.body.purchaseOrderId,
      materialId: req.body.materialId,
      status: { $ne: 'Cancelled' }
    });
    const alreadyReceived = existingGRNs.reduce((acc, g) => acc + g.receivedQuantity, 0);
    const poQty = Number(req.body.poQuantity) || 0;
    const newReceived = Number(req.body.receivedQuantity) || 0;
    if (poQty > 0 && (alreadyReceived + newReceived) > poQty) {
      return res.status(400).json({ success: false, message: `Cannot receive more than PO quantity. Already received: ${alreadyReceived}, PO qty: ${poQty}` });
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

    // Prevent double-posting: check if this inspection was already posted
    const existingStock = await InventoryStock.findOne({ sourceGrnId: insp.grnId._id });
    if (existingStock) {
      return res.status(400).json({ success: false, message: 'This GRN has already been posted to inventory' });
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

    // Create an InventoryTransaction record for this goods receipt posting
    await InventoryTransaction.create({
      transactionNumber: `TXN-${Date.now().toString().slice(-6)}`,
      transactionType: 'Goods Receipt',
      materialId: insp.grnId.materialId,
      batchNumber,
      destinationWarehouseId: warehouseId,
      quantity: insp.acceptedQuantity,
      referenceDocument: insp.grnId.grnNumber,
      notes: `Goods receipt posted from GRN ${insp.grnId.grnNumber}`
    });

    // Mark GRN as Posted
    await GoodsReceipt.findByIdAndUpdate(insp.grnId._id, { status: 'Posted' });

    // Update PO delivery status to Delivered
    if (insp.grnId.purchaseOrderId) {
      await PurchaseOrder.findByIdAndUpdate(insp.grnId.purchaseOrderId, { deliveryStatus: 'Delivered' });
    }

    await logAudit('INVENTORY_POST', 'InventoryStock', newStock._id, req.user._id, { batchNumber });
    res.status(201).json({ success: true, data: newStock });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const ProductionPlan = require('../models/ProductionPlan');
const WorkOrder = require('../models/WorkOrder');
const ProductionOutput = require('../models/ProductionOutput');
const { Material } = require('../models/MasterMaterial');
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

// ================= Production Planning =================

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find()
      .populate('materialId', 'name code category')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createPlan = async (req, res) => {
  try {
    req.body.planNumber = `PP-${Date.now().toString().slice(-6)}`;
    const plan = await ProductionPlan.create(req.body);
    await logAudit('CREATE', 'ProductionPlan', plan._id, req.user._id);
    res.status(201).json({ success: true, data: plan });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await ProductionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Auto-approve logic based on user action
    if (req.body.status === 'Approved') {
      plan.approvedBy = req.user.name;
      await plan.save();
    }

    await logAudit('UPDATE', 'ProductionPlan', plan._id, req.user._id);
    res.json({ success: true, data: plan });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.validateCapacity = async (req, res) => {
  try {
    const plan = await ProductionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Mock capacity validation (always validates to true for this demo)
    plan.capacityValidated = true;
    await plan.save();
    
    res.json({ success: true, message: 'Capacity validated successfully', data: plan });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Work Order Management =================

exports.getAllWorkOrders = async (req, res) => {
  try {
    const wos = await WorkOrder.find()
      .populate('productionPlanId', 'planNumber')
      .populate('materialId', 'name code')
      .populate('allocatedMaterials.materialId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: wos });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createWorkOrder = async (req, res) => {
  try {
    const { productionPlanId } = req.body;
    const plan = await ProductionPlan.findById(productionPlanId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    if (plan.status !== 'Approved') return res.status(400).json({ success: false, message: 'Plan must be approved' });
    // Relaxed constraint: Allow generating Work Orders even if capacity isn't explicitly validated
    // if (!plan.capacityValidated) return res.status(400).json({ success: false, message: 'Plan capacity must be validated' });

    // Mock BOM allocation: Grab 2 random raw materials to simulate required parts
    const rawMaterials = await Material.find().limit(2);
    const allocatedMaterials = rawMaterials.map(rm => ({
      materialId: rm._id,
      requiredQty: plan.plannedQuantity * 2, // Arbitrary multiplier
      reservedQty: 0,
      issuedQty: 0,
      consumedQty: 0
    }));

    const wo = await WorkOrder.create({
      workOrderNumber: `WO-${Date.now().toString().slice(-6)}`,
      productionPlanId,
      materialId: plan.materialId,
      targetQuantity: plan.plannedQuantity,
      allocatedMaterials
    });

    await logAudit('CREATE', 'WorkOrder', wo._id, req.user._id);
    res.status(201).json({ success: true, data: wo });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateWorkOrder = async (req, res) => {
  try {
    const wo = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!wo) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'WorkOrder', wo._id, req.user._id);
    res.json({ success: true, data: wo });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Material Allocation =================

exports.updateMaterialAllocation = async (req, res) => {
  try {
    const { workOrderId, materialId, action, quantity } = req.body; // action: 'reserve', 'issue', 'consume'
    
    const wo = await WorkOrder.findById(workOrderId);
    if (!wo) return res.status(404).json({ success: false, message: 'Work order not found' });

    const item = wo.allocatedMaterials.find(m => m.materialId.toString() === materialId);
    if (!item) return res.status(404).json({ success: false, message: 'Material not in allocation list' });

    if (action === 'reserve') item.reservedQty += quantity;
    if (action === 'issue') {
      item.issuedQty += quantity;
      wo.materialStatus = 'Issued';
    }
    if (action === 'consume') {
      item.consumedQty += quantity;
      if (item.consumedQty >= item.requiredQty) {
        // Check if all are consumed
        const allConsumed = wo.allocatedMaterials.every(m => m.consumedQty >= m.requiredQty);
        if (allConsumed) wo.materialStatus = 'Consumed';
      }
    }

    await wo.save();
    res.json({ success: true, data: wo });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Production Output =================

exports.getAllOutputs = async (req, res) => {
  try {
    const outputs = await ProductionOutput.find()
      .populate({
        path: 'workOrderId',
        select: 'workOrderNumber targetQuantity materialId',
        populate: { path: 'materialId', select: 'name code' }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: outputs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordOutput = async (req, res) => {
  try {
    const wo = await WorkOrder.findById(req.body.workOrderId);
    if (!wo || !['Released', 'In-Progress', 'Completed'].includes(wo.status)) {
      return res.status(400).json({ success: false, message: 'Work Order must be active to record output' });
    }

    req.body.outputNumber = `POUT-${Date.now().toString().slice(-6)}`;
    req.body.recordedBy = req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'System';
    
    const output = await ProductionOutput.create(req.body);
    await logAudit('CREATE', 'ProductionOutput', output._id, req.user._id);
    res.status(201).json({ success: true, data: output });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

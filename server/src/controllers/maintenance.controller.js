const { handleError } = require('../utils/errorHandler');
const MaintenancePreventive = require('../models/MaintenancePreventive');
const MaintenanceBreakdown = require('../models/MaintenanceBreakdown');
const MaintenanceSparePart = require('../models/MaintenanceSparePart');
const { Material: MasterMaterial } = require('../models/MasterMaterial');
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

// ================= Preventive Maintenance =================

exports.getAllPreventive = async (req, res) => {
  try {
    const pm = await MaintenancePreventive.find()
      .populate('machineId', 'name code')
      .sort({ scheduledDate: 1 });
    res.json({ success: true, data: pm });
  } catch (error) { handleError(res, error); }
};

exports.createPreventive = async (req, res) => {
  try {
    req.body.scheduleNumber = `PM-${Date.now().toString().slice(-6)}`;
    const pm = await MaintenancePreventive.create(req.body);
    await logAudit('CREATE', 'MaintenancePreventive', pm._id, req.user._id);
    res.status(201).json({ success: true, data: pm });
  } catch (error) { handleError(res, error); }
};

exports.updatePreventive = async (req, res) => {
  try {
    if (req.body.status === 'Completed' && !req.body.executionDate) {
      req.body.executionDate = new Date();
    }
    const pm = await MaintenancePreventive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pm) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'MaintenancePreventive', pm._id, req.user._id);
    res.json({ success: true, data: pm });
  } catch (error) { handleError(res, error); }
};

// ================= Breakdown Maintenance =================

exports.getAllBreakdowns = async (req, res) => {
  try {
    const bd = await MaintenanceBreakdown.find()
      .populate('machineId', 'name code')
      .sort({ reportedDate: -1 });
    res.json({ success: true, data: bd });
  } catch (error) { handleError(res, error); }
};

exports.reportBreakdown = async (req, res) => {
  try {
    req.body.breakdownNumber = `BD-${Date.now().toString().slice(-6)}`;
    const bd = await MaintenanceBreakdown.create(req.body);
    await logAudit('CREATE', 'MaintenanceBreakdown', bd._id, req.user._id);
    res.status(201).json({ success: true, data: bd });
  } catch (error) { handleError(res, error); }
};

exports.updateBreakdown = async (req, res) => {
  try {
    if (req.body.repairStatus === 'Resolved' && !req.body.resolutionDate) {
      req.body.resolutionDate = new Date();
      // Auto-calculate downtime if not provided
      const existing = await MaintenanceBreakdown.findById(req.params.id);
      if (existing && existing.reportedDate && !req.body.downtimeDurationHours) {
        const diffMs = new Date(req.body.resolutionDate) - new Date(existing.reportedDate);
        req.body.downtimeDurationHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60))); // convert to hours
      }
    }
    const bd = await MaintenanceBreakdown.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bd) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'MaintenanceBreakdown', bd._id, req.user._id);
    res.json({ success: true, data: bd });
  } catch (error) { handleError(res, error); }
};


// ================= Spare Parts Management =================

exports.getAllSpareParts = async (req, res) => {
  try {
    const parts = await MaintenanceSparePart.find()
      .populate('materialId', 'name code standardCost')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: parts });
  } catch (error) { handleError(res, error); }
};

exports.recordSparePartTransaction = async (req, res) => {
  try {
    const material = await MasterMaterial.findById(req.body.materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    const quantity = Number(req.body.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    req.body.transactionId = `SPT-${Date.now().toString().slice(-6)}`;
    req.body.unitCost = material.standardCost;
    req.body.totalCost = material.standardCost * quantity;

    const spt = await MaintenanceSparePart.create(req.body);
    await logAudit('CREATE', 'MaintenanceSparePart', spt._id, req.user._id);
    res.status(201).json({ success: true, data: spt });
  } catch (error) { handleError(res, error); }
};

exports.getSparePartInventory = async (req, res) => {
  try {
    const transactions = await MaintenanceSparePart.find().populate('materialId', 'name code standardCost');
    const inventory = {};

    transactions.forEach(tx => {
      if (!tx.materialId) return;
      const matId = tx.materialId._id.toString();
      if (!inventory[matId]) {
        inventory[matId] = {
          material: tx.materialId,
          quantityOnHand: 0,
          totalValue: 0
        };
      }
      if (tx.transactionType === 'Receipt') {
        inventory[matId].quantityOnHand += tx.quantity;
        inventory[matId].totalValue += tx.totalCost;
      } else if (tx.transactionType === 'Consumption') {
        inventory[matId].quantityOnHand -= tx.quantity;
        inventory[matId].totalValue -= tx.totalCost;
      }
    });

    res.json({ success: true, data: Object.values(inventory) });
  } catch (error) { handleError(res, error); }
};


// ================= Maintenance Analytics =================

exports.getAnalytics = async (req, res) => {
  try {
    const breakdowns = await MaintenanceBreakdown.find({ repairStatus: 'Resolved' }).populate('machineId', 'name code');
    const spareParts = await MaintenanceSparePart.find({ transactionType: 'Consumption' });

    // 1. MTTR (Mean Time To Repair) & Downtime Cost
    let totalDowntimeHours = 0;
    let totalDowntimeCost = 0;
    let totalBreakdowns = breakdowns.length;

    const machineStats = {};

    breakdowns.forEach(bd => {
      if (!bd.machineId) return;
      totalDowntimeHours += bd.downtimeDurationHours;
      totalDowntimeCost += (bd.downtimeDurationHours * bd.downtimeCostPerHour);
      
      const mId = bd.machineId._id.toString();
      if (!machineStats[mId]) {
        machineStats[mId] = { machine: bd.machineId, breakdownCount: 0, totalDowntimeHours: 0 };
      }
      machineStats[mId].breakdownCount++;
      machineStats[mId].totalDowntimeHours += bd.downtimeDurationHours;
    });

    const mttr = totalBreakdowns > 0 ? (totalDowntimeHours / totalBreakdowns).toFixed(2) : 0;

    // 2. MTBF (Mean Time Between Failures)
    // Assume a factory runs 24/7. So running hours = (Now - 30 days ago) = 720 hours per machine
    // Simplified calculation for demonstration. Real MTBF requires exact uptime tracking.
    const assumedRunningHoursPerMachine = 720; 
    const mtbfData = Object.values(machineStats).map(stat => {
      const runningHours = Math.max(0, assumedRunningHoursPerMachine - stat.totalDowntimeHours);
      const mtbf = (runningHours / stat.breakdownCount).toFixed(2);
      return {
        machine: stat.machine,
        mtbf: parseFloat(mtbf),
        breakdownCount: stat.breakdownCount
      };
    });

    // Average MTBF across all impacted machines
    const overallMtbf = mtbfData.length > 0 
      ? (mtbfData.reduce((acc, curr) => acc + curr.mtbf, 0) / mtbfData.length).toFixed(2) 
      : 0;

    // 3. Maintenance Cost Analysis
    let totalSparePartCost = 0;
    spareParts.forEach(sp => {
      totalSparePartCost += sp.totalCost;
    });

    const totalMaintenanceCost = totalDowntimeCost + totalSparePartCost;

    res.json({
      success: true,
      data: {
        mttr: parseFloat(mttr),
        mtbf: parseFloat(overallMtbf),
        machineMtbf: mtbfData,
        totalBreakdowns,
        totalDowntimeHours,
        totalDowntimeCost,
        totalSparePartCost,
        totalMaintenanceCost
      }
    });
  } catch (error) { handleError(res, error); }
};

const { handleError } = require('../utils/errorHandler');
const CapacityMachine = require('../models/CapacityMachine');
const CapacityLabor = require('../models/CapacityLabor');
const ProductionSchedule = require('../models/ProductionSchedule');
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

// ================= Machine Capacity =================

exports.getAllMachineCapacities = async (req, res) => {
  try {
    const capacities = await CapacityMachine.find()
      .populate('workCenterId', 'name code type')
      .sort({ period: -1 });
    res.json({ success: true, data: capacities });
  } catch (error) { handleError(res, error); }
};

exports.createMachineCapacity = async (req, res) => {
  try {
    const newCap = await CapacityMachine.create(req.body);
    await logAudit('CREATE', 'CapacityMachine', newCap._id, req.user._id);
    res.status(201).json({ success: true, data: newCap });
  } catch (error) { handleError(res, error); }
};

exports.updateMachineCapacity = async (req, res) => {
  try {
    const cap = await CapacityMachine.findById(req.params.id);
    if (!cap) return res.status(404).json({ success: false, message: 'Not found' });
    
    Object.assign(cap, req.body);
    await cap.save(); // Triggers the pre-save hook for bottleneck calc

    await logAudit('UPDATE', 'CapacityMachine', cap._id, req.user._id);
    res.json({ success: true, data: cap });
  } catch (error) { handleError(res, error); }
};

// ================= Labor Capacity =================

exports.getAllLaborCapacities = async (req, res) => {
  try {
    const capacities = await CapacityLabor.find().sort({ period: -1 });
    res.json({ success: true, data: capacities });
  } catch (error) { handleError(res, error); }
};

exports.createLaborCapacity = async (req, res) => {
  try {
    const newCap = await CapacityLabor.create(req.body);
    await logAudit('CREATE', 'CapacityLabor', newCap._id, req.user._id);
    res.status(201).json({ success: true, data: newCap });
  } catch (error) { handleError(res, error); }
};

exports.updateLaborCapacity = async (req, res) => {
  try {
    const cap = await CapacityLabor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit('UPDATE', 'CapacityLabor', cap._id, req.user._id);
    res.json({ success: true, data: cap });
  } catch (error) { handleError(res, error); }
};

// ================= Production Scheduling =================

exports.getAllSchedules = async (req, res) => {
  try {
    const { type } = req.query; // Daily, Weekly, Monthly
    const filter = type ? { scheduleType: type } : {};
    
    const schedules = await ProductionSchedule.find(filter)
      .populate('productId', 'name code')
      .populate('assignedWorkCenterId', 'name code')
      .sort({ targetDate: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) { handleError(res, error); }
};

exports.createSchedule = async (req, res) => {
  try {
    const newSched = await ProductionSchedule.create(req.body);
    await logAudit('CREATE', 'ProductionSchedule', newSched._id, req.user._id);
    res.status(201).json({ success: true, data: newSched });
  } catch (error) { handleError(res, error); }
};

exports.updateSchedule = async (req, res) => {
  try {
    const sched = await ProductionSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit('UPDATE', 'ProductionSchedule', sched._id, req.user._id);
    res.json({ success: true, data: sched });
  } catch (error) { handleError(res, error); }
};

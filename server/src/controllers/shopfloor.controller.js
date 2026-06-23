const ShopFloorOperator = require('../models/ShopFloorOperator');
const ShopFloorMachine = require('../models/ShopFloorMachine');
const ShopFloorDowntime = require('../models/ShopFloorDowntime');
const ShopFloorScrap = require('../models/ShopFloorScrap');
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

// ================= Operator Management =================

exports.getAllOperators = async (req, res) => {
  try {
    const ops = await ShopFloorOperator.find()
      .populate('workOrderId', 'workOrderNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: ops });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.assignOperator = async (req, res) => {
  try {
    const op = await ShopFloorOperator.create(req.body);
    await logAudit('CREATE', 'ShopFloorOperator', op._id, req.user._id);
    res.status(201).json({ success: true, data: op });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateOperator = async (req, res) => {
  try {
    const { workOrderId, shift, assignedDate, performanceNotes, calculateProductivity } = req.body;
    const update = { workOrderId, shift, assignedDate, performanceNotes };
    if (calculateProductivity) {
       update.productivityScore = Math.floor(Math.random() * (100 - 70 + 1) + 70); // Mock 70-100%
    }
    const op = await ShopFloorOperator.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!op) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'ShopFloorOperator', op._id, req.user._id);
    res.json({ success: true, data: op });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Machine Utilization =================

exports.getAllMachines = async (req, res) => {
  try {
    const machines = await ShopFloorMachine.find()
      .populate('machineId', 'name code')
      .populate('workOrderId', 'workOrderNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: machines });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.allocateMachine = async (req, res) => {
  try {
    // Check if machine is already allocated to another active WO
    const existing = await ShopFloorMachine.findOne({ machineId: req.body.machineId, status: 'Running' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Machine is already running on another Work Order' });
    }
    const machine = await ShopFloorMachine.create(req.body);
    await logAudit('CREATE', 'ShopFloorMachine', machine._id, req.user._id);
    res.status(201).json({ success: true, data: machine });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateMachine = async (req, res) => {
  try {
    // Basic simulation for utilization calculation based on idle time
    if (req.body.idleTimeMinutes !== undefined) {
       // Assume a standard 480 minute (8 hr) shift
       const totalShiftMinutes = 480;
       const utilized = totalShiftMinutes - req.body.idleTimeMinutes;
       req.body.utilizationPercentage = Math.max(0, Math.round((utilized / totalShiftMinutes) * 100));
    }
    const machine = await ShopFloorMachine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!machine) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'ShopFloorMachine', machine._id, req.user._id);
    res.json({ success: true, data: machine });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Downtime Management =================

exports.getAllDowntimes = async (req, res) => {
  try {
    const dt = await ShopFloorDowntime.find()
      .populate('machineId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: dt });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordDowntime = async (req, res) => {
  try {
    req.body.downtimeNumber = `DT-${Date.now().toString().slice(-6)}`;

    // If unplanned downtime on a running machine, update active machine first
    if (req.body.type === 'Unplanned') {
       const activeMachine = await ShopFloorMachine.findOne({ machineId: req.body.machineId, status: 'Running' });
       if (activeMachine) {
         activeMachine.idleTimeMinutes += req.body.durationMinutes;
         const totalShiftMinutes = 480;
         const utilized = totalShiftMinutes - activeMachine.idleTimeMinutes;
         activeMachine.utilizationPercentage = Math.max(0, Math.round((utilized / totalShiftMinutes) * 100));
         await activeMachine.save();
       }
    }

    const dt = await ShopFloorDowntime.create(req.body);
    await logAudit('CREATE', 'ShopFloorDowntime', dt._id, req.user._id);
    res.status(201).json({ success: true, data: dt });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateDowntime = async (req, res) => {
  try {
    const dt = await ShopFloorDowntime.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dt) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'ShopFloorDowntime', dt._id, req.user._id);
    res.json({ success: true, data: dt });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Scrap Management =================

exports.getAllScrap = async (req, res) => {
  try {
    const scrap = await ShopFloorScrap.find()
      .populate('workOrderId', 'workOrderNumber')
      .populate('materialId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: scrap });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordScrap = async (req, res) => {
  try {
    const material = await MasterMaterial.findById(req.body.materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    req.body.scrapNumber = `SCR-${Date.now().toString().slice(-6)}`;
    req.body.unitCost = material.standardCost;
    req.body.totalScrapCost = material.standardCost * req.body.scrapQuantity;

    const scrap = await ShopFloorScrap.create(req.body);
    await logAudit('CREATE', 'ShopFloorScrap', scrap._id, req.user._id);
    res.status(201).json({ success: true, data: scrap });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

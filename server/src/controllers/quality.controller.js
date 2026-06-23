const QualityInspection = require('../models/QualityInspection');
const QualityParameter = require('../models/QualityParameter');
const QualityNonConformance = require('../models/QualityNonConformance');
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

// ================= Quality Inspection (Incoming, In-Process, Final) =================

exports.getAllInspections = async (req, res) => {
  try {
    const filters = {};
    if (req.query.type) filters.type = req.query.type;

    const inspections = await QualityInspection.find(filters)
      .populate('vendorId', 'vendorName vendorCode')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: inspections });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordInspection = async (req, res) => {
  try {
    req.body.inspectionNumber = `QI-${Date.now().toString().slice(-6)}`;
    req.body.inspectorName = req.user.name;

    // Vendor evaluation logic for incoming
    if (req.body.type === 'Incoming' && req.body.status !== 'Pending') {
      req.body.vendorQualityScore = req.body.status === 'Pass' ? 100 : req.body.status === 'Hold' ? 50 : 0;
    }

    const ins = await QualityInspection.create(req.body);
    await logAudit('CREATE', 'QualityInspection', ins._id, req.user._id);
    res.status(201).json({ success: true, data: ins });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateInspection = async (req, res) => {
  try {
    if (req.body.type === 'Incoming' && req.body.status) {
      req.body.vendorQualityScore = req.body.status === 'Pass' ? 100 : req.body.status === 'Hold' ? 50 : 0;
    }

    const ins = await QualityInspection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ins) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'QualityInspection', ins._id, req.user._id);
    res.json({ success: true, data: ins });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.approveProductRelease = async (req, res) => {
  try {
    const ins = await QualityInspection.findOne({ _id: req.params.id, type: 'Final' });
    if (!ins) return res.status(404).json({ success: false, message: 'Final Inspection not found' });
    if (ins.status !== 'Pass') return res.status(400).json({ success: false, message: 'Inspection must be passed to approve release' });

    ins.productReleaseStatus = 'Approved';
    await ins.save();
    res.json({ success: true, data: ins });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Quality Parameters =================

exports.getAllParameters = async (req, res) => {
  try {
    const params = await QualityParameter.find()
      .populate('materialId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: params });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createParameter = async (req, res) => {
  try {
    const param = await QualityParameter.create(req.body);
    await logAudit('CREATE', 'QualityParameter', param._id, req.user._id);
    res.status(201).json({ success: true, data: param });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.recordMeasurement = async (req, res) => {
  try {
    const param = await QualityParameter.findById(req.params.id);
    if (!param) return res.status(404).json({ success: false, message: 'Not found' });

    const { value } = req.body;
    const isPass = value >= (param.standardValue - param.toleranceMinus) && value <= (param.standardValue + param.tolerancePlus);

    param.recordedMeasurements.push({
      value,
      pass: isPass,
      inspector: req.user.name,
      date: new Date()
    });

    await param.save();
    res.json({ success: true, data: param, pass: isPass });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Non-Conformance (CAPA) =================

exports.getAllNCRs = async (req, res) => {
  try {
    const ncrs = await QualityNonConformance.find()
      .populate({ path: 'inspectionId', select: 'inspectionNumber type referenceId' })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: ncrs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordNCR = async (req, res) => {
  try {
    req.body.ncrNumber = `NCR-${Date.now().toString().slice(-6)}`;
    const ncr = await QualityNonConformance.create(req.body);
    await logAudit('CREATE', 'QualityNonConformance', ncr._id, req.user._id);
    res.status(201).json({ success: true, data: ncr });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateNCR = async (req, res) => {
  try {
    const ncr = await QualityNonConformance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ncr) return res.status(404).json({ success: false, message: 'Not found' });
    await logAudit('UPDATE', 'QualityNonConformance', ncr._id, req.user._id);
    res.json({ success: true, data: ncr });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Quality Analytics =================

exports.getAnalytics = async (req, res) => {
  try {
    // 1. Defect Trends (Count of NCRs by Month)
    const ncrs = await QualityNonConformance.find({}, 'dateRecorded');
    
    // 2. Rejection Analysis
    const inspections = await QualityInspection.find({ type: { $in: ['Incoming', 'In-Process', 'Final'] } }, 'type status vendorQualityScore vendorId').populate('vendorId', 'vendorName');
    
    let totalIns = 0;
    let totalRejected = 0;
    let typeRejections = { 'Incoming': 0, 'In-Process': 0, 'Final': 0 };
    
    const vendorScores = {};

    inspections.forEach(ins => {
      totalIns++;
      if (ins.status === 'Fail') {
        totalRejected++;
        typeRejections[ins.type]++;
      }
      if (ins.type === 'Incoming' && ins.vendorId && ins.vendorQualityScore !== undefined) {
        const vName = ins.vendorId.vendorName;
        if (!vendorScores[vName]) vendorScores[vName] = { totalScore: 0, count: 0 };
        vendorScores[vName].totalScore += ins.vendorQualityScore;
        vendorScores[vName].count++;
      }
    });

    const vendorAverages = Object.keys(vendorScores).map(v => ({
      vendorName: v,
      averageScore: Math.round(vendorScores[v].totalScore / vendorScores[v].count)
    }));

    res.json({
      success: true,
      data: {
        totalInspections: totalIns,
        rejectionRate: totalIns > 0 ? Math.round((totalRejected / totalIns) * 100) : 0,
        typeRejections,
        totalDefectsLogged: ncrs.length,
        vendorAverages
      }
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

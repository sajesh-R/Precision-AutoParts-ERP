const { handleError } = require('../utils/errorHandler');
const MrpRun = require('../models/MrpRun');
const MrpRequirement = require('../models/MrpRequirement');
const MrpShortage = require('../models/MrpShortage');
const MrpRecommendation = require('../models/MrpRecommendation');
const EngineeringBOM = require('../models/EngineeringBOM');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryStock = require('../models/InventoryStock');
const InventoryOptimization = require('../models/InventoryOptimization');
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

// Helper: get total available stock for a material across all warehouses
async function getAvailableStock(materialId) {
  const stocks = await InventoryStock.find({ materialId, status: 'Active' });
  return stocks.reduce((acc, s) => acc + s.quantityAvailable, 0);
}

// Helper: get safety stock for a material
async function getSafetyStock(materialId) {
  const opt = await InventoryOptimization.findOne({ materialId });
  return opt ? (opt.safetyStock || 0) : 0;
}

// ================= MRP Execution Engine =================

exports.getAllMrpRuns = async (req, res) => {
  try {
    const runs = await MrpRun.find().sort({ createdAt: -1 });
    res.json({ success: true, data: runs });
  } catch (error) { handleError(res, error); }
};

exports.executeMrpRun = async (req, res) => {
  let mrpRun = null;
  try {
    const { period } = req.body;
    if (!period) return res.status(400).json({ success: false, message: 'Period is required' });

    // 1. Create the MRP Run Document
    const runNumber = `MRP-${period}-${Date.now().toString().slice(-4)}`;
    mrpRun = await MrpRun.create({ runNumber, period, status: 'Draft' });

    // 2. Fetch Demand Consolidation for this period
    const demands = await DemandConsolidation.find({ period });
    
    const requirementsMap = {};
    const shortagesList = [];
    const recommendationsList = [];

    const addReq = (model, id, qty, reqType) => {
      const key = `${model}_${id}`;
      if (!requirementsMap[key]) {
        requirementsMap[key] = {
          mrpRunId: mrpRun._id,
          requirementType: reqType,
          itemModel: model,
          itemId: id,
          requiredQuantity: 0
        };
      }
      requirementsMap[key].requiredQuantity += qty;
    };

    // 3. Explode Demands via BOM (fix: use 'versions' not 'revisions')
    for (const demand of demands) {
      if (demand.totalGrossDemand <= 0) continue;
      
      addReq('MasterProduct', demand.productId, demand.totalGrossDemand, 'Production');

      // Fix: query uses 'versions.status' not 'revisions.status'
      const bom = await EngineeringBOM.findOne({ 
        productId: demand.productId, 
        isActive: true,
        'versions.status': 'Approved'
      }).populate('versions.components.materialId').populate('versions.components.productId');

      if (!bom) {
        shortagesList.push({
          mrpRunId: mrpRun._id,
          shortageType: 'ProductionConstraint',
          itemModel: 'MasterProduct',
          itemId: demand.productId,
          shortageQuantity: demand.totalGrossDemand,
          constraintDetails: 'No active approved BOM found. Cannot explode requirements.'
        });
        continue;
      }

      // Get active approved version
      const activeVersion = bom.versions.find(v => v.status === 'Approved');
      if (!activeVersion) continue;

      // Explode components
      for (const comp of activeVersion.components) {
        const scrapFactor = 1 + ((comp.scrapPercentage || 0) / 100);
        const requiredQty = demand.totalGrossDemand * comp.quantity * scrapFactor;

        if (comp.componentType === 'Material' && comp.materialId) {
          addReq('MasterMaterial', comp.materialId._id || comp.materialId, requiredQty, 'Material');
        } else if (comp.componentType === 'Product' && comp.productId) {
          addReq('MasterProduct', comp.productId._id || comp.productId, requiredQty, 'Component');
        }
      }
    }

    // 4. Save Requirements
    const reqDocs = Object.values(requirementsMap);
    if (reqDocs.length > 0) {
      await MrpRequirement.insertMany(reqDocs);
    }

    // 5. Shortage Analysis - query REAL inventory
    for (const req of reqDocs) {
      // Get actual current stock from InventoryStock
      const currentStock = await getAvailableStock(req.itemId);
      // Get safety stock requirement
      const safetyStock = req.requirementType === 'Material' ? await getSafetyStock(req.itemId) : 0;
      
      // Calculate incoming supply from open Purchase Orders
      let incomingSupply = 0;
      if (req.requirementType === 'Material') {
        const openPOs = await PurchaseOrder.find({ status: { $in: ['Approved', 'Dispatched'] } });
        openPOs.forEach(po => {
          const item = po.items.find(i => i.materialId.toString() === req.itemId.toString());
          if (item) incomingSupply += item.quantity;
        });
      }

      // Net requirement = gross requirement + safety stock - current stock - incoming supply
      const netRequirement = req.requiredQuantity + safetyStock - currentStock - incomingSupply;
      
      if (netRequirement > 0) {
        let shortageType = req.requirementType === 'Material' ? 'RawMaterial' : 'Component';
        let suggType = req.requirementType === 'Material' ? 'Purchase' : 'Production';

        shortagesList.push({
          mrpRunId: mrpRun._id,
          shortageType,
          itemModel: req.itemModel,
          itemId: req.itemId,
          shortageQuantity: netRequirement
        });

        recommendationsList.push({
          mrpRunId: mrpRun._id,
          suggestionType: suggType,
          itemModel: req.itemModel,
          itemId: req.itemId,
          suggestedQuantity: netRequirement,
          suggestedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
      }
    }

    if (shortagesList.length > 0) await MrpShortage.insertMany(shortagesList);
    if (recommendationsList.length > 0) await MrpRecommendation.insertMany(recommendationsList);

    mrpRun.status = 'Completed';
    await mrpRun.save();

    await logAudit('EXECUTE_MRP', 'MrpRun', mrpRun._id, req.user._id, { period });
    
    res.json({ success: true, message: `MRP Run completed for ${period}`, data: mrpRun });

  } catch (error) { 
    console.error('MRP Error:', error);
    if (mrpRun && mrpRun._id) {
      await MrpRun.findByIdAndUpdate(mrpRun._id, { status: 'Failed', notes: error.message }).catch(() => {});
    }
    handleError(res, error); 
  }
};


// ================= MRP Data Retrieval =================

exports.getRequirements = async (req, res) => {
  try {
    const { runId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = runId ? { mrpRunId: runId } : {};
    const reqs = await MrpRequirement.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .sort({ requirementType: 1 })
      .skip(skip).limit(limit);
      
    const total = await MrpRequirement.countDocuments(filter);
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: reqs });
  } catch (error) { handleError(res, error); }
};

exports.getShortages = async (req, res) => {
  try {
    const { runId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = runId ? { mrpRunId: runId } : {};
    const shortages = await MrpShortage.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .sort({ shortageType: 1 })
      .skip(skip).limit(limit);
      
    const total = await MrpShortage.countDocuments(filter);
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: shortages });
  } catch (error) { handleError(res, error); }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { runId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = runId ? { mrpRunId: runId } : {};
    const recs = await MrpRecommendation.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .sort({ suggestionType: 1 })
      .skip(skip).limit(limit);
      
    const total = await MrpRecommendation.countDocuments(filter);
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: recs });
  } catch (error) { handleError(res, error); }
};

exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rec = await MrpRecommendation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found' });
    await logAudit('STATUS_CHANGE', 'MrpRecommendation', rec._id, req.user._id, { status });
    res.json({ success: true, data: rec });
  } catch (error) { handleError(res, error); }
};

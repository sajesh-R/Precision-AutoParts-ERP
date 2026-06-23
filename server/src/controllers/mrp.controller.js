const MrpRun = require('../models/MrpRun');
const MrpRequirement = require('../models/MrpRequirement');
const MrpShortage = require('../models/MrpShortage');
const MrpRecommendation = require('../models/MrpRecommendation');
const DemandConsolidation = require('../models/DemandConsolidation');
const EngineeringBOM = require('../models/EngineeringBOM');
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

// ================= MRP Execution Engine =================

exports.getAllMrpRuns = async (req, res) => {
  try {
    const runs = await MrpRun.find().sort({ createdAt: -1 });
    res.json({ success: true, data: runs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.executeMrpRun = async (req, res) => {
  try {
    const { period } = req.body;
    if (!period) return res.status(400).json({ success: false, message: 'Period is required' });

    // 1. Create the MRP Run Document
    const runNumber = `MRP-${period}-${Date.now().toString().slice(-4)}`;
    const mrpRun = await MrpRun.create({ runNumber, period, status: 'Draft' });

    // 2. Fetch Demand Consolidation for this period
    const demands = await DemandConsolidation.find({ period });
    
    // Process variables
    const requirementsMap = {}; // key: `model_id`
    const shortagesList = [];
    const recommendationsList = [];

    // Helper to add requirement
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

    // 3. Explode Demands via BOM
    for (const demand of demands) {
      if (demand.totalGrossDemand <= 0) continue;
      
      // The finished good itself is a production requirement
      addReq('MasterProduct', demand.productId, demand.totalGrossDemand, 'Production');

      // Fetch active BOM for this product
      const bom = await EngineeringBOM.findOne({ 
        productId: demand.productId, 
        isActive: true, 
        'revisions.status': 'Approved' 
      }).populate('components.materialId').populate('components.childProductId');

      if (!bom) {
        // Flag a production constraint
        shortagesList.push({
          mrpRunId: mrpRun._id,
          shortageType: 'ProductionConstraint',
          itemModel: 'MasterProduct',
          itemId: demand.productId,
          shortageQuantity: demand.totalGrossDemand,
          constraintDetails: 'No active BOM found. Cannot explode requirements.'
        });
        continue;
      }

      // Explode first level components
      for (const comp of bom.components) {
        // Apply scrap percentage
        const scrapFactor = 1 + ((comp.scrapPercentage || 0) / 100);
        const requiredQty = demand.totalGrossDemand * comp.quantity * scrapFactor;

        if (comp.componentType === 'Material') {
          addReq('MasterMaterial', comp.materialId._id, requiredQty, 'Material');
        } else if (comp.componentType === 'Product') {
          addReq('MasterProduct', comp.childProductId._id, requiredQty, 'Component');
          // In a true deep MRP, we would recursively explode this child product's BOM.
          // For demonstration, single level is computed here.
        }
      }
    }

    // 4. Save Requirements
    const reqDocs = Object.values(requirementsMap);
    await MrpRequirement.insertMany(reqDocs);

    // 5. Shortage Analysis & Recommendations
    // Assuming 0 inventory for now to demonstrate shortages.
    // In production, we'd query MasterMaterial and MasterProduct for currentStock.
    for (const req of reqDocs) {
      const currentStock = 0; // Mocked inventory check
      
      if (currentStock < req.requiredQuantity) {
        const shortageQty = req.requiredQuantity - currentStock;
        
        let shortageType = req.requirementType === 'Material' ? 'RawMaterial' : 'Component';
        let suggType = req.requirementType === 'Material' ? 'Purchase' : 'Production';

        shortagesList.push({
          mrpRunId: mrpRun._id,
          shortageType,
          itemModel: req.itemModel,
          itemId: req.itemId,
          shortageQuantity: shortageQty
        });

        recommendationsList.push({
          mrpRunId: mrpRun._id,
          suggestionType: suggType,
          itemModel: req.itemModel,
          itemId: req.itemId,
          suggestedQuantity: shortageQty,
          suggestedDate: new Date(Date.now() + 14*24*60*60*1000) // +14 days dummy lead time
        });
      }
    }

    await MrpShortage.insertMany(shortagesList);
    await MrpRecommendation.insertMany(recommendationsList);

    // Mark Run as Completed
    mrpRun.status = 'Completed';
    await mrpRun.save();

    await logAudit('EXECUTE_MRP', 'MrpRun', mrpRun._id, req.user._id, { period });
    
    res.json({ success: true, message: `MRP Run completed for ${period}`, data: mrpRun });

  } catch (error) { 
    console.error(error);
    res.status(500).json({ success: false, message: error.message }); 
  }
};


// ================= MRP Data Retrieval =================

exports.getRequirements = async (req, res) => {
  try {
    const { runId } = req.query;
    const filter = runId ? { mrpRunId: runId } : {};
    const reqs = await MrpRequirement.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .populate('itemId', 'name code') // Note: Mongoose polymorphic populate requires model name match if strict
      .sort({ requirementType: 1 });
    res.json({ success: true, data: reqs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getShortages = async (req, res) => {
  try {
    const { runId } = req.query;
    const filter = runId ? { mrpRunId: runId } : {};
    const shortages = await MrpShortage.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .populate('itemId', 'name code')
      .sort({ shortageType: 1 });
    res.json({ success: true, data: shortages });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { runId } = req.query;
    const filter = runId ? { mrpRunId: runId } : {};
    const recs = await MrpRecommendation.find(filter)
      .populate('mrpRunId', 'runNumber period')
      .populate('itemId', 'name code')
      .sort({ suggestionType: 1 });
    res.json({ success: true, data: recs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rec = await MrpRecommendation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    await logAudit('STATUS_CHANGE', 'MrpRecommendation', rec._id, req.user._id, { status });
    res.json({ success: true, data: rec });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

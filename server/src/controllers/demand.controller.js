const DemandForecast = require('../models/DemandForecast');
const DemandConsolidation = require('../models/DemandConsolidation');
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

// ================= Demand Forecasting =================

exports.getAllForecasts = async (req, res) => {
  try {
    const forecasts = await DemandForecast.find()
      .populate('productId', 'name code')
      .populate('customerId', 'name code')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: forecasts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createForecast = async (req, res) => {
  try {
    const newForecast = await DemandForecast.create(req.body);
    await logAudit('CREATE', 'DemandForecast', newForecast._id, req.user._id);
    res.status(201).json({ success: true, data: newForecast });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateForecast = async (req, res) => {
  try {
    const updated = await DemandForecast.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAudit('UPDATE', 'DemandForecast', updated._id, req.user._id);
    res.json({ success: true, data: updated });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


// ================= Historical Sales Analysis =================

exports.getHistoricalAnalysis = async (req, res) => {
  try {
    // Dynamic aggregation of past Sales Orders
    // We aggregate quantity per product from Sales Orders that are 'Approved', 'In Production', 'Dispatched', 'Invoiced'
    const validStatuses = ['Approved', 'In Production', 'Dispatched', 'Invoiced'];
    
    const historicalData = await SalesOrder.aggregate([
      { $match: { status: { $in: validStatuses } } },
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productId",
        totalHistoricalQuantity: { $sum: "$items.quantity" },
        totalHistoricalValue: { $sum: "$items.total" },
        orderCount: { $sum: 1 }
      }},
      { $lookup: {
        from: 'masterproducts',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: "$product" },
      { $project: {
        productId: "$_id",
        productName: "$product.name",
        productCode: "$product.code",
        totalHistoricalQuantity: 1,
        totalHistoricalValue: 1,
        orderCount: 1
      }}
    ]);

    res.json({ success: true, data: historicalData });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


// ================= Demand Consolidation =================

exports.getAllConsolidations = async (req, res) => {
  try {
    const consolidations = await DemandConsolidation.find()
      .populate('productId', 'name code')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: consolidations });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createConsolidation = async (req, res) => {
  try {
    const newConsolidation = await DemandConsolidation.create(req.body);
    await logAudit('CREATE', 'DemandConsolidation', newConsolidation._id, req.user._id);
    res.status(201).json({ success: true, data: newConsolidation });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateConsolidation = async (req, res) => {
  try {
    // Relying on pre-save hook to recalculate totalGrossDemand
    const consolidation = await DemandConsolidation.findById(req.params.id);
    if (!consolidation) return res.status(404).json({ success: false, message: 'Consolidation not found' });

    Object.assign(consolidation, req.body);
    await consolidation.save(); // Triggers pre-save hook for totalGrossDemand

    await logAudit('UPDATE', 'DemandConsolidation', consolidation._id, req.user._id);
    res.json({ success: true, data: consolidation });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.generateConsolidation = async (req, res) => {
  try {
    const { period } = req.body; // e.g. "Oct-2026"
    if (!period) return res.status(400).json({ success: false, message: 'Period is required' });

    // 1. Fetch all Finalized Forecasts for this period
    const forecasts = await DemandForecast.aggregate([
      { $match: { period: period, status: 'Finalized', productId: { $exists: true, $ne: null } } },
      { $group: {
        _id: "$productId",
        totalForecastQuantity: { $sum: { $multiply: ["$projectedQuantity", "$seasonalFactor"] } }
      }}
    ]);

    // 2. Fetch all Active Sales Orders (Mocking period filter as just taking all active orders for now)
    const validStatuses = ['Approved', 'In Production']; // Committed demand not yet dispatched
    const salesOrders = await SalesOrder.aggregate([
      { $match: { status: { $in: validStatuses } } },
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productId",
        totalSalesOrderQuantity: { $sum: "$items.quantity" }
      }}
    ]);

    // Merge logic
    const consolidationMap = {};
    
    forecasts.forEach(f => {
      consolidationMap[f._id] = { productId: f._id, forecastDemand: f.totalForecastQuantity, salesOrderDemand: 0 };
    });

    salesOrders.forEach(s => {
      if (consolidationMap[s._id]) {
        consolidationMap[s._id].salesOrderDemand = s.totalSalesOrderQuantity;
      } else {
        consolidationMap[s._id] = { productId: s._id, forecastDemand: 0, salesOrderDemand: s.totalSalesOrderQuantity };
      }
    });

    // Generate consolidations
    const results = [];
    for (const [productId, data] of Object.entries(consolidationMap)) {
      const consolidationNumber = `CON-${period}-${productId.toString().slice(-4)}`.toUpperCase();
      
      let consolidation = await DemandConsolidation.findOne({ period, productId });
      
      if (consolidation) {
        consolidation.forecastDemand = data.forecastDemand;
        consolidation.salesOrderDemand = data.salesOrderDemand;
        await consolidation.save();
      } else {
        consolidation = await DemandConsolidation.create({
          consolidationNumber,
          period,
          productId,
          forecastDemand: data.forecastDemand,
          salesOrderDemand: data.salesOrderDemand,
          safetyStockRequirement: 0 // Default
        });
      }
      results.push(consolidation);
    }

    res.json({ success: true, message: `Consolidation generated for ${period}`, data: results });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

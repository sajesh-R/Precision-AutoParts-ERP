const InventoryStock = require('../models/InventoryStock');
const InventoryTransaction = require('../models/InventoryTransaction');
const InventoryOptimization = require('../models/InventoryOptimization');
const InventoryValuation = require('../models/InventoryValuation');
const InventoryTraceability = require('../models/InventoryTraceability');
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

// ================= Inventory Control =================

exports.getInventoryControl = async (req, res) => {
  try {
    // We group active stock by material and materialType
    const stocks = await InventoryStock.find({ status: 'Active' })
      .populate({ path: 'materialId', populate: { path: 'category' } })
      .populate('warehouseId', 'name code');
    
    // Group by material category for the UI tabs
    const grouped = {
      'Raw Material': [],
      'WIP': [],
      'Finished Goods': [],
      'Spare Parts': []
    };

    stocks.forEach(stock => {
      const type = stock.materialId?.category?.name;
      if (grouped[type]) {
        grouped[type].push(stock);
      }
    });

    res.json({ success: true, data: grouped });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ================= Inventory Transactions =================

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('materialId', 'name code')
      .populate('sourceWarehouseId', 'name')
      .populate('destinationWarehouseId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createTransaction = async (req, res) => {
  try {
    const { transactionType, materialId, quantity, sourceWarehouseId, destinationWarehouseId, referenceDocument, notes } = req.body;
    
    // Transaction logic based on type
    const batchNumber = `BATCH-TX-${Date.now().toString().slice(-4)}`;
    
    // Create ledger entry
    const transaction = await InventoryTransaction.create({
      transactionNumber: `TXN-${Date.now().toString().slice(-6)}`,
      transactionType,
      materialId,
      batchNumber,
      sourceWarehouseId,
      destinationWarehouseId,
      quantity,
      referenceDocument,
      notes
    });

    // Update actual InventoryStock dynamically
    if (transactionType === 'Material Issue' || transactionType === 'Stock Transfer') {
      // Deduct from source
      if (sourceWarehouseId) {
        await deductStock(materialId, sourceWarehouseId, quantity);
      }
    }
    
    if (transactionType === 'Goods Receipt' || transactionType === 'Stock Return' || transactionType === 'Stock Transfer') {
      // Add to destination
      if (destinationWarehouseId) {
        await addStock(materialId, destinationWarehouseId, quantity, batchNumber);
      }
    }

    if (transactionType === 'Stock Adjustment') {
      // Adjust in source warehouse (quantity can be negative or positive)
      if (quantity > 0) {
        await addStock(materialId, sourceWarehouseId, quantity, batchNumber);
      } else {
        await deductStock(materialId, sourceWarehouseId, Math.abs(quantity));
      }
    }

    await logAudit('CREATE', 'InventoryTransaction', transaction._id, req.user._id);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// Helpers for dynamic stock updates
async function deductStock(materialId, warehouseId, qty) {
  let remainingToDeduct = qty;
  const availableStocks = await InventoryStock.find({ materialId, warehouseId, status: 'Active' }).sort({ postingDate: 1 }); // FIFO logic
  
  for (let stock of availableStocks) {
    if (remainingToDeduct <= 0) break;
    if (stock.quantityAvailable >= remainingToDeduct) {
      stock.quantityAvailable -= remainingToDeduct;
      if (stock.quantityAvailable === 0) stock.status = 'Consumed';
      await stock.save();
      remainingToDeduct = 0;
    } else {
      remainingToDeduct -= stock.quantityAvailable;
      stock.quantityAvailable = 0;
      stock.status = 'Consumed';
      await stock.save();
    }
  }
  if (remainingToDeduct > 0) throw new Error('Insufficient active stock in the selected source warehouse');
}

async function addStock(materialId, warehouseId, qty, batchNumber) {
  // Always creates a new active batch for additions
  await InventoryStock.create({
    batchNumber,
    materialId,
    warehouseId,
    quantityAvailable: qty,
    status: 'Active'
  });
}

// ================= Inventory Optimization =================

exports.getOptimization = async (req, res) => {
  try {
    const opts = await InventoryOptimization.find().populate('materialId', 'name code category');
    res.json({ success: true, data: opts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateOptimization = async (req, res) => {
  try {
    const { materialId } = req.body;
    let opt = await InventoryOptimization.findOne({ materialId });
    if (opt) {
      Object.assign(opt, req.body);
      await opt.save();
    } else {
      opt = await InventoryOptimization.create(req.body);
    }
    await logAudit('UPDATE', 'InventoryOptimization', opt._id, req.user._id);
    res.json({ success: true, data: opt });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.runAnalysis = async (req, res) => {
  try {
    const materials = await MasterMaterial.find();
    
    // Calculate real annual consumption value per material from InventoryTransactions
    const transactions = await InventoryTransaction.find({ transactionType: 'Material Issue' });
    
    const consumptionMap = {};
    transactions.forEach(tx => {
      const matId = tx.materialId.toString();
      if (!consumptionMap[matId]) consumptionMap[matId] = 0;
      consumptionMap[matId] += Math.abs(tx.quantity);
    });

    // Calculate total consumption value for ABC ranking
    const matValues = materials.map(mat => ({
      id: mat._id.toString(),
      value: (consumptionMap[mat._id.toString()] || 0) * (mat.standardCost || 0)
    }));

    matValues.sort((a, b) => b.value - a.value);
    const total = matValues.reduce((acc, m) => acc + m.value, 0);

    let cumulative = 0;
    const classMap = {};
    for (const m of matValues) {
      cumulative += m.value;
      const pct = total > 0 ? (cumulative / total) * 100 : 0;
      classMap[m.id] = pct <= 80 ? 'A' : pct <= 95 ? 'B' : 'C';
    }

    for (const mat of materials) {
      const matId = mat._id.toString();
      const stocks = await InventoryStock.find({ materialId: mat._id, status: 'Active' });
      const totalQty = stocks.reduce((a, s) => a + s.quantityAvailable, 0);
      // Dead stock: material has stock but no transactions in last 180 days
      const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const recentTx = await InventoryTransaction.findOne({ materialId: mat._id, createdAt: { $gte: cutoff } });
      const isDeadStock = totalQty > 0 && !recentTx;

      await InventoryOptimization.findOneAndUpdate(
        { materialId: mat._id },
        { 
          abcClassification: classMap[matId] || 'C', 
          isDeadStock,
          lastAnalysisDate: new Date()
        },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true, message: 'ABC Analysis Completed using real consumption data' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ================= Inventory Valuation =================

exports.getValuation = async (req, res) => {
  try {
    const vals = await InventoryValuation.find().populate('materialId', 'name code standardCost');
    res.json({ success: true, data: vals });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.calculateValuation = async (req, res) => {
  try {
    const materials = await MasterMaterial.find();
    for (const mat of materials) {
      const stocks = await InventoryStock.find({ materialId: mat._id, status: 'Active' });
      const totalQty = stocks.reduce((acc, curr) => acc + curr.quantityAvailable, 0);
      
      // FIFO valuation: total qty * standard cost (actual cost from PO would require lot-level cost tracking)
      const fifoTotal = totalQty * (mat.standardCost || 0);

      // WAC: fetch all inventory transactions (Goods Receipts) for this material to compute weighted average
      const receiptTxns = await InventoryTransaction.find({ materialId: mat._id, transactionType: 'Goods Receipt' });
      let totalCost = 0;
      let totalReceived = 0;
      receiptTxns.forEach(tx => {
        totalReceived += tx.quantity;
        // Use standard cost as proxy for receipt cost if no unit cost in transaction
        totalCost += tx.quantity * (mat.standardCost || 0);
      });
      const wac = totalReceived > 0 ? (totalCost / totalReceived) : (mat.standardCost || 0);

      await InventoryValuation.findOneAndUpdate(
        { materialId: mat._id },
        { 
          fifoValuation: fifoTotal,
          weightedAverageCost: wac,
          lastCalculatedDate: new Date()
        },
        { upsert: true, new: true }
      );
    }
    res.json({ success: true, message: 'Valuation calculated successfully using real stock data' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ================= Traceability Management =================

exports.getAllTraceability = async (req, res) => {
  try {
    const traces = await InventoryTraceability.find()
      .populate('materialId', 'name code')
      .populate('originTransactionId', 'transactionNumber transactionType')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: traces });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createTraceability = async (req, res) => {
  try {
    req.body.trackingNumber = `TRK-${Date.now().toString().slice(-6)}`;
    const newTrace = await InventoryTraceability.create(req.body);
    await logAudit('CREATE', 'InventoryTraceability', newTrace._id, req.user._id);
    res.status(201).json({ success: true, data: newTrace });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

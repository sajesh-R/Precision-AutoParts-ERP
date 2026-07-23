const { handleError } = require('../utils/errorHandler');
const FinanceAR = require('../models/FinanceAR');
const FinanceAP = require('../models/FinanceAP');
const FinanceLedger = require('../models/FinanceLedger');
const FinanceTax = require('../models/FinanceTax');
const { AuditLog } = require('../models/Audit');
const mongoose = require('mongoose');
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

// ================= ACCOUNTS RECEIVABLE =================

exports.getARInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const invoices = await FinanceAR.find()
      .populate('customerId', 'name code')
      .populate('salesOrderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await FinanceAR.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: invoices });
  } catch (error) { handleError(res, error); }
};

exports.createARInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    req.body.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    req.body.totalAmount = (Number(req.body.amount) || 0) + (Number(req.body.taxAmount) || 0);
    req.body.outstandingAmount = req.body.totalAmount;
    
    const invoiceArray = await FinanceAR.create([req.body], { session });
    const invoice = invoiceArray[0];

    // Auto-post to General Ledger: Debit Accounts Receivable, Credit Revenue
    const jeNumber = `JE-${Date.now().toString().slice(-6)}`;
    await FinanceLedger.create([{
      entryNumber: `${jeNumber}-DR`,
      description: `AR Invoice ${invoice.invoiceNumber} - Accounts Receivable`,
      accountName: 'Accounts Receivable',
      type: 'Debit',
      amount: invoice.totalAmount,
      referenceType: 'Invoice',
      referenceId: invoice._id,
      status: 'Posted'
    }], { session });
    
    await FinanceLedger.create([{
      entryNumber: `${jeNumber}-CR`,
      description: `AR Invoice ${invoice.invoiceNumber} - Revenue`,
      accountName: 'Sales Revenue',
      type: 'Credit',
      amount: invoice.amount,
      referenceType: 'Invoice',
      referenceId: invoice._id,
      status: 'Posted'
    }], { session });
    
    if (invoice.taxAmount > 0) {
      await FinanceLedger.create([{
        entryNumber: `${jeNumber}-TX`,
        description: `AR Invoice ${invoice.invoiceNumber} - Output Tax`,
        accountName: 'Output Tax Payable',
        type: 'Credit',
        amount: invoice.taxAmount,
        referenceType: 'Invoice',
        referenceId: invoice._id,
        status: 'Posted'
      }], { session });
    }

    await logAudit('CREATE', 'FinanceAR', invoice._id, req.user._id);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error);
  }
};

exports.addARPayment = async (req, res) => {
  try {
    const invoice = await FinanceAR.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    invoice.payments.push({
      amount: req.body.amount,
      paymentMode: req.body.paymentMode,
      referenceNumber: req.body.referenceNumber,
      paymentDate: new Date()
    });

    await invoice.save();
    
    // Auto-create Ledger Entry for AR Payment
    await FinanceLedger.create({
      entryNumber: `JE-${Date.now().toString().slice(-6)}`,
      description: `Payment received for Invoice ${invoice.invoiceNumber}`,
      accountName: 'Accounts Receivable',
      type: 'Credit',
      amount: req.body.amount,
      referenceType: 'Payment',
      referenceId: invoice._id,
      status: 'Posted'
    });

    await logAudit('UPDATE', 'FinanceAR', invoice._id, req.user._id, { action: 'Payment Added' });
    res.json({ success: true, data: invoice });
  } catch (error) { handleError(res, error); }
};

// ================= ACCOUNTS PAYABLE =================

exports.getAPBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const bills = await FinanceAP.find()
      .populate('vendorId', 'name code')
      .populate('purchaseOrderId', 'poNumber')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await FinanceAP.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: bills });
  } catch (error) { handleError(res, error); }
};

exports.createAPBill = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    req.body.billNumber = `BILL-${Date.now().toString().slice(-6)}`;
    req.body.totalAmount = (Number(req.body.amount) || 0) + (Number(req.body.taxAmount) || 0);
    req.body.outstandingAmount = req.body.totalAmount;
    
    const billArray = await FinanceAP.create([req.body], { session });
    const bill = billArray[0];

    // Auto-post to General Ledger: Debit Expense/Purchases, Credit Accounts Payable
    const jeNumber = `JE-${Date.now().toString().slice(-6)}`;
    await FinanceLedger.create([{
      entryNumber: `${jeNumber}-DR`,
      description: `AP Bill ${bill.billNumber} - Purchase Expense`,
      accountName: 'Purchase Expense',
      type: 'Debit',
      amount: bill.amount,
      referenceType: 'Bill',
      referenceId: bill._id,
      status: 'Posted'
    }], { session });
    
    if (bill.taxAmount > 0) {
      await FinanceLedger.create([{
        entryNumber: `${jeNumber}-TX`,
        description: `AP Bill ${bill.billNumber} - Input Tax`,
        accountName: 'Input Tax Receivable',
        type: 'Debit',
        amount: bill.taxAmount,
        referenceType: 'Bill',
        referenceId: bill._id,
        status: 'Posted'
      }], { session });
    }
    
    await FinanceLedger.create([{
      entryNumber: `${jeNumber}-CR`,
      description: `AP Bill ${bill.billNumber} - Accounts Payable`,
      accountName: 'Accounts Payable',
      type: 'Credit',
      amount: bill.totalAmount,
      referenceType: 'Bill',
      referenceId: bill._id,
      status: 'Posted'
    }], { session });

    await logAudit('CREATE', 'FinanceAP', bill._id, req.user._id);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error);
  }
};

exports.addAPPayment = async (req, res) => {
  try {
    const bill = await FinanceAP.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.payments.push({
      amount: req.body.amount,
      paymentMode: req.body.paymentMode,
      referenceNumber: req.body.referenceNumber,
      paymentDate: new Date()
    });

    await bill.save();

    // Auto-create Ledger Entry for AP Payment
    await FinanceLedger.create({
      entryNumber: `JE-${Date.now().toString().slice(-6)}`,
      description: `Payment sent for Bill ${bill.billNumber}`,
      accountName: 'Accounts Payable',
      type: 'Debit',
      amount: req.body.amount,
      referenceType: 'Payment',
      referenceId: bill._id,
      status: 'Posted'
    });

    await logAudit('UPDATE', 'FinanceAP', bill._id, req.user._id, { action: 'Payment Sent' });
    res.json({ success: true, data: bill });
  } catch (error) { handleError(res, error); }
};

// ================= GENERAL LEDGER =================

exports.getLedgers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const entries = await FinanceLedger.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await FinanceLedger.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: entries });
  } catch (error) { handleError(res, error); }
};

exports.createLedgerEntry = async (req, res) => {
  try {
    req.body.entryNumber = `JE-${Date.now().toString().slice(-6)}`;
    const entry = await FinanceLedger.create(req.body);
    await logAudit('CREATE', 'FinanceLedger', entry._id, req.user._id);
    res.status(201).json({ success: true, data: entry });
  } catch (error) { handleError(res, error); }
};

exports.postLedgerEntry = async (req, res) => {
  try {
    const entry = await FinanceLedger.findByIdAndUpdate(req.params.id, { status: 'Posted' }, { new: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await logAudit('UPDATE', 'FinanceLedger', entry._id, req.user._id, { status: 'Posted' });
    res.json({ success: true, data: entry });
  } catch (error) { handleError(res, error); }
};

// ================= TAX MANAGEMENT =================

exports.getTaxes = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const taxes = await FinanceTax.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await FinanceTax.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: taxes });
  } catch (error) { handleError(res, error); }
};

exports.createTax = async (req, res) => {
  try {
    const tax = await FinanceTax.create(req.body);
    await logAudit('CREATE', 'FinanceTax', tax._id, req.user._id);
    res.status(201).json({ success: true, data: tax });
  } catch (error) { handleError(res, error); }
};

exports.updateTax = async (req, res) => {
  try {
    const tax = await FinanceTax.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tax) return res.status(404).json({ success: false, message: 'Tax not found' });
    await logAudit('UPDATE', 'FinanceTax', tax._id, req.user._id);
    res.json({ success: true, data: tax });
  } catch (error) { handleError(res, error); }
};

exports.generateTaxReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Output Tax (Sales - AR)
    const sales = await FinanceAR.find(matchQuery).populate('customerId', 'name').select('invoiceNumber createdAt amount taxAmount status customerId');
    const totalOutputTax = sales.reduce((acc, curr) => acc + (Number(curr.taxAmount) || 0), 0);

    // Input Tax (Purchases - AP)
    const purchases = await FinanceAP.find(matchQuery).populate('vendorId', 'name').select('billNumber createdAt amount taxAmount status vendorId');
    const totalInputTax = purchases.reduce((acc, curr) => acc + (Number(curr.taxAmount) || 0), 0);

    const netTaxLiability = totalOutputTax - totalInputTax;

    res.json({
      success: true,
      data: {
        totalOutputTax,
        totalInputTax,
        netTaxLiability,
        salesTransactions: sales,
        purchaseTransactions: purchases
      }
    });
  } catch (error) { handleError(res, error); }
};

// ================= FINANCIAL STATEMENTS =================

exports.getStatements = async (req, res) => {
  try {
    // Generate P&L dynamically from Ledger, AR, AP
    const ledgers = await FinanceLedger.find({ status: 'Posted' });
    
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCash = 0;
    
    // Simplistic P&L and Cash logic based on Account Names
    ledgers.forEach(l => {
      const isRevenue = l.accountName.toLowerCase().includes('revenue') || l.accountName.toLowerCase().includes('sales');
      const isExpense = l.accountName.toLowerCase().includes('expense') || l.accountName.toLowerCase().includes('cost');
      const isCash = l.accountName.toLowerCase().includes('cash') || l.accountName.toLowerCase().includes('bank');
      
      if (isRevenue) {
        if (l.type === 'Credit') {
          totalRevenue += l.amount;
        } else if (l.type === 'Debit') {
          totalRevenue -= l.amount;
        }
      }
      if (isExpense) {
        if (l.type === 'Debit') {
          totalExpenses += l.amount;
        } else if (l.type === 'Credit') {
          totalExpenses -= l.amount;
        }
      }
      if (isCash) {
        if (l.type === 'Debit') {
          totalCash += l.amount;
        } else if (l.type === 'Credit') {
          totalCash -= l.amount;
        }
      }
    });

    const AR = await FinanceAR.find();
    let arTotal = AR.reduce((acc, curr) => acc + curr.outstandingAmount, 0);

    const AP = await FinanceAP.find();
    let apTotal = AP.reduce((acc, curr) => acc + curr.outstandingAmount, 0);

    res.json({
      success: true,
      data: {
        profitAndLoss: { revenue: totalRevenue, expenses: totalExpenses, netProfit: totalRevenue - totalExpenses },
        balanceSheet: { assets: { accountsReceivable: arTotal, cashAndEquivalents: totalCash }, liabilities: { accountsPayable: apTotal } },
        cashFlow: { operatingActivities: (totalRevenue - totalExpenses) - arTotal + apTotal }
      }
    });
  } catch (error) { handleError(res, error); }
};

// ================= COST ACCOUNTING =================

exports.getCosting = async (req, res) => {
  try {
    const ledgers = await FinanceLedger.find({ status: 'Posted' });
    const AP = await FinanceAP.find();
    
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalOverheadCost = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    
    ledgers.forEach(l => {
      const name = l.accountName.toLowerCase();
      
      const isRevenue = name.includes('revenue') || name.includes('sales');
      const isExpense = name.includes('expense') || name.includes('cost') || name.includes('purchase') || name.includes('labor') || name.includes('overhead') || name.includes('material');
      
      if (isRevenue) {
        if (l.type === 'Credit') totalRevenue += l.amount;
        else if (l.type === 'Debit') totalRevenue -= l.amount;
      }
      if (isExpense) {
        if (l.type === 'Debit') totalExpenses += l.amount;
        else if (l.type === 'Credit') totalExpenses -= l.amount;
      }
      
      if (name.includes('material') || name.includes('inventory') || name.includes('purchase')) {
        if (l.type === 'Debit') totalMaterialCost += l.amount;
        else if (l.type === 'Credit') totalMaterialCost -= l.amount;
      }
      if (name.includes('labor') || name.includes('salary') || name.includes('wage')) {
        if (l.type === 'Debit') totalLaborCost += l.amount;
        else if (l.type === 'Credit') totalLaborCost -= l.amount;
      }
      if (name.includes('overhead') || name.includes('rent') || name.includes('utility') || name.includes('maintenance')) {
        if (l.type === 'Debit') totalOverheadCost += l.amount;
        else if (l.type === 'Credit') totalOverheadCost -= l.amount;
      }
    });

    if (totalMaterialCost === 0 && AP.length > 0) {
      totalMaterialCost = AP.reduce((acc, bill) => acc + bill.totalAmount, 0);
    }

    const cogs = totalMaterialCost + totalLaborCost + totalOverheadCost;
    
    let grossMargin = '0%';
    let netMargin = '0%';

    if (totalRevenue > 0) {
      grossMargin = `${(((totalRevenue - cogs) / totalRevenue) * 100).toFixed(1)}%`;
      netMargin = `${(((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)}%`;
    }

    const data = {
      materialCosting: { totalMaterialCost, variance: 'N/A' },
      productionCosting: { totalLaborCost, totalOverheadCost },
      profitability: { grossMargin, netMargin }
    };
    
    res.json({ success: true, data });
  } catch (error) { handleError(res, error); }
};

const { handleError } = require('../utils/errorHandler');
const DispatchPlan = require('../models/DispatchPlan');
const DispatchExecution = require('../models/DispatchExecution');
const DeliveryTracking = require('../models/DeliveryTracking');
const SalesOrder = require('../models/SalesOrder');
const InventoryStock = require('../models/InventoryStock');
const InventoryTransaction = require('../models/InventoryTransaction');
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

// ================= Dispatch Planning =================

exports.getAllPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    
    const plans = await DispatchPlan.find()
      .populate('salesOrderId', 'orderNumber customerName expectedDeliveryDate')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await DispatchPlan.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: plans });
  } catch (error) { handleError(res, error); }
};

exports.createPlan = async (req, res) => {
  try {
    req.body.planNumber = `DP-${Date.now().toString().slice(-6)}`;
    const plan = await DispatchPlan.create(req.body);
    await logAudit('CREATE', 'DispatchPlan', plan._id, req.user._id);
    res.status(201).json({ success: true, data: plan });
  } catch (error) { handleError(res, error); }
};

exports.updatePlan = async (req, res) => {
  try {
    // If scheduling is provided, update status
    if (req.body.shipmentSchedule && req.body.shipmentSchedule.isScheduled) {
      req.body.status = 'Scheduled';
    }
    // If vehicle is assigned, update status
    if (req.body.vehicleAssignment && req.body.vehicleAssignment.isAssigned) {
      req.body.status = 'Assigned';
    }

    const plan = await DispatchPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    
    await logAudit('UPDATE', 'DispatchPlan', plan._id, req.user._id);
    res.json({ success: true, data: plan });
  } catch (error) { handleError(res, error); }
};

// ================= Dispatch Execution =================

exports.getAllExecutions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const executions = await DispatchExecution.find()
      .populate({
        path: 'dispatchPlanId',
        populate: { path: 'salesOrderId', select: 'orderNumber customerName' }
      })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await DispatchExecution.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: executions });
  } catch (error) { handleError(res, error); }
};

exports.recordExecution = async (req, res) => {
  try {
    // Check if execution exists for this plan
    let execution = await DispatchExecution.findOne({ dispatchPlanId: req.body.dispatchPlanId });

    if (!execution) {
      // Create new execution
      req.body.executionNumber = `DE-${Date.now().toString().slice(-6)}`;
      execution = await DispatchExecution.create(req.body);
      await logAudit('CREATE', 'DispatchExecution', execution._id, req.user._id);
    } else {
      // Update existing
      execution = await DispatchExecution.findByIdAndUpdate(execution._id, req.body, { new: true });
      await logAudit('UPDATE', 'DispatchExecution', execution._id, req.user._id);
    }

    // Auto update overallStatus based on inner statuses
    if (execution.dispatch.isConfirmed) execution.overallStatus = 'Dispatched';
    else if (execution.loading.status === 'Completed') execution.overallStatus = 'Loading';
    else if (execution.packing.status === 'Completed') execution.overallStatus = 'Packing';
    
    await execution.save();

    // If Dispatched, auto-create a DeliveryTracking record if it doesn't exist
    if (execution.overallStatus === 'Dispatched') {
      const existingTrack = await DeliveryTracking.findOne({ dispatchExecutionId: execution._id });
      if (!existingTrack) {
        await DeliveryTracking.create({
          trackingNumber: `TRK-${Date.now().toString().slice(-6)}`,
          dispatchExecutionId: execution._id,
          currentLocation: 'Origin Facility',
          statusUpdates: [{ location: 'Origin Facility', status: 'Dispatched', remarks: 'Shipment has left the facility' }]
        });
      }
    }

    res.json({ success: true, data: execution });
  } catch (error) { handleError(res, error); }
};

// ================= Delivery Tracking =================

exports.getAllTrackings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const trackings = await DeliveryTracking.find()
      .populate({
        path: 'dispatchExecutionId',
        populate: { 
          path: 'dispatchPlanId', 
          populate: { path: 'salesOrderId', select: 'orderNumber customerName' } 
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);
      
    const total = await DeliveryTracking.countDocuments();
    res.json({ success: true, pagination: { page, limit, total, pages: Math.ceil(total/limit) }, data: trackings });
  } catch (error) { handleError(res, error); }
};

exports.updateTracking = async (req, res) => {
  try {
    const tracking = await DeliveryTracking.findById(req.params.id);
    if (!tracking) return res.status(404).json({ success: false, message: 'Tracking record not found' });

    // Push new status update
    if (req.body.newStatusUpdate) {
      tracking.statusUpdates.push(req.body.newStatusUpdate);
      tracking.currentLocation = req.body.newStatusUpdate.location;
      tracking.overallStatus = req.body.newStatusUpdate.status;
    }

    await tracking.save();
    await logAudit('UPDATE', 'DeliveryTracking', tracking._id, req.user._id);
    res.json({ success: true, data: tracking });
  } catch (error) { handleError(res, error); }
};

exports.confirmDelivery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tracking = await DeliveryTracking.findById(req.params.id)
      .populate({
        path: 'dispatchExecutionId',
        populate: { path: 'dispatchPlanId', select: 'salesOrderId' }
      }).session(session);
    if (!tracking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Tracking record not found' });
    }

    tracking.deliveryConfirmation = {
      isDelivered: true,
      deliveredDate: new Date(),
      receiverName: req.body.receiverName,
      receiverContact: req.body.receiverContact,
      proofNotes: req.body.proofNotes
    };
    tracking.overallStatus = 'Delivered';
    tracking.currentLocation = 'Destination';
    
    tracking.statusUpdates.push({
      location: 'Destination',
      status: 'Delivered',
      remarks: 'Delivery Confirmed'
    });

    await tracking.save({ session });

    // Update Sales Order status to Dispatched on delivery confirmation
    const salesOrderId = tracking?.dispatchExecutionId?.dispatchPlanId?.salesOrderId;
    if (salesOrderId) {
      const so = await SalesOrder.findByIdAndUpdate(salesOrderId, {
        status: 'Dispatched',
        'trackingStatus.dispatchStatus': 'Delivered'
      }, { new: true, session });
      
      if (so && so.items && so.items.length > 0) {
        for (const item of so.items) {
          let remainingQty = item.quantity;
          const stocks = await InventoryStock.find({ materialId: item.productId, quantityAvailable: { $gt: 0 } })
            .sort({ postingDate: 1 }).session(session);
            
          for (let stock of stocks) {
            if (remainingQty <= 0) break;
            const deduct = Math.min(stock.quantityAvailable, remainingQty);
            stock.quantityAvailable -= deduct;
            remainingQty -= deduct;
            await stock.save({ session });
            
            await InventoryTransaction.create([{
              materialId: item.productId,
              transactionType: 'Material Issue',
              quantity: deduct,
              referenceId: so._id,
              referenceType: 'SalesOrder',
              notes: 'Finished Goods Dispatch',
              performedBy: req.user._id
            }], { session });
          }
          if (remainingQty > 0) {
            throw new Error(`Insufficient stock for dispatch of product ID ${item.productId}`);
          }
        }
      }
    }

    await logAudit('UPDATE', 'DeliveryTracking', tracking._id, req.user._id);
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: tracking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error);
  }
};

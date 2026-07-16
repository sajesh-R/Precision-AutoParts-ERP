const DispatchPlan = require('../models/DispatchPlan');
const DispatchExecution = require('../models/DispatchExecution');
const DeliveryTracking = require('../models/DeliveryTracking');
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

// ================= Dispatch Planning =================

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await DispatchPlan.find()
      .populate('salesOrderId', 'orderNumber customerName expectedDeliveryDate')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createPlan = async (req, res) => {
  try {
    req.body.planNumber = `DP-${Date.now().toString().slice(-6)}`;
    const plan = await DispatchPlan.create(req.body);
    await logAudit('CREATE', 'DispatchPlan', plan._id, req.user._id);
    res.status(201).json({ success: true, data: plan });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
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
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Dispatch Execution =================

exports.getAllExecutions = async (req, res) => {
  try {
    const executions = await DispatchExecution.find()
      .populate({
        path: 'dispatchPlanId',
        populate: { path: 'salesOrderId', select: 'orderNumber customerName' }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: executions });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
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
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// ================= Delivery Tracking =================

exports.getAllTrackings = async (req, res) => {
  try {
    const trackings = await DeliveryTracking.find()
      .populate({
        path: 'dispatchExecutionId',
        populate: { 
          path: 'dispatchPlanId', 
          populate: { path: 'salesOrderId', select: 'orderNumber customerName' } 
        }
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: trackings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
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
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const tracking = await DeliveryTracking.findById(req.params.id)
      .populate({
        path: 'dispatchExecutionId',
        populate: { path: 'dispatchPlanId', select: 'salesOrderId' }
      });
    if (!tracking) return res.status(404).json({ success: false, message: 'Tracking record not found' });

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

    await tracking.save();

    // Update Sales Order status to Dispatched on delivery confirmation
    try {
      const salesOrderId = tracking?.dispatchExecutionId?.dispatchPlanId?.salesOrderId;
      if (salesOrderId) {
        await SalesOrder.findByIdAndUpdate(salesOrderId, {
          status: 'Dispatched',
          'trackingStatus.dispatchStatus': 'Delivered'
        });
      }
    } catch (soErr) { console.error('SO update error on delivery:', soErr.message); }

    await logAudit('UPDATE', 'DeliveryTracking', tracking._id, req.user._id);
    res.json({ success: true, data: tracking });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

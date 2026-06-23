const { Plant, Branch, Warehouse, CostCenter, BusinessUnit, CompanyProfile } = require('../models/CompanyStructure');
const { ApprovalConfig, ApprovalRequest } = require('../models/Approval');

// Generic helper for simple CRUD
const getGeneric = (Model) => async (req, res) => {
  try {
    const data = await Model.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGeneric = (Model) => async (req, res) => {
  try {
    // Check if an ApprovalConfig exists for this module
    const config = await ApprovalConfig.findOne({ module: Model.modelName, action: 'create', isActive: true });
    
    if (config && config.levels && config.levels.length > 0) {
      // Intercept and create an ApprovalRequest instead
      const approvalReq = await ApprovalRequest.create({
        module: Model.modelName,
        action: 'create',
        payload: req.body,
        requestedBy: req.user._id,
        currentLevel: 1,
        requiredLevels: config.levels.map(l => ({
          level: l.level,
          roleId: l.roleId,
          status: 'Pending'
        }))
      });
      return res.status(202).json({ success: true, message: 'Request submitted for approval', data: approvalReq });
    }

    const data = await Model.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGeneric = (Model) => async (req, res) => {
  try {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Custom logic for Plants
exports.getPlants = async (req, res) => {
  try {
    const plants = await Plant.find().populate('managerId', 'firstName lastName email');
    res.status(200).json({ success: true, count: plants.length, data: plants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createPlant = createGeneric(Plant);
exports.updatePlant = updateGeneric(Plant);

// Custom logic for Branches (Data Access Restriction)
exports.getBranches = async (req, res) => {
  try {
    let query = {};
    if (req.user.role.name !== 'Super Admin' && req.user.plantId) {
      query.plantId = req.user.plantId;
    }
    const branches = await Branch.find(query).populate('plantId', 'name code');
    res.status(200).json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createBranch = createGeneric(Branch);
exports.updateBranch = updateGeneric(Branch);

// Warehouses
exports.getWarehouses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role.name !== 'Super Admin' && req.user.plantId) {
      query.plantId = req.user.plantId;
    }
    const warehouses = await Warehouse.find(query).populate('plantId', 'name code');
    res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createWarehouse = createGeneric(Warehouse);
exports.updateWarehouse = updateGeneric(Warehouse);

// Cost Centers
exports.getCostCenters = getGeneric(CostCenter);
exports.createCostCenter = createGeneric(CostCenter);
exports.updateCostCenter = updateGeneric(CostCenter);

// Business Units
exports.getBusinessUnits = getGeneric(BusinessUnit);
exports.createBusinessUnit = createGeneric(BusinessUnit);
exports.updateBusinessUnit = updateGeneric(BusinessUnit);

// Company Profiles
exports.getCompanyProfiles = getGeneric(CompanyProfile);
exports.createCompanyProfile = createGeneric(CompanyProfile);
exports.updateCompanyProfile = updateGeneric(CompanyProfile);

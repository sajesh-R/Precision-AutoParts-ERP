const { handleError } = require('../utils/errorHandler');
const { Plant, Department, CostCenter, BusinessUnit, Company } = require('../models/CompanyStructure');
const { Warehouse } = require('../models/MasterWarehouse');

// Generic helper for simple CRUD
const getGeneric = (Model, populates = []) => async (req, res) => {
  try {
    let query = Model.find();
    populates.forEach(p => { query = query.populate(p); });
    const data = await query;
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    handleError(res, error);
  }
};

// Organization structure masters save directly — no approval required.
// Approval workflow applies only to transactional documents (PO, SO, GRN, etc.)
const createGeneric = (Model) => async (req, res) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

const updateGeneric = (Model) => async (req, res) => {
  try {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

// Companies
exports.getCompanyProfiles = getGeneric(Company);
exports.createCompanyProfile = createGeneric(Company);
exports.updateCompanyProfile = updateGeneric(Company);

// Business Units
exports.getBusinessUnits = getGeneric(BusinessUnit, ['companyId']);
exports.createBusinessUnit = createGeneric(BusinessUnit);
exports.updateBusinessUnit = updateGeneric(BusinessUnit);

// Plants
exports.getPlants = getGeneric(Plant, ['companyId', 'businessUnitId', 'warehouseId']);
exports.createPlant = createGeneric(Plant);
exports.updatePlant = updateGeneric(Plant);

// Departments
exports.getDepartments = getGeneric(Department, ['plantId']);
exports.createDepartment = createGeneric(Department);
exports.updateDepartment = updateGeneric(Department);

// Warehouses (Still kept here for backward compatibility in routing if needed, but belongs to Warehouse structure ideally)
exports.getWarehouses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role.name !== 'Super Admin' && req.user.plantId) {
      query.plantId = req.user.plantId;
    }
    const warehouses = await Warehouse.find(query).populate('plantId', 'name code');
    res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    handleError(res, error);
  }
};
exports.createWarehouse = createGeneric(Warehouse);
exports.updateWarehouse = updateGeneric(Warehouse);

// Cost Centers
exports.getCostCenters = getGeneric(CostCenter);
exports.createCostCenter = createGeneric(CostCenter);
exports.updateCostCenter = updateGeneric(CostCenter);

// Legacy Branches (Disabled/Stubbed to avoid route crashes)
exports.getBranches = async (req, res) => {
  res.status(200).json({ success: true, count: 0, data: [] });
};
exports.createBranch = async (req, res) => {
  res.status(400).json({ success: false, message: 'Branch is deprecated' });
};
exports.updateBranch = async (req, res) => {
  res.status(400).json({ success: false, message: 'Branch is deprecated' });
};

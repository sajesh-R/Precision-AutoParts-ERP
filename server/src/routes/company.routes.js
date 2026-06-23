const express = require('express');
const { 
  getPlants, createPlant, updatePlant,
  getBranches, createBranch, updateBranch,
  getWarehouses, createWarehouse, updateWarehouse,
  getCostCenters, createCostCenter, updateCostCenter,
  getBusinessUnits, createBusinessUnit, updateBusinessUnit,
  getCompanyProfiles, createCompanyProfile, updateCompanyProfile
} = require('../controllers/company.controller');
const { protect, requirePermission } = require('../middlewares/auth.middleware');
const { logActivity } = require('../middlewares/audit.middleware');

const router = express.Router();

router.use(protect);

router.route('/profiles')
  .get(requirePermission('CompanySetup', 'read'), getCompanyProfiles)
  .post(requirePermission('CompanySetup', 'create'), logActivity('CompanyProfile'), createCompanyProfile);
router.put('/profiles/:id', requirePermission('CompanySetup', 'update'), logActivity('CompanyProfile'), updateCompanyProfile);

// Dynamic routes for typical entities
router.route('/plants')
  .get(requirePermission('CompanySetup', 'read'), getPlants)
  .post(requirePermission('CompanySetup', 'create'), logActivity('Plant'), createPlant);
router.put('/plants/:id', requirePermission('CompanySetup', 'update'), logActivity('Plant'), updatePlant);

router.route('/branches')
  .get(requirePermission('CompanySetup', 'read'), getBranches)
  .post(requirePermission('CompanySetup', 'create'), logActivity('Branch'), createBranch);
router.put('/branches/:id', requirePermission('CompanySetup', 'update'), logActivity('Branch'), updateBranch);

router.route('/warehouses')
  .get(requirePermission('CompanySetup', 'read'), getWarehouses)
  .post(requirePermission('CompanySetup', 'create'), logActivity('Warehouse'), createWarehouse);
router.put('/warehouses/:id', requirePermission('CompanySetup', 'update'), logActivity('Warehouse'), updateWarehouse);

router.route('/cost-centers')
  .get(requirePermission('CompanySetup', 'read'), getCostCenters)
  .post(requirePermission('CompanySetup', 'create'), logActivity('CostCenter'), createCostCenter);
router.put('/cost-centers/:id', requirePermission('CompanySetup', 'update'), logActivity('CostCenter'), updateCostCenter);

router.route('/business-units')
  .get(requirePermission('CompanySetup', 'read'), getBusinessUnits)
  .post(requirePermission('CompanySetup', 'create'), logActivity('BusinessUnit'), createBusinessUnit);
router.put('/business-units/:id', requirePermission('CompanySetup', 'update'), logActivity('BusinessUnit'), updateBusinessUnit);

module.exports = router;

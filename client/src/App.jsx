import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import CEODashboard from './pages/dashboards/CEODashboard';
import SalesDashboard from './pages/dashboards/SalesDashboard';
import ProcurementDashboard from './pages/dashboards/ProcurementDashboard';
import InventoryDashboard from './pages/dashboards/InventoryDashboard';
import ProductionDashboard from './pages/dashboards/ProductionDashboard';
import QualityDashboard from './pages/dashboards/QualityDashboard';
import MaintenanceDashboard from './pages/dashboards/MaintenanceDashboard';

import CompanySetup from './pages/company/CompanySetup';
import UserManagement from './pages/users/UserManagement';
import RolesPermissions from './pages/roles/RolesPermissions';
import ApprovalRights from './pages/roles/ApprovalRights';
import AuditLogs from './pages/audit/AuditLogs';
import ResetPassword from './pages/auth/ResetPassword';
import ApprovalCenter from './pages/approvals/ApprovalCenter';

// Master Data Imports
import CustomerMaster from './pages/master/CustomerMaster';
import VendorMaster from './pages/master/VendorMaster';
import ProductMaster from './pages/master/ProductMaster';
import MaterialMaster from './pages/master/MaterialMaster';
import UomMaster from './pages/master/UomMaster';
import WarehouseMaster from './pages/master/WarehouseMaster';
import MachineMaster from './pages/master/MachineMaster';
import WorkCenterMaster from './pages/master/WorkCenterMaster';
import SystemConfiguration from './pages/master/SystemConfiguration';

// Engineering Management Imports
import BomMaster from './pages/engineering/BomMaster';
import RoutingMaster from './pages/engineering/RoutingMaster';
import EngineeringChange from './pages/engineering/EngineeringChange';

// Sales Management Imports
import InquiryMaster from './pages/sales/InquiryMaster';
import QuotationMaster from './pages/sales/QuotationMaster';
import SalesOrderMaster from './pages/sales/SalesOrderMaster';

// Demand Planning Imports
import DemandForecasting from './pages/demand/DemandForecasting';
import DemandConsolidation from './pages/demand/DemandConsolidation';

// MRP Imports
import MrpExecution from './pages/mrp/MrpExecution';
import ShortageAnalysis from './pages/mrp/ShortageAnalysis';
import MrpRecommendations from './pages/mrp/MrpRecommendations';

// Capacity Planning Imports
import MachineCapacity from './pages/capacity/MachineCapacity';
import LaborCapacity from './pages/capacity/LaborCapacity';
import ProductionScheduling from './pages/capacity/ProductionScheduling';

// Procurement Imports
import PurchaseRequisition from './pages/procurement/PurchaseRequisition';
import RFQManagement from './pages/procurement/RFQManagement';
import PurchaseOrder from './pages/procurement/PurchaseOrder';
import VendorPerformance from './pages/procurement/VendorPerformance';

// Goods Receipt Imports
import GoodsReceiptNote from './pages/goods-receipt/GoodsReceiptNote';
import QualityInspection from './pages/goods-receipt/QualityInspection';
import InventoryPosting from './pages/goods-receipt/InventoryPosting';

// Inventory Management Imports
import InventoryControl from './pages/inventory/InventoryControl';
import InventoryTransactions from './pages/inventory/InventoryTransactions';
import InventoryOptimization from './pages/inventory/InventoryOptimization';
import InventoryValuation from './pages/inventory/InventoryValuation';
import TraceabilityManagement from './pages/inventory/TraceabilityManagement';

// Production Management Imports
import ProductionPlanning from './pages/production/ProductionPlanning';
import WorkOrderManagement from './pages/production/WorkOrderManagement';
import MaterialAllocation from './pages/production/MaterialAllocation';
import ProductionExecution from './pages/production/ProductionExecution';
import ProductionOutput from './pages/production/ProductionOutput';

// Shop Floor Management Imports
import OperatorManagement from './pages/shopfloor/OperatorManagement';
import MachineUtilization from './pages/shopfloor/MachineUtilization';
import DowntimeManagement from './pages/shopfloor/DowntimeManagement';
import ScrapManagement from './pages/shopfloor/ScrapManagement';

// Quality Management Imports
import IncomingQuality from './pages/quality/IncomingQuality';
import InProcessQuality from './pages/quality/InProcessQuality';
import FinalQuality from './pages/quality/FinalQuality';
import QualityParameters from './pages/quality/QualityParameters';
import NonConformanceManagement from './pages/quality/NonConformanceManagement';
import QualityAnalytics from './pages/quality/QualityAnalytics';

// Maintenance Management Imports
import PreventiveMaintenance from './pages/maintenance/PreventiveMaintenance';
import BreakdownMaintenance from './pages/maintenance/BreakdownMaintenance';
import SparePartsManagement from './pages/maintenance/SparePartsManagement';
import MaintenanceAnalytics from './pages/maintenance/MaintenanceAnalytics';

// Dispatch & Logistics Imports
import DispatchPlanning from './pages/dispatch/DispatchPlanning';
import DispatchExecution from './pages/dispatch/DispatchExecution';
import DeliveryTracking from './pages/dispatch/DeliveryTracking';

// Finance & Accounting Imports
import AccountsReceivable from './pages/finance/AccountsReceivable';
import AccountsPayable from './pages/finance/AccountsPayable';
import GeneralLedger from './pages/finance/GeneralLedger';
import TaxManagement from './pages/finance/TaxManagement';
import FinancialStatements from './pages/finance/FinancialStatements';
import CostAccounting from './pages/finance/CostAccounting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Executive Dashboards Routes */}
            <Route path="dashboards/ceo" element={<CEODashboard />} />
            <Route path="dashboards/sales" element={<SalesDashboard />} />
            <Route path="dashboards/procurement" element={<ProcurementDashboard />} />
            <Route path="dashboards/inventory" element={<InventoryDashboard />} />
            <Route path="dashboards/production" element={<ProductionDashboard />} />
            <Route path="dashboards/quality" element={<QualityDashboard />} />
            <Route path="dashboards/maintenance" element={<MaintenanceDashboard />} />
            <Route path="approvals" element={<ApprovalCenter />} />

            <Route path="company" element={<CompanySetup />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="approval-rights" element={<ApprovalRights />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="master/customer" element={<CustomerMaster />} />
            <Route path="master/vendor" element={<VendorMaster />} />
            <Route path="master/product" element={<ProductMaster />} />
            <Route path="master/material" element={<MaterialMaster />} />
            <Route path="master/uom" element={<UomMaster />} />
            <Route path="master/warehouse" element={<WarehouseMaster />} />
            <Route path="master/machine" element={<MachineMaster />} />
            <Route path="master/workcenter" element={<WorkCenterMaster />} />
            <Route path="master/system-config" element={<SystemConfiguration />} />
            
            {/* Engineering Routes */}
            <Route path="engineering/bom" element={<BomMaster />} />
            <Route path="engineering/routing" element={<RoutingMaster />} />
            <Route path="engineering/change" element={<EngineeringChange />} />

            {/* Sales Routes */}
            <Route path="sales/inquiry" element={<InquiryMaster />} />
            <Route path="sales/quotation" element={<QuotationMaster />} />
            <Route path="sales/order" element={<SalesOrderMaster />} />

            {/* Demand Planning Routes */}
            <Route path="demand/forecasting" element={<DemandForecasting />} />
            <Route path="demand/consolidation" element={<DemandConsolidation />} />

            {/* MRP Routes */}
            <Route path="mrp/execution" element={<MrpExecution />} />
            <Route path="mrp/shortages" element={<ShortageAnalysis />} />
            <Route path="mrp/recommendations" element={<MrpRecommendations />} />

            {/* Capacity Planning Routes */}
            <Route path="capacity/machine" element={<MachineCapacity />} />
            <Route path="capacity/labor" element={<LaborCapacity />} />
            <Route path="capacity/schedule" element={<ProductionScheduling />} />

            {/* Procurement Routes */}
            <Route path="procurement/requisition" element={<PurchaseRequisition />} />
            <Route path="procurement/rfq" element={<RFQManagement />} />
            <Route path="procurement/po" element={<PurchaseOrder />} />
            <Route path="procurement/performance" element={<VendorPerformance />} />

            {/* Goods Receipt Routes */}
            <Route path="receipt/grn" element={<GoodsReceiptNote />} />
            <Route path="receipt/inspection" element={<QualityInspection />} />
            <Route path="receipt/inventory" element={<InventoryPosting />} />

            {/* Inventory Management Routes */}
            <Route path="inventory/control" element={<InventoryControl />} />
            <Route path="inventory/transactions" element={<InventoryTransactions />} />
            <Route path="inventory/optimization" element={<InventoryOptimization />} />
            <Route path="inventory/valuation" element={<InventoryValuation />} />
            <Route path="inventory/traceability" element={<TraceabilityManagement />} />

            {/* Production Management Routes */}
            <Route path="production/plan" element={<ProductionPlanning />} />
            <Route path="production/wo" element={<WorkOrderManagement />} />
            <Route path="production/allocation" element={<MaterialAllocation />} />
            <Route path="production/execution" element={<ProductionExecution />} />
            <Route path="production/output" element={<ProductionOutput />} />

            {/* Shop Floor Management Routes */}
            <Route path="shopfloor/operator" element={<OperatorManagement />} />
            <Route path="shopfloor/machine" element={<MachineUtilization />} />
            <Route path="shopfloor/downtime" element={<DowntimeManagement />} />
            <Route path="shopfloor/scrap" element={<ScrapManagement />} />

            {/* Quality Management Routes */}
            <Route path="quality/incoming" element={<IncomingQuality />} />
            <Route path="quality/in-process" element={<InProcessQuality />} />
            <Route path="quality/final" element={<FinalQuality />} />
            <Route path="quality/parameters" element={<QualityParameters />} />
            <Route path="quality/ncr" element={<NonConformanceManagement />} />
            <Route path="quality/analytics" element={<QualityAnalytics />} />

            {/* Maintenance Management Routes */}
            <Route path="maintenance/preventive" element={<PreventiveMaintenance />} />
            <Route path="maintenance/breakdown" element={<BreakdownMaintenance />} />
            <Route path="maintenance/sparepart" element={<SparePartsManagement />} />
            <Route path="maintenance/analytics" element={<MaintenanceAnalytics />} />

            {/* Dispatch & Logistics Routes */}
            <Route path="dispatch/planning" element={<DispatchPlanning />} />
            <Route path="dispatch/execution" element={<DispatchExecution />} />
            <Route path="dispatch/tracking" element={<DeliveryTracking />} />

            {/* Finance & Accounting Routes */}
            <Route path="finance/ar" element={<AccountsReceivable />} />
            <Route path="finance/ap" element={<AccountsPayable />} />
            <Route path="finance/ledger" element={<GeneralLedger />} />
            <Route path="finance/tax" element={<TaxManagement />} />
            <Route path="finance/statements" element={<FinancialStatements />} />
            <Route path="finance/costing" element={<CostAccounting />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

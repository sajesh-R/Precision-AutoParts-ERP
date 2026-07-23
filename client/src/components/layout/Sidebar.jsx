import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  Shield,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Wrench,
  ShoppingCart,
  TrendingUp,
  Settings2,
  CalendarDays,
  Truck,
  PackageCheck,
  Boxes,
  Hammer,
  Stethoscope,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [engineeringOpen, setEngineeringOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [demandOpen, setDemandOpen] = useState(false);
  const [mrpOpen, setMrpOpen] = useState(false);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [procurementOpen, setProcurementOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [productionOpen, setProductionOpen] = useState(false);
  const [shopfloorOpen, setShopfloorOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { path: '/approvals', label: 'Approval Center', icon: <ClipboardCheck size={16} /> },
    { path: '/approval-rights', label: 'Approval Rights', icon: <ShieldAlert size={16} /> },
    { path: '/company', label: 'Company Setup', icon: <Settings size={16} /> },
    { path: '/users', label: 'User Management', icon: <Users size={16} /> },
    { path: '/roles', label: 'Roles & Permissions', icon: <Shield size={16} /> },
    { path: '/audit', label: 'Audit Logs', icon: <Activity size={16} /> },
  ];

  const dashboardItems = [
    { path: '/dashboards/ceo', label: 'CEO Dashboard' },
    { path: '/dashboards/sales', label: 'Sales Dashboard' },
    { path: '/dashboards/procurement', label: 'Procurement Dashboard' },
    { path: '/dashboards/inventory', label: 'Inventory Dashboard' },
    { path: '/dashboards/production', label: 'Production Dashboard' },
    { path: '/dashboards/quality', label: 'Quality Dashboard' },
    { path: '/dashboards/maintenance', label: 'Maintenance Dashboard' }
  ];

  const masterDataItems = [
    { path: '/master/customer', label: 'Customer Master' },
    { path: '/master/vendor', label: 'Vendor Master' },
    { path: '/master/product', label: 'Product Master' },
    { path: '/master/material', label: 'Raw Material Master' },
    { path: '/master/uom', label: 'UOM Master' },
    { path: '/master/warehouse', label: 'Warehouse Config' },
    { path: '/master/machine', label: 'Machine Master' },
    { path: '/master/workcenter', label: 'Work Center Master' },
    { path: '/master/system-config', label: 'System Configuration' },
  ];

  const engineeringItems = [
    { path: '/engineering/bom', label: 'Bill of Materials' },
    { path: '/engineering/routing', label: 'Routing Management' },
    { path: '/engineering/change', label: 'Engineering Change (ECM)' }
  ];

  const salesItems = [
    { path: '/sales/inquiry', label: 'Customer Inquiries' },
    { path: '/sales/quotation', label: 'Quotations' },
    { path: '/sales/order', label: 'Sales Orders' }
  ];

  const demandItems = [
    { path: '/demand/forecasting', label: 'Demand Forecasting' },
    { path: '/demand/consolidation', label: 'Demand Consolidation' }
  ];

  const mrpItems = [
    { path: '/mrp/execution', label: 'MRP Execution' },
    { path: '/mrp/shortages', label: 'Shortage Analysis' },
    { path: '/mrp/recommendations', label: 'MRP Recommendations' }
  ];

  const capacityItems = [
    { path: '/capacity/machine', label: 'Machine Capacity' },
    { path: '/capacity/labor', label: 'Labor Capacity' },
    { path: '/capacity/schedule', label: 'Production Scheduling' }
  ];

  const procurementItems = [
    { path: '/procurement/requisition', label: 'Purchase Requisitions' },
    { path: '/procurement/rfq', label: 'RFQ Management' },
    { path: '/procurement/po', label: 'Purchase Orders' },
    { path: '/procurement/performance', label: 'Vendor Performance' }
  ];

  const receiptItems = [
    { path: '/receipt/grn', label: 'Goods Receipt Note' },
    { path: '/receipt/inspection', label: 'Quality Inspection' },
    { path: '/receipt/inventory', label: 'Inventory Posting' }
  ];

  const inventoryItems = [
    { path: '/inventory/control', label: 'Inventory Control' },
    { path: '/inventory/transactions', label: 'Inventory Transactions' },
    { path: '/inventory/optimization', label: 'Inventory Optimization' },
    { path: '/inventory/valuation', label: 'Inventory Valuation' },
    { path: '/inventory/traceability', label: 'Traceability Management' }
  ];

  const productionItems = [
    { path: '/production/plan', label: 'Production Planning' },
    { path: '/production/wo', label: 'Work Order Management' },
    { path: '/production/allocation', label: 'Material Allocation' },
    { path: '/production/execution', label: 'Production Execution' },
    { path: '/production/output', label: 'Production Output' }
  ];

  const shopfloorItems = [
    { path: '/shopfloor/operator', label: 'Operator Management' },
    { path: '/shopfloor/machine', label: 'Machine Utilization' },
    { path: '/shopfloor/downtime', label: 'Downtime Management' },
    { path: '/shopfloor/scrap', label: 'Scrap Management' }
  ];

  const qualityItems = [
    { path: '/quality/incoming', label: 'Incoming Quality' },
    { path: '/quality/in-process', label: 'In-Process Quality' },
    { path: '/quality/final', label: 'Final Quality' },
    { path: '/quality/parameters', label: 'Quality Parameters' },
    { path: '/quality/ncr', label: 'Non-Conformance (CAPA)' },
    { path: '/quality/analytics', label: 'Quality Analytics' }
  ];

  const maintenanceItems = [
    { path: '/maintenance/preventive', label: 'Preventive Maintenance' },
    { path: '/maintenance/breakdown', label: 'Breakdown Maintenance' },
    { path: '/maintenance/sparepart', label: 'Spare Parts Management' },
    { path: '/maintenance/analytics', label: 'Maintenance Analytics' }
  ];

  const dispatchItems = [
    { path: '/dispatch/planning', label: 'Dispatch Planning' },
    { path: '/dispatch/execution', label: 'Dispatch Execution' },
    { path: '/dispatch/tracking', label: 'Delivery Tracking' }
  ];

  const financeItems = [
    { path: '/finance/ar', label: 'Accounts Receivable' },
    { path: '/finance/ap', label: 'Accounts Payable' },
    { path: '/finance/ledger', label: 'General Ledger' },
    { path: '/finance/tax', label: 'Tax Management' },
    { path: '/finance/statements', label: 'Financial Statements' },
    { path: '/finance/costing', label: 'Cost Accounting' }
  ];

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
    textDecoration: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
  });

  return (
    <div style={{
      width: collapsed ? '48px' : '220px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      position: 'relative',
      height: '100%'
    }}>
      <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0' : '0 12px',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {!collapsed && (
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Precision Auto Parts</span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.slice(0, 6).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={navLinkStyle}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              {item.icon}
            </span>
            {!collapsed && (
              <span style={{ marginLeft: '8px', fontSize: '13px' }}>{item.label}</span>
            )}
          </NavLink>
        ))}

        {/* Executive Dashboards Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setDashboardOpen(!dashboardOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Executive Dashboards" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <BarChart3 size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Executive Dashboards</span>
                <ChevronRight size={14} style={{ transform: dashboardOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {dashboardOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {dashboardItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Master Data Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setMasterDataOpen(!masterDataOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Master Data" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Settings size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Master Data</span>
                <ChevronRight size={14} style={{ transform: masterDataOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {masterDataOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {masterDataItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Engineering Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setEngineeringOpen(!engineeringOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Engineering Management" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Wrench size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Engineering</span>
                <ChevronRight size={14} style={{ transform: engineeringOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {engineeringOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {engineeringItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Sales Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setSalesOpen(!salesOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Sales Management" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <ShoppingCart size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Sales</span>
                <ChevronRight size={14} style={{ transform: salesOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {salesOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {salesItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Demand Planning Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setDemandOpen(!demandOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Demand Planning" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <TrendingUp size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Demand Planning</span>
                <ChevronRight size={14} style={{ transform: demandOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {demandOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {demandItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* MRP Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setMrpOpen(!mrpOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "MRP" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Settings2 size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>MRP Engine</span>
                <ChevronRight size={14} style={{ transform: mrpOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {mrpOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {mrpItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Capacity Planning Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setCapacityOpen(!capacityOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Capacity Planning" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <CalendarDays size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Capacity Planning</span>
                <ChevronRight size={14} style={{ transform: capacityOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {capacityOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {capacityItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Procurement Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setProcurementOpen(!procurementOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Procurement" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Truck size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Procurement</span>
                <ChevronRight size={14} style={{ transform: procurementOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {procurementOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {procurementItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Goods Receipt Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setReceiptOpen(!receiptOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Goods Receipt" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <PackageCheck size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Goods Receipt</span>
                <ChevronRight size={14} style={{ transform: receiptOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {receiptOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {receiptItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setInventoryOpen(!inventoryOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Inventory" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Boxes size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Inventory</span>
                <ChevronRight size={14} style={{ transform: inventoryOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {inventoryOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {inventoryItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Production Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setProductionOpen(!productionOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Production" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Hammer size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Production</span>
                <ChevronRight size={14} style={{ transform: productionOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {productionOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {productionItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Shop Floor Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setShopfloorOpen(!shopfloorOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Shop Floor" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Wrench size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Shop Floor</span>
                <ChevronRight size={14} style={{ transform: shopfloorOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {shopfloorOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {shopfloorItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Quality Management Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setQualityOpen(!qualityOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Quality Management" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <ShieldCheck size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Quality</span>
                <ChevronRight size={14} style={{ transform: qualityOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {qualityOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {qualityItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Management Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setMaintenanceOpen(!maintenanceOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Maintenance Management" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Settings size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Maintenance</span>
                <ChevronRight size={14} style={{ transform: maintenanceOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {maintenanceOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {maintenanceItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Dispatch & Logistics Management Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setDispatchOpen(!dispatchOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Dispatch & Logistics" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <Truck size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Dispatch & Logistics</span>
                <ChevronRight size={14} style={{ transform: dispatchOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {dispatchOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {dispatchItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Finance & Accounting Collapsible Menu */}
        <div style={{ margin: '4px 0' }}>
          <button 
            onClick={() => setFinanceOpen(!financeOpen)}
            style={{ 
              width: '100%', border: 'none', background: 'none', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', padding: '6px 12px',
              color: 'var(--text-secondary)'
            }}
            title={collapsed ? "Finance & Accounting" : ""}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              <DollarSign size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ marginLeft: '8px', fontSize: '13px', flex: 1, textAlign: 'left' }}>Finance & Accounting</span>
                <ChevronRight size={14} style={{ transform: financeOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>
          
          {financeOpen && !collapsed && (
            <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
              {financeItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  style={({ isActive }) => ({
                    ...navLinkStyle({ isActive }),
                    padding: '4px 12px',
                    fontSize: '12px',
                    borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent'
                  })}
                >
                  <span style={{ marginLeft: '8px' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {menuItems.slice(6).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={navLinkStyle}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
              {item.icon}
            </span>
            {!collapsed && (
              <span style={{ marginLeft: '8px', fontSize: '13px' }}>{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
      
      {!collapsed && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
          v1.0.0 (Native)
        </div>
      )}
    </div>
  );
};

export default Sidebar;

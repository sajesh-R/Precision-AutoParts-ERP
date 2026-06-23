import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Truck, UserCheck, AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DispatchPlanning = () => {
  const [plans, setPlans] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('planning'); // planning, scheduling, vehicle
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const soRes = await axios.get('/sales/order');
      setSalesOrders(soRes.data.data.filter(so => so.status === 'Approved' || so.status === 'Processing'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/dispatch/planning');
      setPlans(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/dispatch/planning/${formData._id}`, formData);
      } else {
        await axios.post('/dispatch/planning', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving dispatch plan');
    }
  };

  const actionRenderer = (row) => {
    return (
      <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Calendar size={12} /> {activeTab === 'planning' ? 'Edit Plan' : activeTab === 'scheduling' ? 'Schedule' : 'Assign Vehicle'}
      </button>
    );
  };

  const baseColumns = [
    { header: 'Plan #', accessor: 'planNumber' },
    { header: 'Sales Order', render: (row) => <strong>{row.salesOrderId?.orderNumber} ({row.salesOrderId?.customerName})</strong> },
    { header: 'Planned Date', render: (row) => new Date(row.plannedDate).toLocaleDateString() },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Assigned' ? '#10b98115' : row.status === 'Scheduled' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.status === 'Assigned' ? '#10b981' : row.status === 'Scheduled' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const schedulingColumns = [
    ...baseColumns,
    { header: 'Scheduled Date', render: (row) => row.shipmentSchedule?.isScheduled ? new Date(row.shipmentSchedule.scheduledDate).toLocaleDateString() : '-' },
    { header: 'Carrier', render: (row) => row.shipmentSchedule?.carrierName || '-' }
  ];

  const vehicleColumns = [
    ...baseColumns,
    { header: 'Vehicle No.', render: (row) => row.vehicleAssignment?.vehicleNumber || '-' },
    { header: 'Driver', render: (row) => row.vehicleAssignment?.driverName || '-' }
  ];

  const getActiveColumns = () => {
    if (activeTab === 'scheduling') return schedulingColumns;
    if (activeTab === 'vehicle') return vehicleColumns;
    return baseColumns;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Dispatch Planning</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Plan deliveries, schedule shipments, and assign vehicles</p>
        </div>
        {activeTab === 'planning' && (
          <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
            <Calendar size={14} /> Create Delivery Plan
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('planning')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'planning' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'planning' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={16} /> Delivery Planning
        </button>
        <button 
          onClick={() => setActiveTab('scheduling')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'scheduling' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'scheduling' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Truck size={16} /> Shipment Scheduling
        </button>
        <button 
          onClick={() => setActiveTab('vehicle')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'vehicle' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'vehicle' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserCheck size={16} /> Vehicle Assignment
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={getActiveColumns()} data={plans} isLoading={loading} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'planning' ? (formData._id ? "Edit Plan" : "Create Plan") : activeTab === 'scheduling' ? "Schedule Shipment" : "Assign Vehicle"}>
        <form onSubmit={handleSave}>
          
          {activeTab === 'planning' && (
            <>
              <div className="input-group">
                <label className="input-label">Sales Order</label>
                <select className="input-field" required value={formData.salesOrderId?._id || formData.salesOrderId || ''} onChange={e => setFormData({...formData, salesOrderId: e.target.value})} disabled={!!formData._id}>
                  <option value="" disabled>Select Sales Order</option>
                  {salesOrders.map(so => <option key={so._id} value={so._id}>{so.orderNumber} - {so.customerName}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Planned Dispatch Date</label>
                <input type="date" className="input-field" required value={formData.plannedDate ? new Date(formData.plannedDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, plannedDate: e.target.value})} />
              </div>
            </>
          )}

          {activeTab === 'scheduling' && (
            <>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
                <strong>Plan #:</strong> {formData.planNumber}
              </div>
              <div className="input-group">
                <label className="input-label">Scheduled Ship Date</label>
                <input type="date" className="input-field" required value={formData.shipmentSchedule?.scheduledDate ? new Date(formData.shipmentSchedule.scheduledDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, shipmentSchedule: { ...formData.shipmentSchedule, scheduledDate: e.target.value }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Carrier Name</label>
                <input type="text" className="input-field" required value={formData.shipmentSchedule?.carrierName || ''} onChange={e => setFormData({...formData, shipmentSchedule: { ...formData.shipmentSchedule, carrierName: e.target.value }})} />
              </div>
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.shipmentSchedule?.isScheduled || false} onChange={e => setFormData({...formData, shipmentSchedule: { ...formData.shipmentSchedule, isScheduled: e.target.checked }})} />
                <label className="input-label" style={{ marginBottom: 0 }}>Confirm Schedule</label>
              </div>
            </>
          )}

          {activeTab === 'vehicle' && (
            <>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
                <strong>Plan #:</strong> {formData.planNumber}
              </div>
              <div className="input-group">
                <label className="input-label">Vehicle Number</label>
                <input type="text" className="input-field" required value={formData.vehicleAssignment?.vehicleNumber || ''} onChange={e => setFormData({...formData, vehicleAssignment: { ...formData.vehicleAssignment, vehicleNumber: e.target.value }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Driver Name</label>
                <input type="text" className="input-field" required value={formData.vehicleAssignment?.driverName || ''} onChange={e => setFormData({...formData, vehicleAssignment: { ...formData.vehicleAssignment, driverName: e.target.value }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Driver Contact</label>
                <input type="text" className="input-field" required value={formData.vehicleAssignment?.driverContact || ''} onChange={e => setFormData({...formData, vehicleAssignment: { ...formData.vehicleAssignment, driverContact: e.target.value }})} />
              </div>
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.vehicleAssignment?.isAssigned || false} onChange={e => setFormData({...formData, vehicleAssignment: { ...formData.vehicleAssignment, isAssigned: e.target.checked }})} />
                <label className="input-label" style={{ marginBottom: 0 }}>Confirm Assignment</label>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DispatchPlanning;

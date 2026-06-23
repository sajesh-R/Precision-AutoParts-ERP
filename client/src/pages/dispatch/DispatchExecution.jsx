import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DispatchExecution = () => {
  const [executions, setExecutions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('packing'); // packing, loading, dispatch
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const planRes = await axios.get('/dispatch/planning');
      setPlans(planRes.data.data.filter(p => p.status === 'Assigned' || p.status === 'Scheduled'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/dispatch/execution');
      setExecutions(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/dispatch/execution/${formData._id}`, formData);
      } else {
        await axios.post('/dispatch/execution', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording execution');
    }
  };

  const actionRenderer = (row) => {
    return (
      <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle size={12} /> Update
      </button>
    );
  };

  const baseColumns = [
    { header: 'Exec #', accessor: 'executionNumber' },
    { header: 'Plan #', render: (row) => row.dispatchPlanId?.planNumber || '-' },
    { header: 'Sales Order', render: (row) => row.dispatchPlanId?.salesOrderId?.orderNumber || '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.overallStatus === 'Dispatched' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.overallStatus === 'Dispatched' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.overallStatus}
      </span>
    )}
  ];

  const packingColumns = [
    ...baseColumns,
    { header: 'Packing Status', render: (row) => row.packing?.status || 'Pending' },
    { header: 'Total Boxes', render: (row) => row.packing?.totalBoxes || '-' }
  ];

  const loadingColumns = [
    ...baseColumns,
    { header: 'Loading Status', render: (row) => row.loading?.status || 'Pending' },
    { header: 'Loading Bay', render: (row) => row.loading?.loadingBay || '-' }
  ];

  const dispatchColumns = [
    ...baseColumns,
    { header: 'Dispatch Status', render: (row) => row.dispatch?.isConfirmed ? 'Confirmed' : 'Pending' },
    { header: 'Dispatched Date', render: (row) => row.dispatch?.dispatchDate ? new Date(row.dispatch.dispatchDate).toLocaleDateString() : '-' }
  ];

  const getActiveColumns = () => {
    if (activeTab === 'loading') return loadingColumns;
    if (activeTab === 'dispatch') return dispatchColumns;
    return packingColumns;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Dispatch Execution</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage packing, loading, and final dispatch confirmation</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Package size={14} /> Record Execution
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('packing')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'packing' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'packing' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Package size={16} /> Packing Management
        </button>
        <button 
          onClick={() => setActiveTab('loading')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'loading' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'loading' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Truck size={16} /> Loading Management
        </button>
        <button 
          onClick={() => setActiveTab('dispatch')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'dispatch' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'dispatch' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle size={16} /> Dispatch Confirmation
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={getActiveColumns()} data={executions} isLoading={loading} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Execution" : "Record Execution"}>
        <form onSubmit={handleSave}>
          
          <div className="input-group">
            <label className="input-label">Dispatch Plan</label>
            <select className="input-field" required value={formData.dispatchPlanId?._id || formData.dispatchPlanId || ''} onChange={e => setFormData({...formData, dispatchPlanId: e.target.value})} disabled={!!formData._id}>
              <option value="" disabled>Select Dispatch Plan</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.planNumber} - {p.salesOrderId?.orderNumber}</option>)}
              {formData._id && <option value={formData.dispatchPlanId?._id}>{formData.dispatchPlanId?.planNumber}</option>}
            </select>
          </div>

          {activeTab === 'packing' && (
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Packing Details</h3>
              <div className="input-group">
                <label className="input-label">Packing Status</label>
                <select className="input-field" required value={formData.packing?.status || 'Pending'} onChange={e => setFormData({...formData, packing: { ...formData.packing, status: e.target.value }})}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Total Boxes</label>
                <input type="number" className="input-field" required value={formData.packing?.totalBoxes || ''} onChange={e => setFormData({...formData, packing: { ...formData.packing, totalBoxes: parseInt(e.target.value) || 0 }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Packed By</label>
                <input type="text" className="input-field" required value={formData.packing?.packedBy || ''} onChange={e => setFormData({...formData, packing: { ...formData.packing, packedBy: e.target.value }})} />
              </div>
            </div>
          )}

          {activeTab === 'loading' && (
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Loading Details</h3>
              <div className="input-group">
                <label className="input-label">Loading Status</label>
                <select className="input-field" required value={formData.loading?.status || 'Pending'} onChange={e => setFormData({...formData, loading: { ...formData.loading, status: e.target.value }})}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Loading Bay</label>
                <input type="text" className="input-field" required value={formData.loading?.loadingBay || ''} onChange={e => setFormData({...formData, loading: { ...formData.loading, loadingBay: e.target.value }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Loaded By</label>
                <input type="text" className="input-field" required value={formData.loading?.loadedBy || ''} onChange={e => setFormData({...formData, loading: { ...formData.loading, loadedBy: e.target.value }})} />
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Dispatch Confirmation</h3>
              <div className="input-group">
                <label className="input-label">Dispatch Date</label>
                <input type="date" className="input-field" required value={formData.dispatch?.dispatchDate ? new Date(formData.dispatch.dispatchDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, dispatch: { ...formData.dispatch, dispatchDate: e.target.value }})} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirmed By</label>
                <input type="text" className="input-field" required value={formData.dispatch?.confirmedBy || ''} onChange={e => setFormData({...formData, dispatch: { ...formData.dispatch, confirmedBy: e.target.value }})} />
              </div>
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={formData.dispatch?.isConfirmed || false} onChange={e => setFormData({...formData, dispatch: { ...formData.dispatch, isConfirmed: e.target.checked }})} />
                <label className="input-label" style={{ marginBottom: 0 }}>Confirm Dispatch (This will create a Tracking Record)</label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Execution</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DispatchExecution;

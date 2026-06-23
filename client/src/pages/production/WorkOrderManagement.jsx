import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Hammer, CheckCircle, ShieldAlert } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const WorkOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await axios.get('/production/plan');
      // Plans that are Approved can be converted to Work Orders
      setApprovedPlans(res.data.data.filter(p => p.status === 'Approved'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/production/wo');
      setOrders(res.data.data);
    } catch (err) { console.error('Work Order fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/production/wo', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating work order');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/production/wo/${id}`, { status });
      fetchData();
    } catch (err) { alert('Error updating WO status'); }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'Created' && (
          <button onClick={() => updateStatus(row._id, 'Released')} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Release</button>
        )}
        {row.status === 'Completed' && (
          <button onClick={() => updateStatus(row._id, 'Closed')} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>Close WO</button>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'WO Number', accessor: 'workOrderNumber' },
    { header: 'Source Plan', render: (row) => row.productionPlanId?.planNumber || '-' },
    { header: 'Material Target', render: (row) => row.materialId?.name || '-' },
    { header: 'Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.targetQuantity}</strong> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Closed' ? '#10b98115' : row.status === 'Released' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.status === 'Closed' ? '#10b981' : row.status === 'Released' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Materials', render: (row) => (
      <span style={{ fontSize: '11px', color: row.materialStatus === 'Consumed' ? '#10b981' : 'var(--text-secondary)' }}>
        {row.materialStatus}
      </span>
    )},
    { header: 'Progress', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${row.progressPercentage}%`, backgroundColor: 'var(--accent-primary)' }}></div>
        </div>
        <span style={{ fontSize: '11px' }}>{row.progressPercentage}%</span>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Work Order Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Convert Plans to active Work Orders, release to shop floor, and finalize closure</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Hammer size={14} /> Generate Work Order
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={orders} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Work Order">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Select Approved Production Plan</label>
            <select className="input-field" required value={formData.productionPlanId || ''} onChange={e => setFormData({...formData, productionPlanId: e.target.value})}>
              <option value="" disabled>Select Approved Plan</option>
              {approvedPlans.map(p => <option key={p._id} value={p._id}>{p.planNumber} - {p.materialId?.name} (Qty: {p.plannedQuantity})</option>)}
            </select>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <ShieldAlert size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Note on Material Allocation:</strong><br/>
              Generating this Work Order will automatically simulate a BOM explosion and append required components to the "Material Allocation" queue for warehouse processing.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Generate Work Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrderManagement;

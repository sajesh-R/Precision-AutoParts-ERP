import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, Plus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ProductionPlanning = () => {
  const [plans, setPlans] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/production/plan');
      setPlans(res.data.data);
    } catch (err) { console.error('Plan fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/production/plan', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving production plan');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/production/plan/${id}`, { status });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const validateCapacity = async (id) => {
    try {
      await axios.post(`/production/plan/${id}/validate`);
      fetchData();
      alert('Capacity Validated Successfully!');
    } catch (err) { alert('Error validating capacity'); }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'Draft' && (
          <button onClick={() => updateStatus(row._id, 'Pending Approval')} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Submit</button>
        )}
        {row.status === 'Pending Approval' && (
          <>
            <button onClick={() => updateStatus(row._id, 'Approved')} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>Approve</button>
            <button onClick={() => updateStatus(row._id, 'Rejected')} className="btn-icon" style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Reject</button>
          </>
        )}
        {row.status === 'Approved' && !row.capacityValidated && (
          <button onClick={() => validateCapacity(row._id)} className="btn-icon" style={{ fontSize: '11px', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer' }}>Validate Cap</button>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'Plan #', accessor: 'planNumber' },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Target Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.plannedQuantity}</strong> },
    { header: 'Timeline', render: (row) => <span style={{ fontSize: '12px' }}>{new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}</span> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Approved' ? '#10b98115' : row.status === 'Rejected' ? '#ef444415' : 'var(--bg-tertiary)',
        color: row.status === 'Approved' ? '#10b981' : row.status === 'Rejected' ? '#ef4444' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Capacity', render: (row) => (
      row.capacityValidated ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}><CheckCircle size={12} /> Validated</span> : <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Pending</span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Production Planning</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Create targets, route for approval, and validate production capacity</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Plan
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={plans} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Production Plan">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Target Material (FG/WIP)</label>
            <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
              <option value="" disabled>Select Material</option>
              {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.category?.name || 'Uncategorized'})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Planned Target Quantity</label>
            <input type="number" className="input-field" required min="1" value={formData.plannedQuantity || ''} onChange={e => setFormData({...formData, plannedQuantity: parseInt(e.target.value)})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Production Start Date</label>
              <input type="date" className="input-field" required value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Expected End Date</label>
              <input type="date" className="input-field" required value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Draft Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionPlanning;

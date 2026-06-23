import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const LaborCapacity = () => {
  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ shiftType: 'Morning' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/capacity/labor');
      setCapacities(res.data.data);
    } catch (err) { console.error('Capacity fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/capacity/labor/${editingId}`, formData);
      } else {
        await axios.post('/capacity/labor', formData);
      }
      setIsModalOpen(false);
      setFormData({ shiftType: 'Morning' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      department: row.department,
      period: row.period,
      totalOperators: row.totalOperators,
      shiftType: row.shiftType,
      availableShiftHours: row.availableShiftHours,
      plannedWorkforceHours: row.plannedWorkforceHours,
      notes: row.notes || ''
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Department', accessor: 'department' },
    { header: 'Shift', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'
      }}>{row.shiftType}</span>
    )},
    { header: 'Operators', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Users size={12} color="var(--text-secondary)" /> {row.totalOperators}
      </div>
    )},
    { header: 'Available Hrs', render: (row) => (row.availableShiftHours ?? 0).toFixed(1) },
    { header: 'Planned Hrs', render: (row) => (row.plannedWorkforceHours ?? 0).toFixed(1) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Labor Capacity Planning</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Track operator availability, shift capacity, and workforce planning</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ shiftType: 'Morning' }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Plan Workforce
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={capacities} isLoading={loading} onEdit={handleEdit} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Labor Capacity Plan`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Department / Line</label>
              <input type="text" className="input-field" required value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Target Period (e.g. Week 42 - 2026)</label>
              <input type="text" className="input-field" required value={formData.period || ''} onChange={e => setFormData({...formData, period: e.target.value})} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Total Operators</label>
              <input type="number" className="input-field" required min="0" value={formData.totalOperators || ''} onChange={e => setFormData({...formData, totalOperators: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Shift Type</label>
              <select className="input-field" required value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value})}>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Available Shift Hours</label>
              <input type="number" className="input-field" required min="0" step="0.5" value={formData.availableShiftHours || ''} onChange={e => setFormData({...formData, availableShiftHours: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Planned Workforce Hours</label>
              <input type="number" className="input-field" required min="0" step="0.5" value={formData.plannedWorkforceHours || ''} onChange={e => setFormData({...formData, plannedWorkforceHours: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Plan' : 'Save Plan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LaborCapacity;

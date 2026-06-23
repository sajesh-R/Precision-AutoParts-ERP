import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, AlertTriangle, Settings2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MachineCapacity = () => {
  const [capacities, setCapacities] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await axios.get('/master/workcenter');
      setWorkCenters(res.data.data.filter(wc => wc.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/capacity/machine');
      setCapacities(res.data.data);
    } catch (err) { console.error('Capacity fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/capacity/machine/${editingId}`, formData);
      } else {
        await axios.post('/capacity/machine', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      workCenterId: row.workCenterId?._id || row.workCenterId,
      period: row.period,
      availableHours: row.availableHours,
      utilizedHours: row.utilizedHours,
      bottleneckDetails: row.bottleneckDetails || ''
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Work Center', render: (row) => row.workCenterId?.name || '-' },
    { header: 'Available Hrs', render: (row) => (row.availableHours ?? 0).toFixed(1) },
    { header: 'Utilized Hrs', render: (row) => (row.utilizedHours ?? 0).toFixed(1) },
    { header: 'Utilization', render: (row) => {
      const percent = row.utilizationPercentage || 0;
      const color = row.isBottleneck ? '#ef4444' : percent > 75 ? '#f59e0b' : '#10b981';
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(percent, 100)}%`, height: '100%', backgroundColor: color }} />
          </div>
          <span style={{ fontSize: '11px', color }}>{percent.toFixed(1)}%</span>
        </div>
      );
    }},
    { header: 'Status', render: (row) => row.isBottleneck ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>
        <AlertTriangle size={12} /> BOTTLENECK
      </span>
    ) : (
      <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Healthy</span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Machine Capacity Planning</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitor available capacity, utilization, and identify bottlenecks</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Record Capacity
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={capacities} isLoading={loading} onEdit={handleEdit} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Record'} Machine Capacity`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Work Center</label>
              <select className="input-field" required value={formData.workCenterId || ''} onChange={e => setFormData({...formData, workCenterId: e.target.value})}>
                <option value="" disabled>Select Work Center</option>
                {workCenters.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
              {workCenters.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please create a Work Center first.</p>}
            </div>
            <div className="input-group">
              <label className="input-label">Target Period (e.g. Week 42 - 2026)</label>
              <input type="text" className="input-field" required value={formData.period || ''} onChange={e => setFormData({...formData, period: e.target.value})} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Available Hours</label>
              <input type="number" className="input-field" required min="0" step="0.5" value={formData.availableHours || ''} onChange={e => setFormData({...formData, availableHours: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Utilized Hours (Actual/Planned)</label>
              <input type="number" className="input-field" required min="0" step="0.5" value={formData.utilizedHours || ''} onChange={e => setFormData({...formData, utilizedHours: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Bottleneck Details / Notes</label>
            <textarea className="input-field" rows="2" placeholder="If utilization exceeds 95%, this machine will be flagged automatically." value={formData.bottleneckDetails || ''} onChange={e => setFormData({...formData, bottleneckDetails: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Capacity' : 'Save Capacity'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MachineCapacity;

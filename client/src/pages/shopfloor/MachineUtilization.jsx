import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings2, Clock, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MachineUtilization = () => {
  const [machineAllocations, setMachineAllocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [macRes, woRes] = await Promise.all([
        axios.get('/master/machine'),
        axios.get('/production/wo')
      ]);
      setMachines(macRes.data.data.filter(m => m.isActive));
      setWorkOrders(woRes.data.data.filter(wo => ['Released', 'In-Progress'].includes(wo.status)));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shopfloor/machine');
      setMachineAllocations(res.data.data);
    } catch (err) { console.error('Machine fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/shopfloor/machine', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error allocating machine');
    }
  };

  const handleUpdateIdleTime = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/shopfloor/machine/${formData._id}`, { idleTimeMinutes: formData.idleTimeMinutes });
      setIsIdleModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating idle time');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/shopfloor/machine/${id}`, { status });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status !== 'Running' && (
          <button onClick={() => updateStatus(row._id, 'Running')} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>Set Running</button>
        )}
        {row.status === 'Running' && (
          <button onClick={() => updateStatus(row._id, 'Idle')} className="btn-icon" style={{ fontSize: '11px', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>Set Idle</button>
        )}
        <button onClick={() => { setFormData({ _id: row._id, idleTimeMinutes: row.idleTimeMinutes }); setIsIdleModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> Log Idle Time
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'Machine', render: (row) => <strong>{row.machineId?.name} ({row.machineId?.code})</strong> },
    { header: 'Work Order', render: (row) => row.workOrderId?.workOrderNumber || '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Running' ? '#10b98115' : row.status === 'Idle' ? '#f59e0b15' : '#ef444415',
        color: row.status === 'Running' ? '#10b981' : row.status === 'Idle' ? '#f59e0b' : '#ef4444'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Idle Time', render: (row) => <span style={{ color: row.idleTimeMinutes > 60 ? '#ef4444' : 'var(--text-secondary)' }}>{row.idleTimeMinutes} mins</span> },
    { header: 'Utilization %', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${row.utilizationPercentage}%`, backgroundColor: row.utilizationPercentage > 85 ? '#10b981' : row.utilizationPercentage > 70 ? '#f59e0b' : '#ef4444' }}></div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>{row.utilizationPercentage}%</span>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Machine Utilization</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Allocate factory hardware to Work Orders and monitor live utilization</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Settings2 size={14} /> Allocate Machine
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={machineAllocations} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Machine to Work Order">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Select Machine (From Capacity Planning)</label>
            <select className="input-field" required value={formData.machineId || ''} onChange={e => setFormData({...formData, machineId: e.target.value})}>
              <option value="" disabled>Select Factory Machine</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Target Work Order</label>
            <select className="input-field" required value={formData.workOrderId || ''} onChange={e => setFormData({...formData, workOrderId: e.target.value})}>
              <option value="" disabled>Select Active Work Order</option>
              {workOrders.map(wo => <option key={wo._id} value={wo._id}>{wo.workOrderNumber}</option>)}
            </select>
          </div>

          <div style={{ backgroundColor: '#3b82f615', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#3b82f6', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle size={16} /> Allocation restricts machine from being assigned to multiple active workflows.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Allocate Hardware</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIdleModalOpen} onClose={() => setIsIdleModalOpen(false)} title="Log Idle Time">
        <form onSubmit={handleUpdateIdleTime}>
          <div className="input-group">
            <label className="input-label">Total Idle Time (Minutes)</label>
            <input type="number" className="input-field" required min="0" value={formData.idleTimeMinutes || 0} onChange={e => setFormData({...formData, idleTimeMinutes: parseInt(e.target.value)})} />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Updating this will automatically recalculate the machine's overall utilization percentage against standard shift hours.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsIdleModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Idle Time</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MachineUtilization;

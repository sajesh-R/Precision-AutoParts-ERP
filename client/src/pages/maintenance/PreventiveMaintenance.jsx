import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Wrench, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const PreventiveMaintenance = () => {
  const [schedules, setSchedules] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExecModalOpen, setIsExecModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const macRes = await axios.get('/master/machine');
      setMachines(macRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/maintenance/preventive');
      setSchedules(res.data.data);
    } catch (err) { console.error('Schedule fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/maintenance/preventive/${formData._id}`, formData);
      } else {
        await axios.post('/maintenance/preventive', formData);
      }
      setIsModalOpen(false);
      setIsExecModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving schedule');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Wrench size={12} /> Edit
        </button>
        {row.status !== 'Completed' && (
          <button onClick={() => { setFormData(row); setIsExecModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle size={12} /> Execute
          </button>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'PM ID', accessor: 'scheduleNumber' },
    { header: 'Target Machine', render: (row) => <strong>{row.machineId?.name} ({row.machineId?.code})</strong> },
    { header: 'Task', render: (row) => <span style={{ fontSize: '12px' }}>{row.maintenanceTask}</span> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Completed' ? '#10b98115' : row.status === 'Overdue' ? '#ef444415' : row.status === 'In-Progress' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.status === 'Completed' ? '#10b981' : row.status === 'Overdue' ? '#ef4444' : row.status === 'In-Progress' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Technician', render: (row) => row.assignedTechnician || '-' },
    { header: 'Scheduled Date', render: (row) => <span style={{ color: new Date(row.scheduledDate) < new Date() && row.status !== 'Completed' ? '#ef4444' : 'inherit' }}>{new Date(row.scheduledDate).toLocaleDateString()}</span> },
    { header: 'Executed Date', render: (row) => row.executionDate ? new Date(row.executionDate).toLocaleDateString() : '-' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Preventive Maintenance</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Schedule routine machine maintenance and track execution to prevent breakdowns</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Calendar size={14} /> Schedule Maintenance
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={schedules} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Schedule" : "Create Maintenance Schedule"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Target Machine</label>
            <select className="input-field" required value={formData.machineId?._id || formData.machineId || ''} onChange={e => setFormData({...formData, machineId: e.target.value})} disabled={!!formData._id}>
              <option value="" disabled>Select Machine</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Maintenance Task Description</label>
            <input type="text" className="input-field" required value={formData.maintenanceTask || ''} onChange={e => setFormData({...formData, maintenanceTask: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Scheduled Date</label>
              <input type="date" className="input-field" required value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Assigned Technician</label>
              <input type="text" className="input-field" value={formData.assignedTechnician || ''} onChange={e => setFormData({...formData, assignedTechnician: e.target.value})} />
            </div>
          </div>

          {formData._id && (
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input-field" required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Scheduled">Scheduled</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Schedule</button>
          </div>
        </form>
      </Modal>

      {/* Execute Modal */}
      <Modal isOpen={isExecModalOpen} onClose={() => setIsExecModalOpen(false)} title="Execute Maintenance Activity">
        <form onSubmit={handleSave}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            <strong>Task:</strong> {formData.maintenanceTask}
          </div>

          <div className="input-group">
            <label className="input-label">Execution Status</label>
            <select className="input-field" required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Execution Notes</label>
            <textarea className="input-field" rows="3" required value={formData.executionNotes || ''} onChange={e => setFormData({...formData, executionNotes: e.target.value})}></textarea>
          </div>
          
          <div style={{ backgroundColor: '#10b98115', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
            Marking this as "Completed" will automatically record the current timestamp as the Execution Date.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsExecModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Execution</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default PreventiveMaintenance;

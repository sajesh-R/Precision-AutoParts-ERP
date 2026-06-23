import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, PowerOff, Activity } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DowntimeManagement = () => {
  const [downtimes, setDowntimes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const res = await axios.get('/shopfloor/downtime');
      setDowntimes(res.data.data);
    } catch (err) { console.error('Downtime fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/shopfloor/downtime/${formData._id}`, formData);
      } else {
        await axios.post('/shopfloor/downtime', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording downtime');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} /> Edit
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'DT Log', accessor: 'downtimeNumber' },
    { header: 'Hardware', render: (row) => <strong>{row.machineId?.name} ({row.machineId?.code})</strong> },
    { header: 'Type', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content',
        backgroundColor: row.type === 'Unplanned' ? '#ef444415' : '#3b82f615',
        color: row.type === 'Unplanned' ? '#ef4444' : '#3b82f6'
      }}>
        {row.type === 'Unplanned' && <AlertTriangle size={10} />}
        {row.type}
      </span>
    )},
    { header: 'Reason', render: (row) => <span style={{ fontSize: '12px' }}>{row.reason}</span> },
    { header: 'Duration', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.durationMinutes} min</strong> },
    { header: 'Impact Analysis', render: (row) => <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.impactAnalysis || '-'}</span> },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Downtime Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Log and analyze machine stoppage events across the factory floor</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ type: 'Unplanned' }); setIsModalOpen(true); }}>
          <PowerOff size={14} /> Record Downtime
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={downtimes} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Edit Downtime Record" : "Record New Downtime Event"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Machine / Asset</label>
            <select className="input-field" required value={(typeof formData.machineId === 'object' ? formData.machineId?._id : formData.machineId) || ''} onChange={e => setFormData({...formData, machineId: e.target.value})} disabled={!!formData._id}>
              <option value="" disabled>Select Machine</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Downtime Type</label>
              <select className="input-field" required value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Unplanned">Unplanned (Breakdown/Jam)</option>
                <option value="Planned">Planned (Maintenance/Setup)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Duration (Minutes)</label>
              <input type="number" className="input-field" required min="1" value={formData.durationMinutes || ''} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Reason / Cause</label>
            <input type="text" className="input-field" required value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Impact Analysis / Notes</label>
            <textarea className="input-field" rows="2" value={formData.impactAnalysis || ''} onChange={e => setFormData({...formData, impactAnalysis: e.target.value})}></textarea>
          </div>

          {formData.type === 'Unplanned' && !formData._id && (
            <div style={{ backgroundColor: '#ef444415', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '8px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Warning:</strong> Logging Unplanned Downtime will automatically increment the <em>Idle Time</em> for the associated active Work Order, negatively impacting its Machine Utilization percentage.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Event</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DowntimeManagement;

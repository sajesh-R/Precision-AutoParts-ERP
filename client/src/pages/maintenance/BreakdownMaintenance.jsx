import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Hammer, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const BreakdownMaintenance = () => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
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
      const res = await axios.get('/maintenance/breakdown');
      setBreakdowns(res.data.data);
    } catch (err) { console.error('Breakdown fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/maintenance/breakdown/${formData._id}`, formData);
      } else {
        await axios.post('/maintenance/breakdown', formData);
      }
      setIsModalOpen(false);
      setIsResolveModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving breakdown report');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Hammer size={12} /> Edit Repair
        </button>
        {row.repairStatus !== 'Resolved' && (
          <button onClick={() => { setFormData({...row, repairStatus: 'Resolved'}); setIsResolveModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle size={12} /> Resolve
          </button>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'Incident ID', accessor: 'breakdownNumber' },
    { header: 'Machine', render: (row) => <strong>{row.machineId?.name} ({row.machineId?.code})</strong> },
    { header: 'Reported Issue', render: (row) => <span style={{ fontSize: '12px' }}>{row.issueDescription}</span> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.repairStatus === 'Resolved' ? '#10b98115' : row.repairStatus === 'In-Repair' ? '#f59e0b15' : '#ef444415',
        color: row.repairStatus === 'Resolved' ? '#10b981' : row.repairStatus === 'In-Repair' ? '#f59e0b' : '#ef4444'
      }}>
        {row.repairStatus}
      </span>
    )},
    { header: 'Reported', render: (row) => new Date(row.reportedDate).toLocaleString() },
    { header: 'Resolution', render: (row) => row.resolutionDate ? new Date(row.resolutionDate).toLocaleString() : '-' },
    { header: 'Downtime (Hrs)', render: (row) => <strong style={{ color: row.downtimeDurationHours > 0 ? '#ef4444' : 'inherit' }}>{row.downtimeDurationHours || 0} h</strong> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Breakdown Maintenance</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Report sudden hardware failures, track repair progression, and calculate downtime costs</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }} style={{ backgroundColor: '#ef4444' }}>
          <AlertTriangle size={14} /> Report Breakdown
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={breakdowns} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      {/* Report/Update Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Repair Tracking" : "Report Machine Breakdown"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Affected Machine</label>
            <select className="input-field" required value={formData.machineId?._id || formData.machineId || ''} onChange={e => setFormData({...formData, machineId: e.target.value})} disabled={!!formData._id}>
              <option value="" disabled>Select Machine</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Issue Description</label>
            <textarea className="input-field" rows="2" required value={formData.issueDescription || ''} onChange={e => setFormData({...formData, issueDescription: e.target.value})} disabled={!!formData._id}></textarea>
          </div>

          {formData._id && (
            <>
              <div className="input-group">
                <label className="input-label">Repair Status</label>
                <select className="input-field" required value={formData.repairStatus || ''} onChange={e => setFormData({...formData, repairStatus: e.target.value})}>
                  <option value="Reported">Reported</option>
                  <option value="In-Repair">In-Repair</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Repair Notes / Log</label>
                <textarea className="input-field" rows="2" value={formData.repairNotes || ''} onChange={e => setFormData({...formData, repairNotes: e.target.value})}></textarea>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Details</button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Record Resolution">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Downtime Hours</label>
              <input type="number" className="input-field" placeholder="Auto-calculated if blank" value={formData.downtimeDurationHours || ''} onChange={e => setFormData({...formData, downtimeDurationHours: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Hourly Downtime Cost ($)</label>
              <input type="number" className="input-field" required min="0" value={formData.downtimeCostPerHour || 0} onChange={e => setFormData({...formData, downtimeCostPerHour: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Resolution Details (How was it fixed?)</label>
            <textarea className="input-field" rows="3" required value={formData.resolutionDetails || ''} onChange={e => setFormData({...formData, resolutionDetails: e.target.value})}></textarea>
          </div>

          <div style={{ backgroundColor: '#f59e0b15', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>
            <strong>Analytics Impact:</strong> Closing this breakdown feeds MTTR (Mean Time To Repair) and MTBF (Mean Time Between Failures) calculations.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>Close Incident</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default BreakdownMaintenance;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Settings2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MrpExecution = () => {
  const [mrpRuns, setMrpRuns] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [consolidations, setConsolidations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  useEffect(() => {
    fetchRuns();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await axios.get('/demand/consolidation');
      // Unique periods
      const periods = [...new Set(res.data.data.map(c => c.period))];
      setConsolidations(periods);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/mrp/run');
      setMrpRuns(res.data.data);
      if (res.data.data.length > 0) {
        fetchRequirements(res.data.data[0]._id);
      }
    } catch (err) { console.error('MRP Runs fetch error', err); }
    setLoading(false);
  };

  const fetchRequirements = async (runId) => {
    try {
      const res = await axios.get(`/mrp/requirements?runId=${runId}`);
      setRequirements(res.data.data);
    } catch (err) { console.error('Requirements fetch error', err); }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/mrp/run/execute', { period: selectedPeriod });
      setIsModalOpen(false);
      fetchRuns();
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing MRP Run');
    }
  };

  const runColumns = [
    { header: 'Run No', accessor: 'runNumber' },
    { header: 'Target Period', accessor: 'period' },
    { header: 'Run Date', render: (row) => new Date(row.runDate).toLocaleString() },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Completed' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.status === 'Completed' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const reqColumns = [
    { header: 'Type', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
        backgroundColor: row.requirementType === 'Production' ? '#3b82f615' : row.requirementType === 'Material' ? '#8b5cf615' : '#f59e0b15',
        color: row.requirementType === 'Production' ? '#3b82f6' : row.requirementType === 'Material' ? '#8b5cf6' : '#f59e0b'
      }}>
        {row.requirementType}
      </span>
    )},
    { header: 'Item Name', render: (row) => row.itemId?.name || '-' },
    { header: 'Item Code', render: (row) => row.itemId?.code || '-' },
    { header: 'Required Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{(row.requiredQuantity ?? 0).toFixed(2)}</strong> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>MRP Execution</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calculate Material, Component, and Production Requirements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Play size={14} /> Execute MRP Run
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Runs Table */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '13px', fontWeight: 600 }}>
            MRP Run History
          </div>
          <div style={{ padding: '8px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
            <DataTable 
              columns={runColumns} 
              data={mrpRuns} 
              isLoading={loading} 
              onEdit={() => {}} // Disable edit icon
              customActions={(row) => (
                <button onClick={() => fetchRequirements(row._id)} title="View Requirements" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', marginLeft: '8px' }}>
                  <Settings2 size={14} />
                </button>
              )}
            />
          </div>
        </div>

        {/* Requirements Table */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '13px', fontWeight: 600 }}>
            Exploded Requirements (Latest Selection)
          </div>
          <div style={{ padding: '8px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
            {requirements.length > 0 ? (
              <DataTable columns={reqColumns} data={requirements} isLoading={false} />
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Select an MRP Run to view its exploded requirements.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Execute MRP Run">
        <form onSubmit={handleExecute}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The MRP Engine will consume the <strong>Demand Consolidation</strong> for the selected period, explode the active <strong>Engineering BOMs</strong>, and calculate gross requirements.
          </p>
          <div className="input-group">
            <label className="input-label">Target Period</label>
            <select className="input-field" required value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
              <option value="" disabled>Select Consolidation Period</option>
              {consolidations.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {consolidations.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please generate a Demand Consolidation first.</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Start Calculation Engine</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MrpExecution;

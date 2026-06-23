import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, FileSearch, ShieldPlus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const NonConformanceManagement = () => {
  const [ncrs, setNcrs] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const insRes = await axios.get('/quality/inspection');
      // Only show failed inspections or ones on hold
      setInspections(insRes.data.data.filter(i => ['Fail', 'Hold'].includes(i.status)));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/quality/ncr');
      setNcrs(res.data.data);
    } catch (err) { console.error('NCR fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/quality/ncr/${formData._id}`, formData);
      } else {
        await axios.post('/quality/ncr', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving NCR');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileSearch size={12} /> Update CAPA
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'NCR Number', accessor: 'ncrNumber' },
    { header: 'Source Inspection', render: (row) => row.inspectionId ? `${row.inspectionId.inspectionNumber} (${row.inspectionId.type})` : '-' },
    { header: 'Defect Description', render: (row) => <span style={{ fontSize: '12px' }}>{row.defectDescription}</span> },
    { header: 'RCA Findings', render: (row) => <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.rootCauseFindings || 'Pending Analysis'}</span> },
    { header: 'Corrective Action (CA)', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.correctiveActionStatus === 'Completed' ? '#10b98115' : row.correctiveActionStatus === 'In-Progress' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.correctiveActionStatus === 'Completed' ? '#10b981' : row.correctiveActionStatus === 'In-Progress' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.correctiveActionStatus}
      </span>
    )},
    { header: 'Preventive Action (PA)', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.preventiveActionStatus === 'Completed' ? '#10b98115' : row.preventiveActionStatus === 'In-Progress' ? '#8b5cf615' : 'var(--bg-tertiary)',
        color: row.preventiveActionStatus === 'Completed' ? '#10b981' : row.preventiveActionStatus === 'In-Progress' ? '#8b5cf6' : 'var(--text-secondary)'
      }}>
        {row.preventiveActionStatus}
      </span>
    )},
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Non-Conformance Management (CAPA)</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Record Defects, perform Root Cause Analysis (RCA), and track Corrective & Preventive Actions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <AlertCircle size={14} /> Log Defect (NCR)
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={ncrs} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update NCR / CAPA" : "Log Non-Conformance Report"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Source Failed/Hold Inspection (Optional)</label>
            <select className="input-field" value={formData.inspectionId || (formData.inspectionId?._id) || ''} onChange={e => setFormData({...formData, inspectionId: e.target.value})} disabled={!!formData._id}>
              <option value="">No linked inspection</option>
              {inspections.map(i => <option key={i._id} value={i._id}>{i.inspectionNumber} - {i.type} ({i.referenceId})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Defect Description</label>
            <textarea className="input-field" rows="2" required value={formData.defectDescription || ''} onChange={e => setFormData({...formData, defectDescription: e.target.value})} disabled={!!formData._id}></textarea>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSearch size={14} color="var(--accent-primary)" /> Root Cause Analysis (RCA)
            </h4>
            <div className="input-group">
              <label className="input-label">RCA Findings</label>
              <textarea className="input-field" rows="2" value={formData.rootCauseFindings || ''} onChange={e => setFormData({...formData, rootCauseFindings: e.target.value})}></textarea>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldPlus size={14} color="#10b981" /> CAPA Workflow
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Corrective Action</label>
                <input type="text" className="input-field" value={formData.correctiveAction || ''} onChange={e => setFormData({...formData, correctiveAction: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">CA Status</label>
                <select className="input-field" value={formData.correctiveActionStatus || 'Pending'} onChange={e => setFormData({...formData, correctiveActionStatus: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div className="input-group">
                <label className="input-label">Preventive Action</label>
                <input type="text" className="input-field" value={formData.preventiveAction || ''} onChange={e => setFormData({...formData, preventiveAction: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">PA Status</label>
                <select className="input-field" value={formData.preventiveActionStatus || 'Pending'} onChange={e => setFormData({...formData, preventiveActionStatus: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save NCR</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NonConformanceManagement;

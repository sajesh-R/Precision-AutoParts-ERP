import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Cog, ShieldAlert } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const InProcessQuality = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'In-Process' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/quality/inspection?type=In-Process');
      setInspections(res.data.data);
    } catch (err) { console.error('Inspection fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/quality/inspection/${formData._id}`, formData);
      } else {
        await axios.post('/quality/inspection', formData);
      }
      setIsModalOpen(false);
      setFormData({ type: 'In-Process' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving inspection');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} /> Update Status
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'Insp ID', accessor: 'inspectionNumber' },
    { header: 'Work Order Ref', render: (row) => <strong>{row.referenceId}</strong> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Pass' ? '#10b98115' : row.status === 'Fail' ? '#ef444415' : row.status === 'Hold' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.status === 'Pass' ? '#10b981' : row.status === 'Fail' ? '#ef4444' : row.status === 'Hold' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Observations', render: (row) => <span style={{ fontSize: '12px', maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.inspectionResults || '-'}</span> },
    { header: 'Inspector', accessor: 'inspectorName' },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>In-Process Quality Control</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitor shop floor operations and record WIP quality observations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ type: 'In-Process' }); setIsModalOpen(true); }}>
          <Cog size={14} /> Log Process Check
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inspections} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Process Check" : "Record In-Process Inspection"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Work Order / Batch Reference</label>
            <input type="text" className="input-field" required value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} disabled={!!formData._id} placeholder="e.g. WO-12345" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Inspection Status</label>
              <select className="input-field" required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="Pass">Pass (Process Stable)</option>
                <option value="Hold">Hold (Process Deviation)</option>
                <option value="Fail">Fail (Scrap Risk)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Quality Observations / Measurements</label>
            <textarea className="input-field" rows="3" required value={formData.inspectionResults || ''} onChange={e => setFormData({...formData, inspectionResults: e.target.value})}></textarea>
          </div>

          {formData.status === 'Fail' && (
             <div style={{ backgroundColor: '#ef444415', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
               <ShieldAlert size={16} /> Failing an in-process check should trigger an NCR (Non-Conformance Report).
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Check</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InProcessQuality;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const FinalQuality = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Final' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/quality/inspection?type=Final');
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
      setFormData({ type: 'Final' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving inspection');
    }
  };

  const handleApproveRelease = async (id) => {
    try {
      await axios.post(`/quality/inspection/${id}/release`);
      fetchData();
      alert('Product Release Approved Successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving release');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PackageCheck size={12} /> Edit
        </button>
        {row.status === 'Pass' && row.productReleaseStatus === 'Pending' && (
          <button onClick={() => handleApproveRelease(row._id)} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle2 size={12} /> Approve Release
          </button>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'Insp ID', accessor: 'inspectionNumber' },
    { header: 'FG / Batch Ref', render: (row) => <strong>{row.referenceId}</strong> },
    { header: 'Inspection Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Pass' ? '#10b98115' : row.status === 'Fail' ? '#ef444415' : row.status === 'Hold' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.status === 'Pass' ? '#10b981' : row.status === 'Fail' ? '#ef4444' : row.status === 'Hold' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Release Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.productReleaseStatus === 'Approved' ? '#8b5cf615' : 'var(--bg-tertiary)',
        color: row.productReleaseStatus === 'Approved' ? '#8b5cf6' : 'var(--text-secondary)'
      }}>
        {row.productReleaseStatus === 'Approved' ? 'Released' : 'Pending Approval'}
      </span>
    )},
    { header: 'Inspector', accessor: 'inspectorName' },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Final Quality Inspection</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Perform Finished Goods inspections and manage formal Product Release Approvals</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ type: 'Final' }); setIsModalOpen(true); }}>
          <FileCheck size={14} /> New FG Inspection
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inspections} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Final Inspection" : "Record Finished Goods Inspection"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Finished Good / Batch Reference</label>
            <input type="text" className="input-field" required value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} disabled={!!formData._id} placeholder="e.g. FG-BATCH-001" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Inspection Status</label>
              <select className="input-field" required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="Pass">Pass (Ready for Release)</option>
                <option value="Hold">Hold (Requires Rework)</option>
                <option value="Fail">Fail (Scrap)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Final Quality Results / CoA Data</label>
            <textarea className="input-field" rows="3" required value={formData.inspectionResults || ''} onChange={e => setFormData({...formData, inspectionResults: e.target.value})}></textarea>
          </div>

          <div style={{ backgroundColor: '#8b5cf615', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#8b5cf6', marginTop: '8px' }}>
            <strong>Release Protocol:</strong> The product release workflow cannot be triggered until the Inspection Status is explicitly set to "Pass".
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Inspection</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinalQuality;

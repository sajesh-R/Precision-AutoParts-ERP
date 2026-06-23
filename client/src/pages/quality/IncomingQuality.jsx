import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Truck, Star } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const IncomingQuality = () => {
  const [inspections, setInspections] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Incoming' });

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const venRes = await axios.get('/master/vendor');
      setVendors(venRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/quality/inspection?type=Incoming');
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
      setFormData({ type: 'Incoming' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving inspection');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} /> Update Results
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'Insp ID', accessor: 'inspectionNumber' },
    { header: 'GRN Ref', render: (row) => <strong>{row.referenceId}</strong> },
    { header: 'Vendor', render: (row) => row.vendorId?.vendorName || '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Pass' ? '#10b98115' : row.status === 'Fail' ? '#ef444415' : row.status === 'Hold' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.status === 'Pass' ? '#10b981' : row.status === 'Fail' ? '#ef4444' : row.status === 'Hold' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Vendor Score', render: (row) => (
      row.vendorQualityScore !== undefined ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: row.vendorQualityScore === 100 ? '#10b981' : row.vendorQualityScore === 50 ? '#f59e0b' : '#ef4444' }}>
          <Star size={12} fill={row.vendorQualityScore > 0 ? "currentColor" : "none"} /> {row.vendorQualityScore}/100
        </span>
      ) : <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
    )},
    { header: 'Inspector', accessor: 'inspectorName' },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Incoming Quality Control</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Inspect raw materials and dynamically evaluate vendor quality</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ type: 'Incoming' }); setIsModalOpen(true); }}>
          <Truck size={14} /> New Inspection
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inspections} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Update Inspection" : "Record Incoming Inspection"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Goods Receipt Note (GRN) Reference</label>
            <input type="text" className="input-field" required value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} disabled={!!formData._id} placeholder="e.g. GRN-12345" />
          </div>

          <div className="input-group">
            <label className="input-label">Source Vendor</label>
            <select className="input-field" required value={formData.vendorId || (formData.vendorId?._id) || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})} disabled={!!formData._id}>
              <option value="" disabled>Select Vendor</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.vendorName}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Inspection Status</label>
              <select className="input-field" required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="Pass">Pass (Accept Material)</option>
                <option value="Hold">Hold (Requires Review)</option>
                <option value="Fail">Fail (Reject Material)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Inspection Results / Observations</label>
            <textarea className="input-field" rows="3" required value={formData.inspectionResults || ''} onChange={e => setFormData({...formData, inspectionResults: e.target.value})}></textarea>
          </div>

          <div style={{ backgroundColor: '#f59e0b15', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#f59e0b', marginTop: '8px' }}>
            <strong>Vendor Quality Evaluation:</strong> Status 'Pass' = 100 Score. 'Hold' = 50 Score. 'Fail' = 0 Score. This data feeds directly into Quality Analytics.
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

export default IncomingQuality;

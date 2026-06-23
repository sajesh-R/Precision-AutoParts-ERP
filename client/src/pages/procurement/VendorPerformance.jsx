import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, TrendingUp, TrendingDown, Star } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const VendorPerformance = () => {
  const [performances, setPerformances] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await axios.get('/master/vendor');
      setVendors(res.data.data.filter(v => v.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/procurement/performance');
      setPerformances(res.data.data);
    } catch (err) { console.error('Performance fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/procurement/performance', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving performance data');
    }
  };

  const renderScore = (score) => {
    let color = '#ef4444';
    if (score >= 90) color = '#10b981';
    else if (score >= 75) color = '#f59e0b';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', backgroundColor: color }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color }}>{score}</span>
      </div>
    );
  };

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Vendor Name', render: (row) => row.vendorId?.name || '-' },
    { header: 'Delivery Score', render: (row) => renderScore(row.deliveryScore) },
    { header: 'Quality Score', render: (row) => renderScore(row.qualityScore) },
    { header: 'Cost Score', render: (row) => renderScore(row.costScore) },
    { header: 'Overall Rating', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: 600 }}>
        <Star size={14} color="#f59e0b" fill="#f59e0b" /> {row.overallRating?.toFixed(1)} / 100
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Vendor Performance Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Track and analyze Delivery, Quality, Cost, and Lead Time KPIs</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Plus size={14} /> Record KPI Evaluation
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={performances} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Vendor Evaluation">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Vendor</label>
              <select className="input-field" required value={formData.vendorId || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
                <option value="" disabled>Select Vendor</option>
                {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Evaluation Period (e.g. Q3-2026)</label>
              <input type="text" className="input-field" required value={formData.period || ''} onChange={e => setFormData({...formData, period: e.target.value})} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Delivery Score (0-100)</label>
              <input type="number" className="input-field" required min="0" max="100" value={formData.deliveryScore || ''} onChange={e => setFormData({...formData, deliveryScore: parseInt(e.target.value)})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Quality Score (0-100)</label>
              <input type="number" className="input-field" required min="0" max="100" value={formData.qualityScore || ''} onChange={e => setFormData({...formData, qualityScore: parseInt(e.target.value)})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Cost Score (0-100)</label>
              <input type="number" className="input-field" required min="0" max="100" value={formData.costScore || ''} onChange={e => setFormData({...formData, costScore: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Lead Time Analysis & Remarks</label>
            <textarea className="input-field" rows="3" required placeholder="Provide details on lead time deviations or operational impacts..." value={formData.leadTimeAnalysis || ''} onChange={e => setFormData({...formData, leadTimeAnalysis: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Evaluation</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorPerformance;

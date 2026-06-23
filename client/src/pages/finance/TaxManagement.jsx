import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Percent, Calculator, FileText } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const TaxManagement = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration'); // configuration, report
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'CGST', isActive: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/finance/tax');
      setTaxes(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/finance/tax/${formData._id}`, formData);
      } else {
        await axios.post('/finance/tax', formData);
      }
      setIsModalOpen(false);
      setFormData({ type: 'CGST', isActive: true });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving tax configuration');
    }
  };

  const actionRenderer = (row) => {
    return (
      <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Percent size={12} /> Edit
      </button>
    );
  };

  const columns = [
    { header: 'Tax Code', accessor: 'taxCode' },
    { header: 'Description', accessor: 'description' },
    { header: 'Type', accessor: 'type' },
    { header: 'Rate (%)', render: (row) => `${row.ratePercentage}%` },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.isActive ? '#10b98115' : '#ef444415',
        color: row.isActive ? '#10b981' : '#ef4444'
      }}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Tax Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure GST rates, calculate taxes, and generate tax reports</p>
        </div>
        {activeTab === 'configuration' && (
          <button className="btn btn-primary" onClick={() => { setFormData({ type: 'CGST', isActive: true }); setIsModalOpen(true); }}>
            <Percent size={14} /> New Tax Config
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('configuration')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'configuration' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'configuration' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Percent size={16} /> GST Configuration
        </button>
        <button onClick={() => setActiveTab('report')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'report' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'report' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} /> Tax Reporting
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          {activeTab === 'configuration' ? (
            <DataTable columns={columns} data={taxes} isLoading={loading} customActions={actionRenderer} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Calculator size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>Tax Reporting Module</h3>
              <p style={{ fontSize: '13px', marginTop: '8px', maxWidth: '400px', margin: '8px auto' }}>Select a date range to automatically compile all Sales and Purchase transactions and calculate total GST Input and Output tax.</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }}>Generate Tax Report</button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Edit Tax Configuration" : "New Tax Configuration"}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Tax Code</label>
            <input type="text" className="input-field" required value={formData.taxCode || ''} onChange={e => setFormData({...formData, taxCode: e.target.value})} disabled={!!formData._id} placeholder="e.g. GST-18" />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input type="text" className="input-field" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Tax Type</label>
              <select className="input-field" required value={formData.type || 'CGST'} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
                <option value="VAT">VAT</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Rate (%)</label>
              <input type="number" step="0.1" className="input-field" required value={formData.ratePercentage || ''} onChange={e => setFormData({...formData, ratePercentage: Number(e.target.value)})} />
            </div>
          </div>
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
            <label className="input-label" style={{ marginBottom: 0 }}>Active</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Config</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default TaxManagement;

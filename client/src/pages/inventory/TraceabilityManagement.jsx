import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Fingerprint, Search } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const TraceabilityManagement = () => {
  const [traces, setTraces] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ trackingType: 'Batch' });

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const txRes = await axios.get('/inventory/transactions');
      setTransactions(txRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory/traceability');
      setTraces(res.data.data);
    } catch (err) { console.error('Trace fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory/traceability', formData);
      setIsModalOpen(false);
      setFormData({ trackingType: 'Batch' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving traceability record');
    }
  };

  const filteredData = traces.filter(t => 
    t.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.materialId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Tracking Number', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.trackingNumber}</strong> },
    { header: 'Type', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.trackingType === 'Serial Number' ? '#8b5cf615' : 'var(--bg-tertiary)',
        color: row.trackingType === 'Serial Number' ? '#8b5cf6' : 'var(--text-secondary)'
      }}>
        {row.trackingType}
      </span>
    )},
    { header: 'Reference', render: (row) => <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{row.referenceNumber}</span> },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Origin Transaction', render: (row) => row.originTransactionId?.transactionNumber || '-' },
    { header: 'Mfg Date', render: (row) => new Date(row.manufacturingDate).toLocaleDateString() },
    { header: 'Expiry Date', render: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '-' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Traceability Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deep track inventory lifecycles by Batch, Lot, or Serial Number</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ trackingType: 'Batch' }); setIsModalOpen(true); }}>
          <Plus size={14} /> Register Entity
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="input-group" style={{ marginBottom: 0, width: '300px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '32px' }} 
              placeholder="Search tracking #, reference, or material..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing {filteredData.length} records
          </div>
        </div>

        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={filteredData} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Traceability Entity">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Tracking Type</label>
              <select className="input-field" required value={formData.trackingType || ''} onChange={e => setFormData({...formData, trackingType: e.target.value})}>
                <option value="Batch">Batch</option>
                <option value="Lot">Lot</option>
                <option value="Serial Number">Serial Number</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Actual Reference Number</label>
              <input type="text" className="input-field" required placeholder="e.g. B-001, SN-998822" value={formData.referenceNumber || ''} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Material</label>
            <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
              <option value="" disabled>Select Material</option>
              {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Link to Origin Transaction (Optional)</label>
            <select className="input-field" value={formData.originTransactionId || ''} onChange={e => setFormData({...formData, originTransactionId: e.target.value})}>
              <option value="">-- No linked transaction --</option>
              {transactions.map(t => <option key={t._id} value={t._id}>{t.transactionNumber} - {t.transactionType} ({t.materialId?.name})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Manufacturing Date</label>
              <input type="date" className="input-field" required value={formData.manufacturingDate || ''} onChange={e => setFormData({...formData, manufacturingDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Expiry Date (Optional)</label>
              <input type="date" className="input-field" value={formData.expiryDate || ''} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register Entity</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TraceabilityManagement;

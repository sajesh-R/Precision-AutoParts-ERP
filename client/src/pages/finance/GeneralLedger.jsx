import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Share, Activity } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const GeneralLedger = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('journal'); // journal, transactions
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Debit' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/finance/ledger');
      setEntries(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/finance/ledger', formData);
      setIsModalOpen(false);
      setFormData({ type: 'Debit' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating entry');
    }
  };

  const handlePost = async (id) => {
    try {
      await axios.put(`/finance/ledger/${id}/post`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting entry');
    }
  };

  const actionRenderer = (row) => {
    if (activeTab === 'journal' && row.status === 'Draft') {
      return (
        <button onClick={() => handlePost(row._id)} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Share size={12} /> Post to Ledger
        </button>
      );
    }
    return null;
  };

  const columns = [
    { header: 'Entry #', accessor: 'entryNumber' },
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Description', accessor: 'description' },
    { header: 'Account', render: (row) => <strong>{row.accountName}</strong> },
    { header: 'Type', render: (row) => (
      <span style={{ color: row.type === 'Credit' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{row.type}</span>
    )},
    { header: 'Amount', render: (row) => `$${row.amount.toFixed(2)}` },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Posted' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.status === 'Posted' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const getActiveData = () => {
    if (activeTab === 'transactions') return entries.filter(e => e.status === 'Posted');
    return entries;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>General Ledger</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage journal entries and view posted financial transactions</p>
        </div>
        {activeTab === 'journal' && (
          <button className="btn btn-primary" onClick={() => { setFormData({ type: 'Debit' }); setIsModalOpen(true); }}>
            <BookOpen size={14} /> Create Journal Entry
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('journal')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'journal' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'journal' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} /> Journal Entries
        </button>
        <button onClick={() => setActiveTab('transactions')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'transactions' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'transactions' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} /> Financial Transactions
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={getActiveData()} isLoading={loading} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Journal Entry">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Account Name</label>
            <input type="text" className="input-field" required value={formData.accountName || ''} onChange={e => setFormData({...formData, accountName: e.target.value})} placeholder="e.g. Sales Revenue, Office Supplies" />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input type="text" className="input-field" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Transaction Type</label>
              <select className="input-field" required value={formData.type || 'Debit'} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Amount ($)</label>
              <input type="number" step="0.01" className="input-field" required value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save as Draft</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default GeneralLedger;

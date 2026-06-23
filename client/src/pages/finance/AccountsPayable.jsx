import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, FileText, TrendingDown } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const AccountsPayable = () => {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bills'); // bills, payments, outstanding
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const vendRes = await axios.get('/master/vendor');
      setVendors(vendRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/finance/ap');
      setBills(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/finance/ap', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating vendor bill');
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/finance/ap/${formData._id}/payment`, {
        amount: Number(formData.paymentAmount),
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber
      });
      setIsPaymentModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    }
  };

  const actionRenderer = (row) => {
    if (activeTab === 'payments' && row.status !== 'Paid') {
      return (
        <button onClick={() => { setFormData({...row, paymentAmount: row.outstandingAmount}); setIsPaymentModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CreditCard size={12} /> Make Payment
        </button>
      );
    }
    return null;
  };

  const billColumns = [
    { header: 'Bill #', accessor: 'billNumber' },
    { header: 'Vendor', render: (row) => row.vendorId?.name || '-' },
    { header: 'Date', render: (row) => new Date(row.billDate).toLocaleDateString() },
    { header: 'Due Date', render: (row) => <span style={{ color: new Date(row.dueDate) < new Date() && row.status !== 'Paid' ? '#ef4444' : 'inherit' }}>{new Date(row.dueDate).toLocaleDateString()}</span> },
    { header: 'Total Amount', render: (row) => `$${row.totalAmount.toFixed(2)}` },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Paid' ? '#10b98115' : row.status === 'Partial' ? '#f59e0b15' : '#ef444415',
        color: row.status === 'Paid' ? '#10b981' : row.status === 'Partial' ? '#f59e0b' : '#ef4444'
      }}>
        {row.status}
      </span>
    )}
  ];

  const paymentColumns = [
    ...billColumns.slice(0, 2),
    { header: 'Total Billed', render: (row) => `$${row.totalAmount.toFixed(2)}` },
    { header: 'Amount Paid', render: (row) => `$${row.amountPaid.toFixed(2)}` },
    { header: 'Outstanding', render: (row) => `$${row.outstandingAmount.toFixed(2)}` },
    billColumns[5] // Status
  ];

  const outstandingColumns = [
    { header: 'Bill #', accessor: 'billNumber' },
    { header: 'Vendor', render: (row) => row.vendorId?.name || '-' },
    { header: 'Days Overdue', render: (row) => {
      const days = Math.floor((new Date() - new Date(row.dueDate)) / (1000 * 60 * 60 * 24));
      return days > 0 ? <strong style={{ color: '#ef4444' }}>{days} Days</strong> : 'Not Overdue';
    }},
    { header: 'Outstanding Amount', render: (row) => <strong style={{ color: '#ef4444' }}>${row.outstandingAmount.toFixed(2)}</strong> }
  ];

  const getActiveColumns = () => {
    if (activeTab === 'payments') return paymentColumns;
    if (activeTab === 'outstanding') return outstandingColumns;
    return billColumns;
  };

  const getActiveData = () => {
    if (activeTab === 'outstanding') return bills.filter(i => i.status !== 'Paid');
    return bills;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Accounts Payable</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage vendor bills, schedule outgoing payments, and monitor outstanding payables</p>
        </div>
        {activeTab === 'bills' && (
          <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
            <FileText size={14} /> Record Vendor Bill
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('bills')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'bills' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'bills' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} /> Vendor Bills
        </button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'payments' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'payments' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} /> Vendor Payments
        </button>
        <button onClick={() => setActiveTab('outstanding')} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'outstanding' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'outstanding' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={16} /> Outstanding Monitoring
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={getActiveColumns()} data={getActiveData()} isLoading={loading} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Vendor Bill">
        <form onSubmit={handleSaveBill}>
          <div className="input-group">
            <label className="input-label">Vendor</label>
            <select className="input-field" required value={formData.vendorId || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
              <option value="" disabled>Select Vendor</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Due Date</label>
              <input type="date" className="input-field" required value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Base Amount ($)</label>
              <input type="number" step="0.01" className="input-field" required value={formData.amount || ''} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Tax Amount ($)</label>
            <input type="number" step="0.01" className="input-field" required value={formData.taxAmount === undefined ? '' : formData.taxAmount} onChange={e => setFormData({...formData, taxAmount: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Generate Bill</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Vendor Payment">
        <form onSubmit={handleSavePayment}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            <strong>Bill #:</strong> {formData.billNumber} <br />
            <strong>Outstanding:</strong> ${formData.outstandingAmount?.toFixed(2)}
          </div>
          <div className="input-group">
            <label className="input-label">Payment Amount ($)</label>
            <input type="number" step="0.01" max={formData.outstandingAmount} className="input-field" required value={formData.paymentAmount || ''} onChange={e => setFormData({...formData, paymentAmount: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Payment Mode</label>
            <select className="input-field" required value={formData.paymentMode || ''} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
              <option value="" disabled>Select Mode</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Reference / Trx ID</label>
            <input type="text" className="input-field" required value={formData.referenceNumber || ''} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPayable;

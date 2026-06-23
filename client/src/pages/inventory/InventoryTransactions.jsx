import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftRight, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ transactionType: 'Material Issue' });

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const whRes = await axios.get('/company/warehouses');
      setWarehouses(whRes.data.data.filter(w => w.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory/transactions');
      setTransactions(res.data.data);
    } catch (err) { console.error('Transactions fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.sourceWarehouseId) delete payload.sourceWarehouseId;
      if (!payload.destinationWarehouseId) delete payload.destinationWarehouseId;

      await axios.post('/inventory/transactions', payload);
      setIsModalOpen(false);
      setFormData({ transactionType: 'Material Issue' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing transaction');
    }
  };

  const renderTransactionType = (type) => {
    let color = 'var(--text-secondary)';
    let bg = 'var(--bg-tertiary)';
    if (type === 'Goods Receipt' || type === 'Stock Return') { color = '#10b981'; bg = '#10b98115'; }
    if (type === 'Material Issue') { color = '#ef4444'; bg = '#ef444415'; }
    if (type === 'Stock Transfer') { color = '#3b82f6'; bg = '#3b82f615'; }
    if (type === 'Stock Adjustment') { color = '#f59e0b'; bg = '#f59e0b15'; }

    return (
      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: bg, color }}>
        {type}
      </span>
    );
  };

  const columns = [
    { header: 'Txn Date', render: (row) => new Date(row.transactionDate).toLocaleString() },
    { header: 'Txn Number', accessor: 'transactionNumber' },
    { header: 'Type', render: (row) => renderTransactionType(row.transactionType) },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.quantity}</strong> },
    { header: 'Source WH', render: (row) => row.sourceWarehouseId?.name || '-' },
    { header: 'Dest WH', render: (row) => row.destinationWarehouseId?.name || '-' },
    { header: 'Ref Doc', accessor: 'referenceDocument' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Inventory Transactions</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Log Material Issues, Transfers, Returns, and Adjustments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ transactionType: 'Material Issue' }); setIsModalOpen(true); }}>
          <ArrowLeftRight size={14} /> Execute Transaction
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={transactions} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Execute Inventory Transaction">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Transaction Type</label>
            <select className="input-field" required value={formData.transactionType || ''} onChange={e => setFormData({...formData, transactionType: e.target.value, sourceWarehouseId: '', destinationWarehouseId: ''})}>
              <option value="Goods Receipt">Goods Receipt (Manual)</option>
              <option value="Material Issue">Material Issue</option>
              <option value="Stock Transfer">Stock Transfer</option>
              <option value="Stock Adjustment">Stock Adjustment</option>
              <option value="Stock Return">Stock Return</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Material</label>
              <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
                <option value="" disabled>Select Material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" className="input-field" required value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} placeholder={formData.transactionType === 'Stock Adjustment' ? 'e.g. -5 or 10' : 'Positive integer'} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['Material Issue', 'Stock Transfer', 'Stock Adjustment'].includes(formData.transactionType) && (
              <div className="input-group">
                <label className="input-label">Source Warehouse</label>
                <select className="input-field" required value={formData.sourceWarehouseId || ''} onChange={e => setFormData({...formData, sourceWarehouseId: e.target.value})}>
                  <option value="" disabled>Select Source</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            )}
            
            {['Goods Receipt', 'Stock Return', 'Stock Transfer'].includes(formData.transactionType) && (
              <div className="input-group">
                <label className="input-label">Destination Warehouse</label>
                <select className="input-field" required value={formData.destinationWarehouseId || ''} onChange={e => setFormData({...formData, destinationWarehouseId: e.target.value})}>
                  <option value="" disabled>Select Destination</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Reference Document</label>
              <input type="text" className="input-field" placeholder="e.g. PO-1234, PRD-999" value={formData.referenceDocument || ''} onChange={e => setFormData({...formData, referenceDocument: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle size={16} color="var(--accent-primary)" />
            This transaction will immutably update the active inventory balances.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Execute Transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryTransactions;

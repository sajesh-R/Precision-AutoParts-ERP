import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Plus, Minus } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SparePartsManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ transactionType: 'Receipt' });

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, [activeTab]);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      // In reality, this would be filtered by a material group like "Spare Parts"
      setMaterials(matRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'inventory') {
        const res = await axios.get('/maintenance/sparepart/inventory');
        setInventory(res.data.data);
      } else {
        const res = await axios.get('/maintenance/sparepart');
        setTransactions(res.data.data);
      }
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/maintenance/sparepart', formData);
      setIsModalOpen(false);
      setFormData({ transactionType: 'Receipt' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording transaction');
    }
  };

  const invColumns = [
    { header: 'Spare Part', render: (row) => <strong>{row.material?.name} ({row.material?.code})</strong> },
    { header: 'Unit Cost', render: (row) => `$${row.material?.standardCost?.toFixed(2) || '0.00'}` },
    { header: 'Stock On Hand', render: (row) => <span style={{ fontWeight: 600, color: row.quantityOnHand < 5 ? '#ef4444' : 'var(--text-primary)' }}>{row.quantityOnHand} units</span> },
    { header: 'Total Value', render: (row) => <strong style={{ color: '#3b82f6' }}>${row.totalValue?.toFixed(2)}</strong> }
  ];

  const txColumns = [
    { header: 'TXN ID', accessor: 'transactionId' },
    { header: 'Spare Part', render: (row) => <strong>{row.materialId?.name}</strong> },
    { header: 'Type', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content',
        backgroundColor: row.transactionType === 'Receipt' ? '#10b98115' : '#ef444415',
        color: row.transactionType === 'Receipt' ? '#10b981' : '#ef4444'
      }}>
        {row.transactionType === 'Receipt' ? <Plus size={10} /> : <Minus size={10} />}
        {row.transactionType}
      </span>
    )},
    { header: 'Qty', render: (row) => <strong style={{ color: row.transactionType === 'Receipt' ? '#10b981' : '#ef4444' }}>{row.transactionType === 'Receipt' ? '+' : '-'}{row.quantity}</strong> },
    { header: 'Financial Cost', render: (row) => <span>${row.totalCost?.toFixed(2)}</span> },
    { header: 'Maint. Reference', render: (row) => <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.referenceType}: {row.referenceId || 'N/A'}</span> },
    { header: 'Date', render: (row) => new Date(row.dateRecorded).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Spare Parts Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Track replacement parts inventory and financial consumption linked to maintenance tickets</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ transactionType: 'Receipt' }); setIsModalOpen(true); }}>
          <Settings size={14} /> Record Part Activity
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: '16px' }}>
        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Current Stock</button>
        <button className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Consumption & Receipts</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          {activeTab === 'inventory' ? (
             <DataTable columns={invColumns} data={inventory} isLoading={loading} onEdit={() => {}} />
          ) : (
             <DataTable columns={txColumns} data={transactions} isLoading={loading} onEdit={() => {}} />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Spare Part Transaction">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Transaction Type</label>
            <select className="input-field" required value={formData.transactionType || ''} onChange={e => setFormData({...formData, transactionType: e.target.value})}>
              <option value="Receipt">Receipt (Stock In)</option>
              <option value="Consumption">Consumption (Stock Out to Machine)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Spare Part (Material)</label>
              <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
                <option value="" disabled>Select Part</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.name} (${m.standardCost})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
          </div>

          {formData.transactionType === 'Consumption' && (
             <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0', paddingTop: '16px' }}>
               <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Maintenance Routing Link</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Link Type</label>
                    <select className="input-field" required value={formData.referenceType || ''} onChange={e => setFormData({...formData, referenceType: e.target.value})}>
                      <option value="" disabled>Select Maintenance Type</option>
                      <option value="Preventive">Preventive Schedule</option>
                      <option value="Breakdown">Breakdown Repair</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Maintenance ID</label>
                    <input type="text" className="input-field" required value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} placeholder="e.g. BD-12345" />
                  </div>
               </div>
               <div style={{ backgroundColor: '#3b82f615', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#3b82f6', marginTop: '8px' }}>
                 Routing spare parts to specific maintenance events enables exact <strong>Maintenance Cost Analysis</strong>. Total cost is auto-calculated based on Master Material value.
               </div>
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Process Transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SparePartsManagement;

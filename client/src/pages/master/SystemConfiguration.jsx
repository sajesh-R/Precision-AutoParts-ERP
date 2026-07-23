import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, DollarSign, Percent, FileText, Scale } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SystemConfiguration = () => {
  const [activeTab, setActiveTab] = useState('currency');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uoms, setUoms] = useState([]); // For UOM conversions
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    if (activeTab === 'uomconversion') fetchUoms();
  }, [activeTab]);

  const fetchUoms = async () => {
    try {
      const res = await axios.get('/master/uom');
      setUoms(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/master/${activeTab}`);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/master/${activeTab}/${editingId}`, formData);
      } else {
        await axios.post(`/master/${activeTab}`, formData);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      ...row,
      fromUOM: row.fromUOM?._id || row.fromUOM,
      toUOM: row.toUOM?._id || row.toUOM
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    const currentActive = row.status === 'Active';
    if (currentActive && !window.confirm('Are you sure you want to deactivate this record?')) return;
    try {
      await axios.put(`/master/${activeTab}/${row._id}`, { status: currentActive ? 'Inactive' : 'Active' });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const tabs = [
    { id: 'currency', label: 'Currencies', icon: <DollarSign size={18} /> },
    { id: 'tax', label: 'Taxes', icon: <Percent size={18} /> },
    { id: 'paymentterms', label: 'Payment Terms', icon: <FileText size={18} /> },
    { id: 'documentseries', label: 'Document Series', icon: <FileText size={18} /> },
    { id: 'uomconversion', label: 'UOM Conversions', icon: <Scale size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [];

    if (activeTab === 'uomconversion') {
      baseCols.push({ header: 'From UOM', render: (row) => row.fromUOM?.name || '-' });
      baseCols.push({ header: 'To UOM', render: (row) => row.toUOM?.name || '-' });
      baseCols.push({ header: 'Factor', accessor: 'factor' });
    } else if (activeTab === 'documentseries') {
      baseCols.push({ header: 'Document Type', accessor: 'documentType' });
      baseCols.push({ header: 'Prefix', accessor: 'prefix' });
      baseCols.push({ header: 'Current Number', accessor: 'currentNumber' });
    } else {
      baseCols.push({ header: 'Name', accessor: 'name' });
      baseCols.push({ header: 'Code', accessor: 'code' });
      if (activeTab === 'currency') baseCols.push({ header: 'Symbol', accessor: 'symbol' });
      if (activeTab === 'tax') baseCols.push({ header: 'Rate (%)', accessor: 'rate' });
      if (activeTab === 'paymentterms') baseCols.push({ header: 'Days', accessor: 'days' });
    }

    baseCols.push({ header: 'Status', render: (row) => (
      <span style={{ 
        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
        backgroundColor: row.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: row.status === 'Active' ? 'var(--accent-success)' : 'var(--accent-danger)' 
      }}>
        {row.status === 'Active' ? 'Active' : 'Inactive'}
      </span>
    )});

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>System Configuration</h1>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormData({});
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus size={14} /> Add New
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', backgroundColor: 'var(--bg-tertiary)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                backgroundColor: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={getColumns()} 
            data={data} 
            isLoading={loading} 
            onEdit={handleEdit}
            customActions={(row) => (
              <button 
                onClick={() => toggleStatus(row)} 
                title={row.status === 'Active' ? "Deactivate" : "Activate"} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: row.status === 'Active' ? 'var(--accent-danger)' : 'var(--accent-success)' }}
              >
                {row.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
              </button>
            )}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Record`}>
        <form onSubmit={handleSave}>
          
          {activeTab !== 'uomconversion' && activeTab !== 'documentseries' && (
            <>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Code</label>
                <input type="text" className="input-field" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
            </>
          )}

          {activeTab === 'currency' && (
            <div className="input-group">
              <label className="input-label">Symbol</label>
              <input type="text" className="input-field" required value={formData.symbol || ''} onChange={e => setFormData({...formData, symbol: e.target.value})} />
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="input-group">
              <label className="input-label">Rate (%)</label>
              <input type="number" step="0.01" className="input-field" required value={formData.rate || ''} onChange={e => setFormData({...formData, rate: e.target.value})} />
            </div>
          )}

          {activeTab === 'paymentterms' && (
            <div className="input-group">
              <label className="input-label">Days</label>
              <input type="number" className="input-field" required value={formData.days || ''} onChange={e => setFormData({...formData, days: e.target.value})} />
            </div>
          )}

          {activeTab === 'documentseries' && (
            <>
              <div className="input-group">
                <label className="input-label">Document Type (e.g., PurchaseOrder, SalesOrder)</label>
                <input type="text" className="input-field" required value={formData.documentType || ''} onChange={e => setFormData({...formData, documentType: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Prefix (e.g., PO-)</label>
                <input type="text" className="input-field" required value={formData.prefix || ''} onChange={e => setFormData({...formData, prefix: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Padding Length (e.g., 6 for 000001)</label>
                <input type="number" className="input-field" required value={formData.paddingLength || 6} onChange={e => setFormData({...formData, paddingLength: e.target.value})} />
              </div>
            </>
          )}

          {activeTab === 'uomconversion' && (
            <>
              <div className="input-group">
                <label className="input-label">From UOM</label>
                <select className="input-field" required value={formData.fromUOM || ''} onChange={e => setFormData({...formData, fromUOM: e.target.value})}>
                  <option value="" disabled>Select UOM</option>
                  {uoms.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">To UOM</label>
                <select className="input-field" required value={formData.toUOM || ''} onChange={e => setFormData({...formData, toUOM: e.target.value})}>
                  <option value="" disabled>Select UOM</option>
                  {uoms.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Conversion Factor (1 From UOM = ? To UOM)</label>
                <input type="number" step="any" className="input-field" required value={formData.factor || ''} onChange={e => setFormData({...formData, factor: e.target.value})} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SystemConfiguration;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Tags, FileText, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CustomerMaster = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    if (activeTab === 'customers') fetchCategories();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/master/customercategory');
      setCategories(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'customers' ? '/master/customer' : '/master/customercategory';
      const res = await axios.get(endpoint);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'customers' ? '/master/customer' : '/master/customercategory';
      
      // Clean up empty arrays/objects if needed
      if (activeTab === 'customers') {
        if (!formData.billingAddresses) formData.billingAddresses = [];
        if (!formData.shippingAddresses) formData.shippingAddresses = [];
        if (!formData.taxInformation) formData.taxInformation = {};
      }

      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, formData);
      } else {
        await axios.post(endpoint, formData);
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
    setFormData({ ...row, category: row.category?._id || row.category });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    try {
      const endpoint = activeTab === 'customers' ? '/master/customer' : '/master/customercategory';
      await axios.put(`${endpoint}/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const tabs = [
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'categories', label: 'Customer Categories', icon: <Tags size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' }
    ];

    if (activeTab === 'customers') {
      baseCols.push({ header: 'Code', accessor: 'code' });
      baseCols.push({ header: 'Category', render: (row) => row.category?.name || '-' });
      baseCols.push({ header: 'Credit Limit', render: (row) => `$${row.creditLimit || 0}` });
      baseCols.push({ header: 'Payment Terms', accessor: 'paymentTerms' });
    } else {
      baseCols.push({ header: 'Description', accessor: 'description' });
    }

    baseCols.push({ header: 'Status', render: (row) => (
      <span style={{ color: row.isActive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )});

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Customer Master</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ code: 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
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
                fontSize: '13px', cursor: 'pointer'
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
                title={row.isActive ? "Deactivate" : "Activate"} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isActive ? 'var(--accent-danger)' : 'var(--accent-success)' }}
              >
                {row.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
              </button>
            )}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} ${activeTab.slice(0, -1)}`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          {activeTab === 'customers' && (
            <>
              <div className="input-group">
                <label className="input-label">Code</label>
                <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
                    * Please create a Customer Category first.
                  </p>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">Credit Limit</label>
                <input type="number" className="input-field" value={formData.creditLimit || ''} onChange={e => setFormData({...formData, creditLimit: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Payment Terms</label>
                <input type="text" className="input-field" placeholder="e.g. Net 30" value={formData.paymentTerms || ''} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
              </div>
              {/* For brevity, simplified Tax Info for initial form */}
              <div className="input-group">
                <label className="input-label">Tax ID (Optional)</label>
                <input type="text" className="input-field" value={formData.taxInformation?.taxId || ''} onChange={e => setFormData({...formData, taxInformation: { ...formData.taxInformation, taxId: e.target.value }})} />
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
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

export default CustomerMaster;

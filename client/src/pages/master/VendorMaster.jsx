import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Truck, Tags, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const VendorMaster = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    if (activeTab === 'vendors') fetchCategories();
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/master/vendorcategory');
      setCategories(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'vendors' ? '/master/vendor' : '/master/vendorcategory';
      const res = await axios.get(endpoint);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'vendors' ? '/master/vendor' : '/master/vendorcategory';

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
      const endpoint = activeTab === 'vendors' ? '/master/vendor' : '/master/vendorcategory';
      await axios.put(`${endpoint}/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const tabs = [
    { id: 'vendors', label: 'Vendors', icon: <Truck size={18} /> },
    { id: 'categories', label: 'Vendor Categories', icon: <Tags size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' }
    ];

    if (activeTab === 'vendors') {
      baseCols.push({ header: 'Code', accessor: 'code' });
      baseCols.push({ header: 'Category', render: (row) => row.category?.name || '-' });
      baseCols.push({ header: 'Rating', accessor: 'rating' });
      baseCols.push({ header: 'Lead Time (Days)', accessor: 'leadTimeDays' });
      baseCols.push({ header: 'Delivery Perf', render: (row) => `${row.performanceTracking?.deliveryScore || 0}%` });
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
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Vendor Master</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setEditingId(null); setIsModalOpen(true); }}>
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
          
          {activeTab === 'vendors' && (
            <>
              <div className="input-group">
                <label className="input-label">Code</label>
                <input type="text" className="input-field" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
                    * Please create a Vendor Category first.
                  </p>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">Rating</label>
                <select className="input-field" value={formData.rating || 'Unrated'} onChange={e => setFormData({...formData, rating: e.target.value})}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="Unrated">Unrated</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Lead Time (Days)</label>
                <input type="number" className="input-field" value={formData.leadTimeDays || ''} onChange={e => setFormData({...formData, leadTimeDays: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Payment Terms</label>
                <input type="text" className="input-field" placeholder="e.g. Net 30" value={formData.paymentTerms || ''} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
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

export default VendorMaster;

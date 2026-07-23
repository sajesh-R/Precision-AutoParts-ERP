import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Tags, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ProductMaster = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    if (activeTab === 'products') {
      fetchCategories();
      fetchUoms();
      fetchWarehouses();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/master/productcategory');
      setCategories(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchUoms = async () => {
    try {
      const res = await axios.get('/master/uom');
      setUoms(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/master/warehouse');
      setWarehouses(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'products' ? '/master/product' : '/master/productcategory';
      const res = await axios.get(endpoint);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'products' ? '/master/product' : '/master/productcategory';

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
    setFormData({ 
      ...row, 
      categoryId: row.categoryId?._id || row.categoryId,
      uomId: row.uomId?._id || row.uomId,
      defaultWarehouseId: row.defaultWarehouseId?._id || row.defaultWarehouseId
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    if (row.isActive && !window.confirm('Are you sure you want to deactivate this record?')) return;
    if (activeTab === 'categories') {
      try {
        await axios.put(`/master/productcategory/${row._id}`, { isActive: !row.isActive });
        fetchData();
      } catch (err) { alert('Error updating status'); }
    } else {
      // For products, cycle through lifecycle status (simplified toggle for demo)
      const statuses = ['Draft', 'Active', 'Inactive', 'Obsolete'];
      const nextIndex = (statuses.indexOf(row.lifecycleStatus) + 1) % statuses.length;
      try {
        await axios.put(`/master/product/${row._id}`, { lifecycleStatus: statuses[nextIndex] });
        fetchData();
      } catch (err) { alert('Error updating status'); }
    }
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'categories', label: 'Product Categories', icon: <Tags size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' }
    ];

    if (activeTab === 'products') {
      baseCols.push({ header: 'Code', accessor: 'code' });
      baseCols.push({ header: 'Category', render: (row) => row.categoryId?.name || '-' });
      baseCols.push({ header: 'Revision', accessor: 'currentRevision' });
      baseCols.push({ header: 'Lifecycle Status', render: (row) => (
        <span style={{ 
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
          backgroundColor: row.lifecycleStatus === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
          color: row.lifecycleStatus === 'Active' ? 'var(--accent-success)' : 'var(--text-secondary)'
        }}>
          {row.lifecycleStatus}
        </span>
      )});
    } else {
      baseCols.push({ header: 'Description', accessor: 'description' });
      baseCols.push({ header: 'Status', render: (row) => (
        <span style={{ color: row.isActive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )});
    }

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Product Master</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ code: 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
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
                title="Toggle Status" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <CheckCircle size={14} />
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
          
          {activeTab === 'products' && (
            <>
              <div className="input-group">
                <label className="input-label">Code</label>
                <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" required value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {categories.length === 0 && (
                  <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
                    * Please create a Product Category first.
                  </p>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">UOM (Unit of Measure)</label>
                <select className="input-field" required value={formData.uomId || ''} onChange={e => setFormData({...formData, uomId: e.target.value})}>
                  <option value="" disabled>Select UOM</option>
                  {uoms.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Lifecycle Status</label>
                <select className="input-field" value={formData.lifecycleStatus || 'Draft'} onChange={e => setFormData({...formData, lifecycleStatus: e.target.value})}>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Obsolete">Obsolete</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Revision</label>
                <input type="text" className="input-field" value={formData.currentRevision || '1.0'} onChange={e => setFormData({...formData, currentRevision: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">HSN Code</label>
                <input type="text" className="input-field" value={formData.hsnCode || ''} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Weight</label>
                <input type="number" step="any" className="input-field" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="input-group">
                <label className="input-label">Standard Cost</label>
                <input type="number" step="any" className="input-field" value={formData.standardCost || ''} onChange={e => setFormData({...formData, standardCost: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="input-group">
                <label className="input-label">Selling Price</label>
                <input type="number" step="any" className="input-field" value={formData.sellingPrice || ''} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="input-group">
                <label className="input-label">Default Warehouse</label>
                <select className="input-field" value={formData.defaultWarehouseId || ''} onChange={e => setFormData({...formData, defaultWarehouseId: e.target.value})}>
                  <option value="">Select Warehouse (Optional)</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
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

export default ProductMaster;

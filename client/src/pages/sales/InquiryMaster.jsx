import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const InquiryMaster = () => {
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ products: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const custRes = await axios.get('/master/customer');
      setCustomers(custRes.data.data.filter(c => c.isActive));
      
      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/sales/inquiry');
      setInquiries(res.data.data);
    } catch (err) { console.error('Inquiry fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/sales/inquiry/${editingId}`, formData);
      } else {
        await axios.post('/sales/inquiry', formData);
      }
      setIsModalOpen(false);
      setFormData({ products: [] });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      inquiryNumber: row.inquiryNumber,
      customerId: row.customerId?._id || row.customerId,
      requirements: row.requirements,
      products: row.products || [],
      status: row.status
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...(formData.products || []), { productId: '', quantity: 1, notes: '' }]
    });
  };

  const updateProduct = (index, field, value) => {
    const newProds = [...formData.products];
    newProds[index][field] = value;
    setFormData({ ...formData, products: newProds });
  };

  const removeProduct = (index) => {
    const newProds = [...formData.products];
    newProds.splice(index, 1);
    setFormData({ ...formData, products: newProds });
  };

  const columns = [
    { header: 'Inquiry No', accessor: 'inquiryNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || '-' },
    { header: 'Products Req.', render: (row) => row.products?.length || 0 },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Active' ? '#10b98115' : row.status === 'Converted' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.status === 'Active' ? '#10b981' : row.status === 'Converted' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Customer Inquiry Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Capture requirements and quantity planning</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ products: [], inquiryNumber: 'INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Inquiry
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inquiries} isLoading={loading} onEdit={handleEdit} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Inquiry`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Inquiry Number</label>
              <input type="text" className="input-field" required readOnly value={formData.inquiryNumber || ''} onChange={e => setFormData({...formData, inquiryNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Customer</label>
              <select className="input-field" required value={formData.customerId || ''} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                <option value="" disabled>Select Customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {customers.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please create a Customer first.</p>}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Customer Requirements</label>
            <textarea className="input-field" rows="3" required value={formData.requirements || ''} onChange={e => setFormData({...formData, requirements: e.target.value})}></textarea>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Product Selection & Quantity Planning</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addProduct}>
                + Add Product
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.products?.map((prod, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="input-group" style={{ margin: 0, flex: 2 }}>
                        <select className="input-field" required value={prod.productId || ''} onChange={e => updateProduct(idx, 'productId', e.target.value)}>
                          <option value="" disabled>Select Product</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        {products.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Please create a Product first.</p>}
                      </div>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <input type="number" placeholder="Qty" className="input-field" required min="1" value={prod.quantity || ''} onChange={e => updateProduct(idx, 'quantity', e.target.value)} />
                      </div>
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <input type="text" placeholder="Notes (Optional)" className="input-field" value={prod.notes || ''} onChange={e => updateProduct(idx, 'notes', e.target.value)} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeProduct(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Inquiry' : 'Save Inquiry'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InquiryMaster;

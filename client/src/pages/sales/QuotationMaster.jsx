import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const QuotationMaster = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ items: [], summary: { subTotal: 0, totalTax: 0, totalDiscount: 0, grandTotal: 0 } });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const custRes = await axios.get('/master/customer');
      setCustomers(custRes.data.data.filter(c => c.isActive));
      
      const inqRes = await axios.get('/sales/inquiry');
      setInquiries(inqRes.data.data);

      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/sales/quotation');
      setQuotations(res.data.data);
    } catch (err) { console.error('Quotation fetch error', err); }
    setLoading(false);
  };

  const calculateTotals = (items) => {
    let subTotal = 0, totalTax = 0, totalDiscount = 0, grandTotal = 0;
    
    items.forEach(item => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      const discountAmt = lineTotal * ((item.discountPercentage || 0) / 100);
      const afterDiscount = lineTotal - discountAmt;
      const taxAmt = afterDiscount * ((item.taxPercentage || 0) / 100);
      
      const finalLineTotal = afterDiscount + taxAmt;
      item.total = finalLineTotal;

      subTotal += lineTotal;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
      grandTotal += finalLineTotal;
    });

    return { items, summary: { subTotal, totalTax, totalDiscount, grandTotal } };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Just demonstrating status updates or basic edits here. 
        // A true version control system would hit the /revision endpoint.
        await axios.put(`/sales/quotation/${editingId}/status`, { status: 'Draft', versionId: formData.versionId });
      } else {
        await axios.post('/sales/quotation', formData);
      }
      setIsModalOpen(false);
      setFormData({ items: [], summary: {} });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    const activeVersion = row.versions.find(v => v._id === row.activeVersionId) || row.versions[0];
    setFormData({ 
      quotationNumber: row.quotationNumber,
      customerId: row.customerId?._id || row.customerId,
      inquiryId: row.inquiryId?._id || row.inquiryId,
      items: activeVersion?.items || [],
      summary: activeVersion?.summary || {},
      versionId: activeVersion?._id
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const updateStatus = async (quotationId, versionId, status) => {
    try {
      await axios.put(`/sales/quotation/${quotationId}/status`, { versionId, status });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const addItem = () => {
    const { items, summary } = calculateTotals([...(formData.items || []), { productId: '', quantity: 1, unitPrice: 0, taxPercentage: 0, discountPercentage: 0, total: 0 }]);
    setFormData({ ...formData, items, summary });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = parseFloat(value) || 0;
    if (field === 'productId') newItems[index][field] = value; // Keep string for ID
    
    const { items, summary } = calculateTotals(newItems);
    setFormData({ ...formData, items, summary });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    const { items, summary } = calculateTotals(newItems);
    setFormData({ ...formData, items, summary });
  };

  const columns = [
    { header: 'Quotation No', accessor: 'quotationNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || '-' },
    { header: 'Grand Total', render: (row) => {
      const active = row.versions.find(v => v._id === row.activeVersionId) || row.versions[0];
      return `$${(active?.summary?.grandTotal || 0).toFixed(2)}`;
    }},
    { header: 'Status', render: (row) => {
      const active = row.versions.find(v => v._id === row.activeVersionId) || row.versions[0];
      const status = active?.status || 'Draft';
      return (
        <span style={{ 
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
          backgroundColor: status === 'Approved' ? '#10b98115' : status === 'Rejected' ? '#ef444415' : '#f59e0b15',
          color: status === 'Approved' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b'
        }}>
          {status}
        </span>
      );
    }}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Quotation Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage versions, taxes, discounts, and approvals</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ items: [], summary: {} }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Quotation
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={columns} 
            data={quotations} 
            isLoading={loading} 
            onEdit={handleEdit}
            customActions={(row) => {
              const active = row.versions.find(v => v._id === row.activeVersionId) || row.versions[0];
              if (active?.status !== 'Approved' && active?.status !== 'Rejected') {
                return (
                  <>
                    <button onClick={() => updateStatus(row._id, active._id, 'Approved')} title="Approve" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-success)', marginLeft: '4px' }}><CheckCircle size={14} /></button>
                    <button onClick={() => updateStatus(row._id, active._id, 'Rejected')} title="Reject" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', marginLeft: '4px' }}><XCircle size={14} /></button>
                  </>
                )
              }
              return null;
            }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Quotation`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Quotation Number</label>
              <input type="text" className="input-field" required value={formData.quotationNumber || ''} onChange={e => setFormData({...formData, quotationNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Customer</label>
              <select className="input-field" required value={formData.customerId || ''} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                <option value="" disabled>Select Customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {customers.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>* Please create a Customer first.</p>}
            </div>
            <div className="input-group">
              <label className="input-label">Reference Inquiry</label>
              <select className="input-field" value={formData.inquiryId || ''} onChange={e => setFormData({...formData, inquiryId: e.target.value})}>
                <option value="">None</option>
                {inquiries.map(i => <option key={i._id} value={i._id}>{i.inquiryNumber}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Line Items (Tax & Discount)</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addItem}>+ Add Item</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="input-group" style={{ margin: 0, flex: 2 }}>
                        <select className="input-field" required value={item.productId || ''} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                          <option value="" disabled>Select Product</option>
                          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        {products.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Create a Product first.</p>}
                      </div>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <input type="number" placeholder="Qty" className="input-field" required min="1" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                      </div>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <input type="number" placeholder="Unit Price" className="input-field" required min="0" value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <input type="number" placeholder="Tax %" className="input-field" min="0" value={item.taxPercentage || ''} onChange={e => updateItem(idx, 'taxPercentage', e.target.value)} />
                      </div>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <input type="number" placeholder="Discount %" className="input-field" min="0" max="100" value={item.discountPercentage || ''} onChange={e => updateItem(idx, 'discountPercentage', e.target.value)} />
                      </div>
                      <div className="input-group" style={{ margin: 0, flex: 1 }}>
                        <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                          ${(item.total || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}><XCircle size={18} /></button>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sub Total: ${(formData.summary?.subTotal || 0).toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-danger)' }}>Total Discount: -${(formData.summary?.totalDiscount || 0).toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Tax: +${(formData.summary?.totalTax || 0).toFixed(2)}</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                Grand Total: ${(formData.summary?.grandTotal || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Quotation' : 'Create Quotation (Draft)'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationMaster;

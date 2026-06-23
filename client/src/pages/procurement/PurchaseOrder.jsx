import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, Truck } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const PurchaseOrder = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [deliveryData, setDeliveryData] = useState({});
  const [selectedPo, setSelectedPo] = useState(null);

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const venRes = await axios.get('/master/vendor');
      setVendors(venRes.data.data.filter(v => v.isActive));

      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const rfqRes = await axios.get('/procurement/rfq');
      setRfqs(rfqRes.data.data.filter(r => r.status === 'Closed'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/procurement/po');
      setPurchaseOrders(res.data.data);
    } catch (err) { console.error('PO fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/procurement/po', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving PO');
    }
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/procurement/po/${selectedPo._id}/status`, { deliveryStatus: deliveryData.deliveryStatus });
      setIsDeliveryModalOpen(false);
      setDeliveryData({});
      fetchData();
    } catch (err) { alert('Error updating delivery status'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/procurement/po/${id}/status`, { status });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const handleRfqSelect = (e) => {
    const rfqId = e.target.value;
    const rfq = rfqs.find(r => r._id === rfqId);
    if (rfq) {
      const winningQuote = rfq.receivedQuotations.find(q => q.selected);
      if (winningQuote) {
        setFormData({
          ...formData,
          rfqId: rfqId,
          vendorId: winningQuote.vendorId._id || winningQuote.vendorId,
          items: [{
            materialId: rfq.materialId._id || rfq.materialId,
            quantity: rfq.quantity,
            unitPrice: winningQuote.quoteAmount,
            scheduledDeliveryDate: new Date(Date.now() + (winningQuote.leadTimeDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
          }]
        });
      }
    } else {
      setFormData({ ...formData, rfqId: '', vendorId: '', items: [{}] });
    }
  };

  const columns = [
    { header: 'PO Number', accessor: 'poNumber' },
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Vendor', render: (row) => row.vendorId?.name || '-' },
    { header: 'Total Amount', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>${row.totalAmount?.toFixed(2)}</strong> },
    { header: 'Approval Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Approved' ? '#10b98115' : row.status === 'Rejected' ? '#ef444415' : 'var(--bg-tertiary)',
        color: row.status === 'Approved' ? '#10b981' : row.status === 'Rejected' ? '#ef4444' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Delivery Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.deliveryStatus === 'Delivered' ? '#10b98115' : row.deliveryStatus === 'Scheduled' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.deliveryStatus === 'Delivered' ? '#10b981' : row.deliveryStatus === 'Scheduled' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.deliveryStatus}
      </span>
    )}
  ];

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'Pending' && (
          <>
            <button onClick={() => handleStatusUpdate(row._id, 'Approved')} title="Approve PO" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-success)' }}><CheckCircle size={14} /></button>
            <button onClick={() => handleStatusUpdate(row._id, 'Rejected')} title="Reject PO" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}><XCircle size={14} /></button>
          </>
        )}
        {row.status === 'Approved' && row.deliveryStatus !== 'Delivered' && (
          <button onClick={() => { setSelectedPo(row); setDeliveryData({ deliveryStatus: row.deliveryStatus }); setIsDeliveryModalOpen(true); }} title="Update Delivery Schedule" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}><Truck size={14} /></button>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Purchase Orders</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage vendor orders, approvals, and deliveries</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ items: [{}] }); setIsModalOpen(true); }}>
          <Plus size={14} /> Create PO
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={purchaseOrders} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Pull from Closed RFQ (Auto-fills Winning Quote)</label>
            <select className="input-field" value={formData.rfqId || ''} onChange={handleRfqSelect}>
              <option value="">-- Manual Entry --</option>
              {rfqs.map(r => <option key={r._id} value={r._id}>{r.rfqNumber} (Winner: {r.receivedQuotations.find(q=>q.selected)?.vendorId?.name})</option>)}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Select Vendor</label>
            <select className="input-field" required value={formData.vendorId || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})} disabled={!!formData.rfqId}>
              <option value="" disabled>Select Vendor</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '6px', marginBottom: '16px', backgroundColor: 'var(--bg-secondary)' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '12px' }}>Line Item Detail</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Material</label>
                <select className="input-field" required value={formData.items?.[0]?.materialId || ''} onChange={e => setFormData({...formData, items: [{ ...formData.items[0], materialId: e.target.value }]})} disabled={!!formData.rfqId}>
                  <option value="" disabled>Select Material</option>
                  {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Quantity</label>
                <input type="number" className="input-field" required min="1" value={formData.items?.[0]?.quantity || ''} onChange={e => setFormData({...formData, items: [{ ...formData.items[0], quantity: parseInt(e.target.value) }]})} disabled={!!formData.rfqId} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Unit Price ($)</label>
                <input type="number" className="input-field" required min="0.01" step="0.01" value={formData.items?.[0]?.unitPrice || ''} onChange={e => setFormData({...formData, items: [{ ...formData.items[0], unitPrice: parseFloat(e.target.value) }]})} disabled={!!formData.rfqId} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Scheduled Delivery Date</label>
                <input type="date" className="input-field" required value={formData.items?.[0]?.scheduledDeliveryDate || ''} onChange={e => setFormData({...formData, items: [{ ...formData.items[0], scheduledDeliveryDate: e.target.value }]})} disabled={!!formData.rfqId} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit PO for Approval</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} title="Update Delivery Schedule">
        <form onSubmit={handleUpdateDelivery}>
          <div className="input-group">
            <label className="input-label">Current Delivery Status</label>
            <select className="input-field" required value={deliveryData.deliveryStatus || ''} onChange={e => setDeliveryData({...deliveryData, deliveryStatus: e.target.value})}>
              <option value="Not Scheduled">Not Scheduled</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In-Transit">In-Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDeliveryModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Delivery</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrder;

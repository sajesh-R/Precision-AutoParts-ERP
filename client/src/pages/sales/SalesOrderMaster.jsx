import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, PackageSearch, Factory, Truck } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const SalesOrderMaster = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAtpModalOpen, setIsAtpModalOpen] = useState(false);
  const [formData, setFormData] = useState({ items: [], summary: {} });
  const [atpData, setAtpData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const custRes = await axios.get('/master/customer');
      setCustomers(custRes.data.data.filter(c => c.isActive));
      
      const quotRes = await axios.get('/sales/quotation');
      // Only approved quotations can become sales orders ideally
      setQuotations(quotRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/sales/order');
      setOrders(res.data.data);
    } catch (err) { console.error('Order fetch error', err); }
    setLoading(false);
  };

  const handleQuotationSelect = (quotationId) => {
    const quote = quotations.find(q => q._id === quotationId);
    if (quote) {
      const activeVersion = quote.versions.find(v => v._id === quote.activeVersionId) || quote.versions[0];
      setFormData({
        ...formData,
        quotationId,
        customerId: quote.customerId?._id || quote.customerId,
        items: activeVersion?.items || [],
        summary: activeVersion?.summary || {}
      });
    }
  };

  const handleEdit = (row) => {
    setFormData({
      ...row,
      customerId: row.customerId?._id || row.customerId,
      quotationId: row.quotationId?._id || row.quotationId,
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/sales/order/${editingId}`, formData);
      } else {
        await axios.post('/sales/order', formData);
      }
      setIsModalOpen(false);
      setFormData({ items: [], summary: {} });
      setEditingId(null);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error saving data'); }
  };

  const handleAtpSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/sales/order/${editingId}/atp`, atpData);
      setIsAtpModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error updating ATP'); }
  };

  const openAtpModal = (row) => {
    setEditingId(row._id);
    setAtpData({
      inventoryAvailable: row.atpCheck?.inventoryAvailable || false,
      capacityAvailable: row.atpCheck?.capacityAvailable || false,
      deliveryFeasible: row.atpCheck?.deliveryFeasible || false,
      notes: row.atpCheck?.notes || '',
      deliveryCommitment: row.deliveryCommitment ? row.deliveryCommitment.split('T')[0] : ''
    });
    setIsAtpModalOpen(true);
  };

  const advanceTracking = async (row) => {
    // A simplified state machine for demonstration
    const orderFlow = ['Created', 'Processing', 'Confirmed'];
    const prodFlow = ['Pending', 'In Progress', 'Completed'];
    const dispatchFlow = ['Pending', 'Packed', 'Shipped', 'Delivered'];
    const invFlow = ['Pending', 'Generated', 'Paid'];

    let current = { ...row.trackingStatus };

    if (current.orderStatus !== 'Confirmed') {
      current.orderStatus = orderFlow[orderFlow.indexOf(current.orderStatus) + 1] || 'Confirmed';
    } else if (current.productionStatus !== 'Completed') {
      current.productionStatus = prodFlow[prodFlow.indexOf(current.productionStatus) + 1] || 'Completed';
    } else if (current.dispatchStatus !== 'Delivered') {
      current.dispatchStatus = dispatchFlow[dispatchFlow.indexOf(current.dispatchStatus) + 1] || 'Delivered';
    } else if (current.invoiceStatus !== 'Paid') {
      current.invoiceStatus = invFlow[invFlow.indexOf(current.invoiceStatus) + 1] || 'Paid';
    }

    try {
      await axios.put(`/sales/order/${row._id}/tracking`, { trackingStatus: current });
      fetchData();
    } catch (err) { alert('Error updating tracking status'); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/sales/order/${id}`, { status: newStatus });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const columns = [
    { header: 'Order No', accessor: 'orderNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || '-' },
    { header: 'Grand Total', render: (row) => `$${(row.summary?.grandTotal || 0).toFixed(2)}` },
    { header: 'Delivery Commitment', render: (row) => row.deliveryCommitment ? new Date(row.deliveryCommitment).toLocaleDateString() : 'Pending ATP' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const getTrackingBadge = (status) => {
    let color = 'var(--text-secondary)';
    let bg = 'var(--bg-tertiary)';
    if (status === 'Completed' || status === 'Delivered' || status === 'Paid' || status === 'Confirmed') {
      color = '#10b981'; bg = '#10b98115';
    } else if (status === 'In Progress' || status === 'Shipped' || status === 'Processing') {
      color = '#3b82f6'; bg = '#3b82f615';
    }
    return <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color, backgroundColor: bg }}>{status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Sales Order Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage Orders, ATP, and Order Tracking</p>
        </div>
         <button className="btn btn-primary" onClick={() => { setFormData({ items: [], summary: {}, orderNumber: 'SO-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Sales Order
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={columns} 
            data={orders} 
            isLoading={loading} 
            onEdit={handleEdit}
            customActions={(row) => (
              <>
                {row.status === 'Draft' && (
                  <button onClick={() => handleStatusUpdate(row._id, 'Approved')} title="Approve Order" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', marginLeft: '8px' }}>
                    <CheckCircle size={14} />
                  </button>
                )}
                <button onClick={() => openAtpModal(row)} title="ATP Check" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginLeft: '8px' }}><PackageSearch size={14} /></button>
                <button onClick={() => advanceTracking(row)} title="Advance Tracking" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', marginLeft: '8px' }}><Truck size={14} /></button>
              </>
            )}
            expandedRowRender={(row) => (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Status</span>
                  {getTrackingBadge(row.trackingStatus?.orderStatus)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Production</span>
                  {getTrackingBadge(row.trackingStatus?.productionStatus)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dispatch</span>
                  {getTrackingBadge(row.trackingStatus?.dispatchStatus)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Invoice</span>
                  {getTrackingBadge(row.trackingStatus?.invoiceStatus)}
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Sales Order">
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Order Number</label>
              <input type="text" className="input-field" required readOnly value={formData.orderNumber || ''} onChange={e => setFormData({...formData, orderNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Reference Quotation</label>
              <select className="input-field" required value={formData.quotationId || ''} onChange={e => handleQuotationSelect(e.target.value)}>
                <option value="" disabled>Select Quotation</option>
                {quotations.map(q => <option key={q._id} value={q._id}>{q.quotationNumber}</option>)}
              </select>
              {quotations.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>No Quotations found.</p>}
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Customer</label>
            <select className="input-field" disabled value={formData.customerId || ''}>
              <option value="">Auto-filled from Quotation</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Order Preview</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Items: {formData.items?.length || 0}</p>
            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>Grand Total: ${(formData.summary?.grandTotal || 0).toFixed(2)}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Order</button>
          </div>
        </form>
      </Modal>

      {/* ATP Modal */}
      <Modal isOpen={isAtpModalOpen} onClose={() => setIsAtpModalOpen(false)} title="Available-To-Promise (ATP) Check">
        <form onSubmit={handleAtpSave}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Perform manual verification for Inventory, Production Capacity, and Delivery Feasibility to commit a delivery date.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={atpData.inventoryAvailable} onChange={e => setAtpData({...atpData, inventoryAvailable: e.target.checked})} />
              Inventory Available (Check Warehouse)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={atpData.capacityAvailable} onChange={e => setAtpData({...atpData, capacityAvailable: e.target.checked})} />
              Production Capacity Available (Check Work Centers)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={atpData.deliveryFeasible} onChange={e => setAtpData({...atpData, deliveryFeasible: e.target.checked})} />
              Delivery is Feasible
            </label>
          </div>

          <div className="input-group">
            <label className="input-label">ATP Notes / Constraints</label>
            <textarea className="input-field" rows="2" value={atpData.notes || ''} onChange={e => setAtpData({...atpData, notes: e.target.value})}></textarea>
          </div>

          <div className="input-group">
            <label className="input-label">Delivery Date Commitment</label>
            <input type="date" className="input-field" required value={atpData.deliveryCommitment || ''} onChange={e => setAtpData({...atpData, deliveryCommitment: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAtpModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save ATP Results</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesOrderMaster;

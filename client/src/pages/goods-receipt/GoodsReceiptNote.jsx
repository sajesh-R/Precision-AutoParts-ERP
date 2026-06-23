import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckSquare } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const GoodsReceiptNote = () => {
  const [grns, setGrns] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const poRes = await axios.get('/procurement/po');
      // Only POs that are Approved or Dispatched can receive goods
      setPurchaseOrders(poRes.data.data.filter(po => po.status === 'Approved' || po.status === 'Dispatched'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/receipt/grn');
      setGrns(res.data.data);
    } catch (err) { console.error('GRN fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/receipt/grn', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving GRN');
    }
  };

  const handlePOSelect = (e) => {
    const poId = e.target.value;
    const po = purchaseOrders.find(p => p._id === poId);
    if (po && po.items && po.items.length > 0) {
      // Assuming 1 item per PO for simplicity based on our PO UI design, or taking the first item
      const item = po.items[0];
      setFormData({
        ...formData,
        purchaseOrderId: poId,
        vendorId: po.vendorId?._id || po.vendorId,
        materialId: item.materialId?._id || item.materialId,
        poQuantity: item.quantity,
        receivedQuantity: item.quantity // default actual to expected
      });
    } else {
      setFormData({ ...formData, purchaseOrderId: '' });
    }
  };

  const columns = [
    { header: 'GRN Number', accessor: 'grnNumber' },
    { header: 'Receipt Date', render: (row) => new Date(row.receiptDate).toLocaleDateString() },
    { header: 'PO Reference', render: (row) => row.purchaseOrderId?.poNumber || '-' },
    { header: 'Vendor', render: (row) => row.vendorId?.name || '-' },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'PO Qty', accessor: 'poQuantity' },
    { header: 'Received Qty', render: (row) => <strong style={{ color: row.receivedQuantity < row.poQuantity ? 'var(--accent-warning)' : 'var(--text-primary)' }}>{row.receivedQuantity}</strong> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Posted' ? '#10b98115' : row.status === 'Inspecting' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.status === 'Posted' ? '#10b981' : row.status === 'Inspecting' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Goods Receipt Note (GRN)</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receive materials against authorized Purchase Orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Plus size={14} /> Create GRN
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={grns} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Goods Receipt (GRN)">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Validate against Purchase Order</label>
            <select className="input-field" required value={formData.purchaseOrderId || ''} onChange={handlePOSelect}>
              <option value="" disabled>Select Approved PO</option>
              {purchaseOrders.map(po => <option key={po._id} value={po._id}>{po.poNumber} - {po.vendorId?.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Expected PO Quantity</label>
              <input type="number" className="input-field" disabled value={formData.poQuantity || ''} />
            </div>
            <div className="input-group">
              <label className="input-label">Actual Received Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.receivedQuantity || ''} onChange={e => setFormData({...formData, receivedQuantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Receipt Notes</label>
            <textarea className="input-field" rows="2" placeholder="Note any visible damage or delivery discrepancies..." value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckSquare size={16} color="var(--accent-primary)" />
            Submitting this GRN will automatically generate a Pending Quality Inspection ticket.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save GRN</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoodsReceiptNote;

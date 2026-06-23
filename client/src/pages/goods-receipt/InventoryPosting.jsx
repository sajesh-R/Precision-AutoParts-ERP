import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Warehouse } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const InventoryPosting = () => {
  const [stocks, setStocks] = useState([]);
  const [completedInspections, setCompletedInspections] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const whRes = await axios.get('/company/warehouses');
      setWarehouses(whRes.data.data.filter(w => w.isActive));

      const inspRes = await axios.get('/receipt/inspection');
      // Only get Completed inspections that have some accepted quantity and haven't been posted yet (GRN status checks this, but we'll filter by GRN status here)
      setCompletedInspections(inspRes.data.data.filter(i => i.inspectionStatus === 'Completed' && i.acceptedQuantity > 0 && i.grnId?.status !== 'Posted'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/receipt/inventory');
      setStocks(res.data.data);
    } catch (err) { console.error('Inventory fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/receipt/inventory/post', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
      fetchDependencies(); // refresh inspections list
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting inventory');
    }
  };

  const handleInspectionSelect = (e) => {
    const inspId = e.target.value;
    const insp = completedInspections.find(i => i._id === inspId);
    if (insp) {
      setFormData({
        ...formData,
        inspectionId: inspId,
        materialName: insp.grnId?.materialId?.name,
        acceptedQty: insp.acceptedQuantity
      });
    } else {
      setFormData({ ...formData, inspectionId: '', materialName: '', acceptedQty: '' });
    }
  };

  const columns = [
    { header: 'Batch No', accessor: 'batchNumber' },
    { header: 'Posting Date', render: (row) => new Date(row.postingDate).toLocaleDateString() },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Warehouse', render: (row) => row.warehouseId?.name || '-' },
    { header: 'Available Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.quantityAvailable}</strong> },
    { header: 'Source GRN', render: (row) => row.sourceGrnId?.grnNumber || '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Active' ? '#10b98115' : 'var(--bg-tertiary)',
        color: row.status === 'Active' ? '#10b981' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Inventory Posting</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Allocate accepted materials into physical Warehouse stock</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <PackagePlus size={14} /> Post to Inventory
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={stocks} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Inventory Posting">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Select Completed Inspection</label>
            <select className="input-field" required value={formData.inspectionId || ''} onChange={handleInspectionSelect}>
              <option value="" disabled>Select Approved Inspection</option>
              {completedInspections.map(i => <option key={i._id} value={i._id}>{i.inspectionNumber} - {i.grnId?.materialId?.name} (Qty: {i.acceptedQuantity})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Material Target</label>
              <input type="text" className="input-field" disabled value={formData.materialName || ''} />
            </div>
            <div className="input-group">
              <label className="input-label">Accepted Stock to Post</label>
              <input type="number" className="input-field" disabled value={formData.acceptedQty || ''} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Allocate to Warehouse</label>
            <select className="input-field" required value={formData.warehouseId || ''} onChange={e => setFormData({...formData, warehouseId: e.target.value})}>
              <option value="" disabled>Select Destination Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name} ({w.type})</option>)}
            </select>
          </div>

          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Warehouse size={16} color="var(--accent-primary)" />
            Posting will automatically generate a unique BATCH NUMBER and update the GRN status.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!formData.inspectionId}>Confirm & Post Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPosting;

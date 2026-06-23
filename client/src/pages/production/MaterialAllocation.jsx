import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageOpen, ArrowRightCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MaterialAllocation = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [formData, setFormData] = useState({ action: 'reserve', quantity: '' });
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/production/wo');
      // Only show WOs that are released or in-progress, meaning they need materials actively
      setOrders(res.data.data.filter(wo => ['Released', 'In-Progress'].includes(wo.status)));
    } catch (err) { console.error('WO fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/production/wo/allocation', {
        workOrderId: selectedWO._id,
        materialId: selectedMaterial.materialId._id,
        action: formData.action,
        quantity: parseInt(formData.quantity)
      });
      setIsModalOpen(false);
      setSelectedWO(null);
      setSelectedMaterial(null);
      setFormData({ action: 'reserve', quantity: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating allocation');
    }
  };

  const openActionModal = (wo, material) => {
    setSelectedWO(wo);
    setSelectedMaterial(material);
    setFormData({ action: 'reserve', quantity: material.requiredQty }); // Default to full qty
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'WO Number', accessor: 'workOrderNumber' },
    { header: 'WO Status', render: (row) => <span style={{ color: '#3b82f6', fontWeight: 600 }}>{row.status}</span> },
    { header: 'BOM Requirements', render: (row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {row.allocatedMaterials.map((mat, idx) => (
          <div key={idx} style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '12px' }}>{mat.materialId?.name}</strong>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>Req: {mat.requiredQty}</span>
                <span style={{ color: mat.reservedQty > 0 ? 'var(--accent-primary)' : '' }}>Res: {mat.reservedQty}</span>
                <span style={{ color: mat.issuedQty > 0 ? '#f59e0b' : '' }}>Iss: {mat.issuedQty}</span>
                <span style={{ color: mat.consumedQty > 0 ? '#10b981' : '' }}>Con: {mat.consumedQty}</span>
              </div>
            </div>
            {mat.consumedQty < mat.requiredQty && (
              <button onClick={() => openActionModal(row, mat)} className="btn-icon" style={{ padding: '4px', background: 'var(--bg-tertiary)', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <ArrowRightCircle size={14} />
              </button>
            )}
            {mat.consumedQty >= mat.requiredQty && (
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Fulfilled</span>
            )}
          </div>
        ))}
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Material Allocation</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage Reservation, Issuing, and Consumption of BOM materials against active Work Orders</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={orders} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Allocate: ${selectedMaterial?.materialId?.name}`}>
        {selectedWO && selectedMaterial && (
          <form onSubmit={handleSave}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Work Order:</span> <br/> <strong>{selectedWO.workOrderNumber}</strong></div>
              <div><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Required Qty:</span> <br/> <strong>{selectedMaterial.requiredQty}</strong></div>
            </div>

            <div className="input-group">
              <label className="input-label">Action</label>
              <select className="input-field" required value={formData.action || ''} onChange={e => setFormData({...formData, action: e.target.value})}>
                <option value="reserve">Reserve Material (Hold in Warehouse)</option>
                <option value="issue">Issue Material (Move to Shop Floor)</option>
                <option value="consume">Consume Material (Burn into WIP)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" className="input-field" required min="1" max={selectedMaterial.requiredQty} value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Apply Action</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MaterialAllocation;

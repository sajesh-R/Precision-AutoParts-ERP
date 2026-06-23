import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, PlusCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ProductionOutput = () => {
  const [outputs, setOutputs] = useState([]);
  const [completedWOs, setCompletedWOs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedWO, setSelectedWO] = useState(null);

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const woRes = await axios.get('/production/wo');
      // Active WOs can have output recorded against them
      setCompletedWOs(woRes.data.data.filter(wo => ['Released', 'In-Progress', 'Completed'].includes(wo.status)));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/production/output');
      setOutputs(res.data.data);
    } catch (err) { console.error('Output fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Validate totals
      const totalRecorded = Number(formData.goodQuantity) + Number(formData.rejectedQuantity) + Number(formData.scrapQuantity);
      
      await axios.post('/production/output', formData);
      setIsModalOpen(false);
      setFormData({});
      setSelectedWO(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording output');
    }
  };

  const handleWOSelect = (e) => {
    const woId = e.target.value;
    const wo = completedWOs.find(w => w._id === woId);
    if (wo) {
      setSelectedWO(wo);
      setFormData({ 
        workOrderId: woId, 
        goodQuantity: wo.targetQuantity, // Pre-fill with perfect assumption
        rejectedQuantity: 0,
        scrapQuantity: 0
      });
    }
  };

  const columns = [
    { header: 'Output No', accessor: 'outputNumber' },
    { header: 'WO Reference', render: (row) => row.workOrderId?.workOrderNumber || '-' },
    { header: 'Material Target', render: (row) => row.workOrderId?.materialId?.name || '-' },
    { header: 'Target Qty', render: (row) => row.workOrderId?.targetQuantity || '-' },
    { header: 'Good Qty', render: (row) => <strong style={{ color: '#10b981' }}>{row.goodQuantity}</strong> },
    { header: 'Rejected Qty', render: (row) => <strong style={{ color: '#ef4444' }}>{row.rejectedQuantity}</strong> },
    { header: 'Scrap Qty', render: (row) => <strong style={{ color: '#f59e0b' }}>{row.scrapQuantity}</strong> },
    { header: 'Recorded By', accessor: 'recordedBy' },
    { header: 'Date', render: (row) => new Date(row.recordedDate).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Production Output</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Record Quality Check yields (Good, Rejected, Scrap) for completed Work Orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setSelectedWO(null); setIsModalOpen(true); }}>
          <PlusCircle size={14} /> Record Output
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={outputs} isLoading={loading} onEdit={() => {}} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Production Output Yield">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Select Completed Work Order</label>
            <select className="input-field" required value={formData.workOrderId || ''} onChange={handleWOSelect}>
              <option value="" disabled>Select WO</option>
              {completedWOs.map(wo => <option key={wo._id} value={wo._id}>{wo.workOrderNumber} (Target: {wo.targetQuantity})</option>)}
            </select>
          </div>

          {selectedWO && (
            <>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', borderLeft: '3px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Quantity for {selectedWO.workOrderNumber} was:</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{selectedWO.targetQuantity}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#10b981' }}>Good Quantity</label>
                  <input type="number" className="input-field" required min="0" value={formData.goodQuantity || 0} onChange={e => setFormData({...formData, goodQuantity: parseInt(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#ef4444' }}>Rejected Quantity</label>
                  <input type="number" className="input-field" required min="0" value={formData.rejectedQuantity || 0} onChange={e => setFormData({...formData, rejectedQuantity: parseInt(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ color: '#f59e0b' }}>Scrap Quantity</label>
                  <input type="number" className="input-field" required min="0" value={formData.scrapQuantity || 0} onChange={e => setFormData({...formData, scrapQuantity: parseInt(e.target.value)})} />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!selectedWO}>Save Output Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionOutput;

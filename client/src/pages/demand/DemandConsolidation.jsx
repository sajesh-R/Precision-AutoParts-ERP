import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Filter } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DemandConsolidation = () => {
  const [consolidations, setConsolidations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatePeriod, setGeneratePeriod] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/demand/consolidation');
      setConsolidations(res.data.data);
    } catch (err) { console.error('Consolidation fetch error', err); }
    setLoading(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/demand/consolidation/generate', { period: generatePeriod });
      setIsGenerateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating consolidations');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/demand/consolidation/${editingId}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating safety stock');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      safetyStockRequirement: row.safetyStockRequirement || 0,
      notes: row.notes || ''
    });
    setEditingId(row._id);
    setIsEditModalOpen(true);
  };

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Product', render: (row) => row.productId?.name || '-' },
    { header: 'Forecast Demand', accessor: 'forecastDemand' },
    { header: 'Sales Orders', accessor: 'salesOrderDemand' },
    { header: 'Safety Stock', accessor: 'safetyStockRequirement' },
    { header: 'Total Gross Demand', render: (row) => (
      <strong style={{ color: 'var(--accent-primary)' }}>{row.totalGrossDemand}</strong>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Demand Consolidation</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aggregate Sales Orders, Forecasts, and Safety Stock</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsGenerateModalOpen(true)}>
          <RefreshCw size={14} /> Run Consolidation
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={consolidations} isLoading={loading} onEdit={handleEdit} />
        </div>
      </div>

      <Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate Consolidation">
        <form onSubmit={handleGenerate}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This process aggregates all Finalized Forecasts and committed Sales Orders for the specified period to compute Total Gross Demand.
          </p>
          <div className="input-group">
            <label className="input-label">Target Period (e.g., Q3-2026)</label>
            <input type="text" className="input-field" required value={generatePeriod} onChange={e => setGeneratePeriod(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Run Consolidation Engine</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Requirements">
        <form onSubmit={handleSaveEdit}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Update manual overrides like Safety Stock requirements. Total Gross Demand will recalculate automatically.
          </p>
          <div className="input-group">
            <label className="input-label">Safety Stock Requirement</label>
            <input type="number" className="input-field" required min="0" value={formData.safetyStockRequirement || ''} onChange={e => setFormData({...formData, safetyStockRequirement: parseInt(e.target.value) || 0})} />
          </div>
          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DemandConsolidation;

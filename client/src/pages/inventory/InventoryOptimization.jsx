import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, Search, CheckCircle, Settings } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const InventoryOptimization = () => {
  const [optimizations, setOptimizations] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await axios.get('/master/material');
      setMaterials(res.data.data.filter(m => m.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/inventory/optimization');
      setOptimizations(res.data.data);
    } catch (err) { console.error('Optimization fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory/optimization/update', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving optimization params');
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await axios.post('/inventory/optimization/analyze');
      await fetchData();
      alert('ABC Analysis and Dead Stock evaluation completed successfully!');
    } catch (err) {
      alert('Error running analysis');
    }
    setAnalyzing(false);
  };

  const openEditModal = (row) => {
    setFormData({
      materialId: row.materialId?._id || row.materialId,
      reorderLevel: row.reorderLevel,
      safetyStock: row.safetyStock
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Material Name', render: (row) => row.materialId?.name || '-' },
    { header: 'Category', render: (row) => row.materialId?.category?.name || '-' },
    { header: 'Reorder Level', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.reorderLevel}</strong> },
    { header: 'Safety Stock', render: (row) => <strong style={{ color: 'var(--accent-primary)' }}>{row.safetyStock}</strong> },
    { header: 'ABC Class', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
        backgroundColor: row.abcClassification === 'A' ? '#10b98115' : row.abcClassification === 'B' ? '#3b82f615' : row.abcClassification === 'C' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.abcClassification === 'A' ? '#10b981' : row.abcClassification === 'B' ? '#3b82f6' : row.abcClassification === 'C' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.abcClassification}
      </span>
    )},
    { header: 'Dead Stock Risk', render: (row) => (
      row.isDeadStock ? <span style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}><AlertTriangle size={12} /> High Risk</span> : <span style={{ color: 'var(--accent-success)', fontSize: '11px' }}>Low Risk</span>
    )},
    { header: 'Last Analysis', render: (row) => new Date(row.lastAnalysisDate).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Inventory Optimization</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage Reorder Levels, Safety Stock, and perform ABC/Dead Stock Analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleRunAnalysis} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : <><Activity size={14} /> Run Global Analysis</>}
          </button>
          <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
            <Settings size={14} /> Set Parameters
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={optimizations} isLoading={loading} onEdit={openEditModal} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Optimization Parameters">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Material</label>
            <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})} disabled={!!formData.materialId && Object.keys(formData).length > 1}>
              <option value="" disabled>Select Material</option>
              {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Reorder Level</label>
              <input type="number" className="input-field" required min="0" value={formData.reorderLevel || ''} onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Safety Stock</label>
              <input type="number" className="input-field" required min="0" value={formData.safetyStock || ''} onChange={e => setFormData({...formData, safetyStock: parseInt(e.target.value)})} />
            </div>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle size={16} color="var(--accent-primary)" />
            ABC Classification and Dead Stock risk are calculated automatically by the "Run Global Analysis" engine.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Parameters</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryOptimization;

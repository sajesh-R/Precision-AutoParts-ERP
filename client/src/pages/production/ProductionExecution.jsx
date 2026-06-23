import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckSquare, FastForward } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ProductionExecution = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/production/wo');
      // Show WOs that are ready to start or currently running
      setOrders(res.data.data.filter(wo => ['Released', 'In-Progress'].includes(wo.status)));
    } catch (err) { console.error('WO fetch error', err); }
    setLoading(false);
  };

  const handleStart = async (id) => {
    try {
      await axios.put(`/production/wo/${id}`, { status: 'In-Progress', actualStartDate: new Date() });
      fetchData();
    } catch (err) { alert('Error starting production'); }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/production/wo/${id}`, { status: 'Completed', actualEndDate: new Date(), progressPercentage: 100 });
      fetchData();
    } catch (err) { alert('Error completing production'); }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/production/wo/${selectedWO._id}`, { progressPercentage: parseInt(formData.progressPercentage) });
      setIsModalOpen(false);
      setSelectedWO(null);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating progress');
    }
  };

  const openProgressModal = (wo) => {
    setSelectedWO(wo);
    setFormData({ progressPercentage: wo.progressPercentage });
    setIsModalOpen(true);
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {row.status === 'Released' && (
          <button onClick={() => handleStart(row._id)} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Play size={12} /> Start Production
          </button>
        )}
        {row.status === 'In-Progress' && (
          <>
            <button onClick={() => openProgressModal(row)} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FastForward size={12} /> Update Progress
            </button>
            <button onClick={() => handleComplete(row._id)} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckSquare size={12} /> Complete
            </button>
          </>
        )}
      </div>
    );
  };

  const columns = [
    { header: 'WO Number', accessor: 'workOrderNumber' },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Target Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.targetQuantity}</strong> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'In-Progress' ? '#f59e0b15' : '#3b82f615',
        color: row.status === 'In-Progress' ? '#f59e0b' : '#3b82f6'
      }}>
        {row.status}
      </span>
    )},
    { header: 'Progress', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
        <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${row.progressPercentage}%`, backgroundColor: '#10b981', transition: 'width 0.3s ease' }}></div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>{row.progressPercentage}%</span>
      </div>
    )},
    { header: 'Start Date', render: (row) => row.actualStartDate ? new Date(row.actualStartDate).toLocaleString() : '-' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Production Execution</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shop Floor view to start runs, update progress, and mark as Complete</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={orders} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Progress">
        {selectedWO && (
          <form onSubmit={handleSaveProgress}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Updating WO: <strong>{selectedWO.workOrderNumber}</strong></div>
            </div>

            <div className="input-group">
              <label className="input-label">Completion Percentage (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={formData.progressPercentage || 0} 
                  onChange={e => setFormData({...formData, progressPercentage: e.target.value})}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontWeight: 600, width: '40px', textAlign: 'right' }}>{formData.progressPercentage}%</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Progress</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProductionExecution;

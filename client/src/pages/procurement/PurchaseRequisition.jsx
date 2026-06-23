import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const PurchaseRequisition = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [mrpSuggestions, setMrpSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ sourceType: 'Manual' });

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const mrpRes = await axios.get('/mrp/recommendations');
      setMrpSuggestions(mrpRes.data.data.filter(r => r.suggestionType === 'Purchase' && r.status === 'Pending'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/procurement/requisition');
      setRequisitions(res.data.data);
    } catch (err) { console.error('Requisitions fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/procurement/requisition', formData);
      setIsModalOpen(false);
      setFormData({ sourceType: 'Manual' });
      fetchData();
      fetchDependencies(); // refresh mrp suggestions
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving requisition');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/procurement/requisition/${id}/status`, { status });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const handleSuggestionSelect = (e) => {
    const suggId = e.target.value;
    const sugg = mrpSuggestions.find(s => s._id === suggId);
    if (sugg) {
      setFormData({
        ...formData,
        sourceType: 'MRP',
        mrpRecommendationId: suggId,
        materialId: sugg.itemId?._id || sugg.itemId,
        requestedQuantity: sugg.suggestedQuantity,
        requiredDate: sugg.suggestedDate ? sugg.suggestedDate.split('T')[0] : ''
      });
    } else {
      setFormData({ ...formData, sourceType: 'Manual', mrpRecommendationId: '' });
    }
  };

  const columns = [
    { header: 'PR Number', accessor: 'requisitionNumber' },
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Source', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.sourceType === 'MRP' ? '#8b5cf615' : 'var(--bg-tertiary)',
        color: row.sourceType === 'MRP' ? '#8b5cf6' : 'var(--text-secondary)'
      }}>
        {row.sourceType}
      </span>
    )},
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.requestedQuantity}</strong> },
    { header: 'Required Date', render: (row) => new Date(row.requiredDate).toLocaleDateString() },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Approved' ? '#10b98115' : row.status === 'Rejected' ? '#ef444415' : 'var(--bg-tertiary)',
        color: row.status === 'Approved' ? '#10b981' : row.status === 'Rejected' ? '#ef4444' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  const actionRenderer = (row) => {
    if (row.status === 'Pending') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleStatusUpdate(row._id, 'Approved')} title="Approve" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-success)' }}><CheckCircle size={14} /></button>
          <button onClick={() => handleStatusUpdate(row._id, 'Rejected')} title="Reject" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}><XCircle size={14} /></button>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Purchase Requisitions</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Create manual requisitions or convert MRP purchase suggestions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ sourceType: 'Manual' }); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Requisition
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={requisitions} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Requisition">
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Source Type</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <input type="radio" checked={formData.sourceType === 'Manual'} onChange={() => setFormData({ ...formData, sourceType: 'Manual', mrpRecommendationId: '' })} /> Manual
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                <input type="radio" checked={formData.sourceType === 'MRP'} onChange={() => setFormData({ ...formData, sourceType: 'MRP' })} /> MRP-Based
              </label>
            </div>
          </div>

          {formData.sourceType === 'MRP' && (
            <div className="input-group">
              <label className="input-label">Select MRP Purchase Suggestion</label>
              <select className="input-field" required value={formData.mrpRecommendationId || ''} onChange={handleSuggestionSelect}>
                <option value="" disabled>Select Pending Suggestion</option>
                {mrpSuggestions.map(s => <option key={s._id} value={s._id}>{s.itemId?.name} (Qty: {s.suggestedQuantity})</option>)}
              </select>
              {mrpSuggestions.length === 0 && <p style={{ color: 'var(--accent-warning)', fontSize: '11px', marginTop: '4px' }}>* No pending MRP purchase suggestions found.</p>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Material</label>
              <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})} disabled={formData.sourceType === 'MRP'}>
                <option value="" disabled>Select Material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Requested Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.requestedQuantity || ''} onChange={e => setFormData({...formData, requestedQuantity: parseInt(e.target.value)})} disabled={formData.sourceType === 'MRP'} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Required Date</label>
            <input type="date" className="input-field" required value={formData.requiredDate || ''} onChange={e => setFormData({...formData, requiredDate: e.target.value})} disabled={formData.sourceType === 'MRP'} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formData.sourceType === 'MRP' && !formData.mrpRecommendationId}>Submit for Approval</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseRequisition;

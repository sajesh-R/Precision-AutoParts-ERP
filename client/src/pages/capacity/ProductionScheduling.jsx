import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ProductionScheduling = () => {
  const [activeTab, setActiveTab] = useState('Daily'); // Daily, Weekly, Monthly
  const [schedules, setSchedules] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [products, setProducts] = useState([]);
  const [mrpSuggestions, setMrpSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ scheduleType: 'Daily' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchDependencies = async () => {
    try {
      const wcRes = await axios.get('/master/workcenter');
      setWorkCenters(wcRes.data.data.filter(wc => wc.isActive));

      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));

      // Fetch pending Production suggestions from MRP
      const mrpRes = await axios.get('/mrp/recommendations');
      setMrpSuggestions(mrpRes.data.data.filter(r => r.suggestionType === 'Production' && r.status !== 'Dismissed'));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/capacity/schedule?type=${activeTab}`);
      setSchedules(res.data.data);
    } catch (err) { console.error('Schedule fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/capacity/schedule/${editingId}`, formData);
      } else {
        await axios.post('/capacity/schedule', formData);
      }
      setIsModalOpen(false);
      setFormData({ scheduleType: activeTab });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving schedule');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      scheduleType: row.scheduleType,
      targetDate: row.targetDate ? row.targetDate.split('T')[0] : '',
      mrpRecommendationId: row.mrpRecommendationId || '',
      productId: row.productId?._id || row.productId,
      scheduledQuantity: row.scheduledQuantity,
      assignedWorkCenterId: row.assignedWorkCenterId?._id || row.assignedWorkCenterId,
      status: row.status,
      notes: row.notes || ''
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const handleSuggestionSelect = (e) => {
    const suggId = e.target.value;
    const sugg = mrpSuggestions.find(s => s._id === suggId);
    if (sugg) {
      setFormData({
        ...formData,
        mrpRecommendationId: suggId,
        productId: sugg.itemId?._id || sugg.itemId,
        scheduledQuantity: sugg.suggestedQuantity
      });
    } else {
      setFormData({ ...formData, mrpRecommendationId: '' });
    }
  };

  const columns = [
    { header: 'Target Date', render: (row) => new Date(row.targetDate).toLocaleDateString() },
    { header: 'Product', render: (row) => row.productId?.name || '-' },
    { header: 'Scheduled Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.scheduledQuantity}</strong> },
    { header: 'Assigned Work Center', render: (row) => row.assignedWorkCenterId?.name || '-' },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Completed' ? '#10b98115' : row.status === 'In-Progress' ? '#3b82f615' : 'var(--bg-tertiary)',
        color: row.status === 'Completed' ? '#10b981' : row.status === 'In-Progress' ? '#3b82f6' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Production Scheduling</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Allocate MRP Production Suggestions to Daily, Weekly, or Monthly timelines</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', padding: '4px' }}>
            <button 
              className={`btn ${activeTab === 'Daily' ? 'btn-primary' : ''}`} 
              style={{ background: activeTab === 'Daily' ? '' : 'transparent', color: activeTab === 'Daily' ? '' : 'var(--text-secondary)', border: 'none' }}
              onClick={() => setActiveTab('Daily')}
            >
              <Calendar size={14} style={{ marginRight: '6px' }} /> Daily
            </button>
            <button 
              className={`btn ${activeTab === 'Weekly' ? 'btn-primary' : ''}`} 
              style={{ background: activeTab === 'Weekly' ? '' : 'transparent', color: activeTab === 'Weekly' ? '' : 'var(--text-secondary)', border: 'none' }}
              onClick={() => setActiveTab('Weekly')}
            >
              <CalendarDays size={14} style={{ marginRight: '6px' }} /> Weekly
            </button>
            <button 
              className={`btn ${activeTab === 'Monthly' ? 'btn-primary' : ''}`} 
              style={{ background: activeTab === 'Monthly' ? '' : 'transparent', color: activeTab === 'Monthly' ? '' : 'var(--text-secondary)', border: 'none' }}
              onClick={() => setActiveTab('Monthly')}
            >
              <CalendarRange size={14} style={{ marginRight: '6px' }} /> Monthly
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setFormData({ scheduleType: activeTab, status: 'Draft' }); setEditingId(null); setIsModalOpen(true); }}>
            <Plus size={14} /> Add to Schedule
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={schedules} isLoading={loading} onEdit={handleEdit} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} ${activeTab} Schedule`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Pull from MRP Suggestion (Optional)</label>
            <select className="input-field" value={formData.mrpRecommendationId || ''} onChange={handleSuggestionSelect}>
              <option value="">-- Manual Entry --</option>
              {mrpSuggestions.map(s => <option key={s._id} value={s._id}>{s.itemId?.name} (Qty: {s.suggestedQuantity})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Target Product</label>
              <select className="input-field" required value={formData.productId || ''} onChange={e => setFormData({...formData, productId: e.target.value})} disabled={!!formData.mrpRecommendationId}>
                <option value="" disabled>Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Scheduled Quantity</label>
              <input type="number" className="input-field" required min="1" value={formData.scheduledQuantity || ''} onChange={e => setFormData({...formData, scheduledQuantity: parseInt(e.target.value)})} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Target Date</label>
              <input type="date" className="input-field" required value={formData.targetDate || ''} onChange={e => setFormData({...formData, targetDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Assign Work Center</label>
              <select className="input-field" required value={formData.assignedWorkCenterId || ''} onChange={e => setFormData({...formData, assignedWorkCenterId: e.target.value})}>
                <option value="" disabled>Select Work Center</option>
                {workCenters.map(wc => <option key={wc._id} value={wc._id}>{wc.name}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="input-field" required value={formData.status || 'Draft'} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea className="input-field" rows="2" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Schedule' : 'Save Schedule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionScheduling;

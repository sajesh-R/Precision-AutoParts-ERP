import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, GitPullRequest, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const EngineeringChange = () => {
  const [changes, setChanges] = useState([]);
  const [boms, setBoms] = useState([]);
  const [routings, setRoutings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ impactAnalysis: {} });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const bomRes = await axios.get('/engineering/bom');
      setBoms(bomRes.data.data.filter(b => b.isActive));
      
      const routingRes = await axios.get('/engineering/routing');
      setRoutings(routingRes.data.data.filter(r => r.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/engineering/ecm');
      setChanges(res.data.data);
    } catch (err) { console.error('ECM fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Typically, editing an ECR is restricted depending on status, 
        // but we'll allow basic editing for demonstration
        await axios.put(`/engineering/ecm/${editingId}`, formData);
      } else {
        await axios.post('/engineering/ecm', formData);
      }
      setIsModalOpen(false);
      setFormData({ impactAnalysis: {} });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      ecrNumber: row.ecrNumber,
      title: row.title,
      description: row.description,
      targetBomId: row.targetBomId?._id || row.targetBomId,
      targetRoutingId: row.targetRoutingId?._id || row.targetRoutingId,
      impactAnalysis: row.impactAnalysis || {}
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/engineering/ecm/${id}/status`, { status, comments: `Status updated to ${status} via grid` });
      fetchData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const columns = [
    { header: 'ECR No', accessor: 'ecrNumber' },
    { header: 'Title', accessor: 'title' },
    { header: 'Target BOM', render: (row) => row.targetBomId?.bomNumber || '-' },
    { header: 'Target Routing', render: (row) => row.targetRoutingId?.routingNumber || '-' },
    { header: 'Status', render: (row) => {
      const colors = {
        'Draft': 'var(--text-secondary)',
        'Pending Review': '#f59e0b',
        'Approved': 'var(--accent-success)',
        'Rejected': 'var(--accent-danger)'
      };
      return (
        <span style={{ 
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
          backgroundColor: `${colors[row.status]}15`,
          color: colors[row.status]
        }}>
          {row.status}
        </span>
      );
    }}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Engineering Change Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Track and Approve Change Requests (ECR)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ impactAnalysis: {} }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create ECR
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={columns} 
            data={changes} 
            isLoading={loading} 
            onEdit={handleEdit}
            customActions={(row) => (
              <>
                {row.status !== 'Approved' && row.status !== 'Rejected' && (
                  <>
                    <button onClick={() => updateStatus(row._id, 'Approved')} title="Approve" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-success)', marginLeft: '4px' }}>
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => updateStatus(row._id, 'Rejected')} title="Reject" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', marginLeft: '4px' }}>
                      <XCircle size={14} />
                    </button>
                  </>
                )}
              </>
            )}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Change Request (ECR)`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">ECR Number</label>
              <input type="text" className="input-field" required value={formData.ecrNumber || ''} onChange={e => setFormData({...formData, ecrNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Title</label>
              <input type="text" className="input-field" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Reason for Change / Description</label>
            <textarea className="input-field" rows="3" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="input-group">
              <label className="input-label">Target BOM</label>
              <select className="input-field" value={formData.targetBomId || ''} onChange={e => setFormData({...formData, targetBomId: e.target.value})}>
                <option value="">None</option>
                {boms.map(b => <option key={b._id} value={b._id}>{b.bomNumber}</option>)}
              </select>
              {boms.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  No BOMs available.
                </p>
              )}
            </div>
            <div className="input-group">
              <label className="input-label">Target Routing</label>
              <select className="input-field" value={formData.targetRoutingId || ''} onChange={e => setFormData({...formData, targetRoutingId: e.target.value})}>
                <option value="">None</option>
                {routings.map(r => <option key={r._id} value={r._id}>{r.routingNumber}</option>)}
              </select>
              {routings.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  No Routings available.
                </p>
              )}
            </div>
          </div>

          {/* Impact Analysis Section */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#f59e0b" /> Impact Analysis
            </h3>
            
            <div className="input-group">
              <label className="input-label">Product Impact</label>
              <textarea className="input-field" rows="2" placeholder="Will this change product specifications?" value={formData.impactAnalysis?.productImpact || ''} onChange={e => setFormData({...formData, impactAnalysis: {...formData.impactAnalysis, productImpact: e.target.value}})}></textarea>
            </div>
            <div className="input-group">
              <label className="input-label">BOM / Component Impact</label>
              <textarea className="input-field" rows="2" placeholder="New components needed? Scrap percentage changes?" value={formData.impactAnalysis?.bomImpact || ''} onChange={e => setFormData({...formData, impactAnalysis: {...formData.impactAnalysis, bomImpact: e.target.value}})}></textarea>
            </div>
            <div className="input-group">
              <label className="input-label">Routing Impact</label>
              <textarea className="input-field" rows="2" placeholder="Time studies or process steps affected?" value={formData.impactAnalysis?.routingImpact || ''} onChange={e => setFormData({...formData, impactAnalysis: {...formData.impactAnalysis, routingImpact: e.target.value}})}></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update ECR' : 'Submit ECR'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EngineeringChange;

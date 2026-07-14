import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const WorkCenterMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/master/workcenter');
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/master/workcenter/${editingId}`, formData);
      } else {
        await axios.post('/master/workcenter', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData(row);
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    try {
      await axios.put(`/master/workcenter/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const columns = [
    { header: 'Work Center Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Description', accessor: 'description' },
    { header: 'Status', render: (row) => (
      <span style={{ color: row.isActive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Work Center Master</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ code: 'WC-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Add New
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable 
          columns={columns} 
          data={data} 
          isLoading={loading} 
          onEdit={handleEdit}
          customActions={(row) => (
            <button 
              onClick={() => toggleStatus(row)} 
              title={row.isActive ? "Deactivate" : "Activate"} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isActive ? 'var(--accent-danger)' : 'var(--accent-success)' }}
            >
              {row.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
            </button>
          )}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Work Center`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Work Center Name</label>
            <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Code</label>
            <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkCenterMaster;

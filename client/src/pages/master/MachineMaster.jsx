import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Settings, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const MachineMaster = () => {
  const [data, setData] = useState([]);
  const [plants, setPlants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [pRes, dRes, wRes, uRes] = await Promise.all([
        axios.get('/company/plants'),
        axios.get('/company/departments'),
        axios.get('/master/workcenter'),
        axios.get('/master/uom')
      ]);
      setPlants(pRes.data.data);
      setDepartments(dRes.data.data);
      setWorkCenters(wRes.data.data);
      setUoms(uRes.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/master/machine');
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/master/machine/${editingId}`, formData);
      } else {
        await axios.post('/master/machine', formData);
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
    setFormData({
      ...row,
      plantId: row.plantId?._id || row.plantId,
      departmentId: row.departmentId?._id || row.departmentId,
      workCenterId: row.workCenterId?._id || row.workCenterId,
      uomId: row.uomId?._id || row.uomId
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    if (row.isActive && !window.confirm('Are you sure you want to deactivate this record?')) return;
    try {
      await axios.put(`/master/machine/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const columns = [
    { header: 'Machine Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Plant', render: (row) => row.plantId?.name || '-' },
    { header: 'Department', render: (row) => row.departmentId?.name || '-' },
    { header: 'Work Center', render: (row) => row.workCenterId?.name || '-' },
    { header: 'Hourly Cost', render: (row) => `$${row.hourlyCost || 0}` },
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
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Machine Master</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ code: 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Machine`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Machine Name</label>
            <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Machine Code</label>
            <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Plant</label>
            <select className="input-field" required value={formData.plantId || ''} onChange={e => setFormData({...formData, plantId: e.target.value})}>
              <option value="" disabled>Select Plant</option>
              {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Department</label>
            <select className="input-field" required value={formData.departmentId || ''} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
              <option value="" disabled>Select Department</option>
              {departments
                .filter(d => !formData.plantId || (d.plantId?._id || d.plantId) === formData.plantId)
                .map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Work Center (Optional)</label>
            <select className="input-field" value={formData.workCenterId || ''} onChange={e => setFormData({...formData, workCenterId: e.target.value})}>
              <option value="">None / Standalone Machine</option>
              {workCenters
                .filter(w => !formData.departmentId || (w.departmentId?._id || w.departmentId) === formData.departmentId)
                .map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Hourly Cost ($)</label>
            <input type="number" className="input-field" value={formData.hourlyCost || ''} onChange={e => setFormData({...formData, hourlyCost: e.target.value})} />
          </div>
          <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Capacity / Rate</label>
              <input type="number" className="input-field" value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Capacity UOM</label>
              <select className="input-field" value={formData.uomId || ''} onChange={e => setFormData({...formData, uomId: e.target.value})}>
                <option value="">Select UOM</option>
                {uoms.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Manufacturer</label>
            <input type="text" className="input-field" value={formData.manufacturer || ''} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Serial Number</label>
            <input type="text" className="input-field" value={formData.serialNumber || ''} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Purchase Date</label>
            <input type="date" className="input-field" value={formData.purchaseDate ? formData.purchaseDate.split('T')[0] : ''} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
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

export default MachineMaster;

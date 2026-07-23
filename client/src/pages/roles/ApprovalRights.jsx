import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ApprovalRights = () => {
  const [configs, setConfigs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ module: '', action: 'create', levels: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchConfigs();
    fetchRoles();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/approvals/config');
      setConfigs(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/roles');
      setRoles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.levels.length === 0) {
      return alert('You must add at least one approval level.');
    }

    const selectedRoles = formData.levels.map(l => l.roleId);
    const uniqueRoles = new Set(selectedRoles);
    if (uniqueRoles.size !== selectedRoles.length) {
      return alert('Duplicate roles are not allowed. A role can only be assigned to one approval level per rule.');
    }

    try {
      if (editingId) {
        await axios.put(`/approvals/config/${editingId}`, formData);
      } else {
        await axios.post('/approvals/config', formData);
      }
      setIsModalOpen(false);
      setFormData({ module: '', action: 'create', levels: [] });
      setEditingId(null);
      fetchConfigs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving configuration');
    }
  };

  const deleteConfig = async (config) => {
    if (!confirm('Are you sure you want to delete this approval configuration?')) return;
    try {
      await axios.delete(`/approvals/config/${config._id}`);
      fetchConfigs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting configuration');
    }
  };

  const handleEdit = (config) => {
    const formattedLevels = config.levels.map(l => ({
      level: l.level,
      roleId: l.roleId?._id || l.roleId
    }));
    setFormData({ module: config.module, action: config.action, levels: formattedLevels });
    setEditingId(config._id);
    setIsModalOpen(true);
  };

  const addLevel = () => {
    setFormData(prev => ({
      ...prev,
      levels: [...prev.levels, { level: prev.levels.length + 1, roleId: '' }]
    }));
  };

  const removeLevel = (index) => {
    if (!window.confirm('Are you sure you want to remove this level?')) return;
    setFormData(prev => {
      const newLevels = prev.levels.filter((_, i) => i !== index).map((l, i) => ({ ...l, level: i + 1 }));
      return { ...prev, levels: newLevels };
    });
  };

  const updateLevelRole = (index, roleId) => {
    setFormData(prev => {
      const newLevels = [...prev.levels];
      newLevels[index].roleId = roleId;
      return { ...prev, levels: newLevels };
    });
  };

  const columns = [
    { header: 'Module', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle size={18} color="var(--accent-primary)" />
        <div>
          <div style={{ fontWeight: 600 }}>{row.module}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Action: {row.action}</div>
        </div>
      </div>
    )},
    { header: 'Approval Levels', render: (row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {row.levels.map(l => (
          <span key={l.level} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Level {l.level}: <strong>{l.roleId?.name || 'Unknown Role'}</strong>
          </span>
        ))}
      </div>
    )},
    { header: 'Actions', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={() => handleEdit(row)} title="Edit Config" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
          <Edit2 size={16} />
        </button>
        <button onClick={() => deleteConfig(row)} title="Delete Config" style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Configure Approval Rights</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Set up multi-level approval rules for different modules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ module: '', action: 'create', levels: [] });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus size={14} /> Create Rule
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable columns={columns} data={configs} isLoading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Rule" : "Create Rule"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Module</label>
              <select className="input-field" required value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})}>
                <option value="" disabled>Select Module</option>
                <option value="Plant">Plant</option>
                <option value="Branch">Branch</option>
                <option value="Warehouse">Warehouse</option>
                <option value="User">User</option>
                <option value="Role">Role</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Action</label>
              <select className="input-field" required value={formData.action} onChange={e => setFormData({...formData, action: e.target.value})}>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Approval Levels</h3>
              <button type="button" onClick={addLevel} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={14} /> Add Level
              </button>
            </div>

            {formData.levels.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No approval levels configured. Click "Add Level" to start.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {formData.levels.map((level, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <div style={{ width: '60px', fontWeight: 600, fontSize: '0.875rem' }}>Level {level.level}</div>
                    <select 
                      className="input-field" 
                      required 
                      style={{ flex: 1, marginBottom: 0 }}
                      value={level.roleId} 
                      onChange={e => updateLevelRole(index, e.target.value)}
                    >
                      <option value="" disabled>Select Role</option>
                      {roles.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeLevel(index)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Rule' : 'Save Rule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApprovalRights;

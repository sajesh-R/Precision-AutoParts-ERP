import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Shield, Edit2, Copy, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ALL_MODULES = ['CompanySetup', 'Users', 'Roles', 'Audit'];
const PERM_CATEGORIES = {
  screens: ['view_list', 'view_detail', 'view_settings'],
  actions: ['create', 'read', 'update', 'delete', 'approve'],
  buttons: ['export_btn', 'import_btn', 'print_btn'],
  reports: ['summary_report', 'detailed_report', 'audit_report']
};

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/roles');
      setRoles(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/roles/${editingId}`, formData);
      } else {
        await axios.post('/roles', formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving role');
    }
  };

  const deleteRole = async (role) => {
    if (role.isSystem) return alert('System roles cannot be deleted');
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`/roles/${role._id}`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting role');
    }
  };

  const handleEdit = (role) => {
    setFormData({ name: role.name, description: role.description, permissions: role.permissions || [] });
    setEditingId(role._id);
    setIsModalOpen(true);
  };

  const handleClone = (role) => {
    setFormData({ name: `${role.name} (Copy)`, description: role.description, permissions: role.permissions || [] });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const togglePermission = (moduleName, category, value) => {
    setFormData(prev => {
      const perms = [...prev.permissions];
      const modIndex = perms.findIndex(p => p.module === moduleName);
      
      if (modIndex >= 0) {
        const catArray = new Set(perms[modIndex][category] || []);
        if (catArray.has(value)) {
          catArray.delete(value);
        } else {
          catArray.add(value);
        }
        perms[modIndex] = { ...perms[modIndex], [category]: Array.from(catArray) };
      } else {
        perms.push({ module: moduleName, [category]: [value] });
      }
      return { ...prev, permissions: perms };
    });
  };

  const hasPermission = (moduleName, category, value) => {
    const mod = formData.permissions.find(p => p.module === moduleName);
    return mod && mod[category] ? mod[category].includes(value) : false;
  };

  const columns = [
    { header: 'Role Name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield size={18} color="var(--accent-primary)" />
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.description}</div>
        </div>
      </div>
    )},
    { header: 'System Role', render: (row) => (
      <span style={{ 
        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
        backgroundColor: row.isSystem ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-tertiary)',
        color: row.isSystem ? 'var(--accent-warning)' : 'var(--text-secondary)'
      }}>
        {row.isSystem ? 'Yes' : 'No'}
      </span>
    )},
    { header: 'Permissions', render: (row) => (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {row.permissions?.length || 0} Modules Configured
      </div>
    )},
    { header: 'Actions', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={() => handleEdit(row)} title="Edit Role" style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
          <Edit2 size={16} />
        </button>
        <button onClick={() => handleClone(row)} title="Clone Role" style={{ background: 'none', border: 'none', color: 'var(--accent-success)', cursor: 'pointer' }}>
          <Copy size={16} />
        </button>
        {!row.isSystem && (
          <button onClick={() => deleteRole(row)} title="Delete Role" style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Roles & Permissions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Configure granular access controls and define roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ name: '', description: '', permissions: [] });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus size={14} /> Create Role
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable columns={columns} data={roles} isLoading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Role" : "Create Role"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Role Name</label>
              <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <input type="text" className="input-field" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '300px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Granular Feature Permissions</h3>
            {ALL_MODULES.map(moduleName => (
              <div key={moduleName} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                  {moduleName}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
                  {Object.entries(PERM_CATEGORIES).map(([category, values]) => (
                    <div key={category}>
                      <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>{category}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {values.map(val => (
                          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={hasPermission(moduleName, category, val)}
                              onChange={() => togglePermission(moduleName, category, val)}
                              style={{ cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                            />
                            {val.replace('_', ' ')}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Role' : 'Save Role'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RolesPermissions;

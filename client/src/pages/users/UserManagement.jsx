import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, ShieldAlert, ShieldOff, Edit2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [plants, setPlants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const res = await axios.get('/company/data');
      setPlants(res.data.plants || []);
      setBranches(res.data.branches || []);
      setBusinessUnits(res.data.businessUnits || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/roles');
      setRoles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/users/${editingId}`, formData);
      } else {
        await axios.post('/users', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/users/${id}/status`, { status });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      ...row, 
      roleId: row.role?._id || '',
      plantId: row.plantId?._id || row.plantId || '',
      branchId: row.branchId?._id || row.branchId || '',
      businessUnitId: row.businessUnitId?._id || row.businessUnitId || ''
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };



  const columns = [
    { header: 'Name', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {row.firstName[0]}{row.lastName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      </div>
    )},
    { header: 'Role', render: (row) => (
      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
        {row.role?.name || 'No Role'}
      </span>
    )},

    { header: 'Status', render: (row) => {
      const colors = {
        'Active': 'var(--accent-success)',
        'Inactive': 'var(--text-muted)',
        'Suspended': 'var(--accent-warning)',
        'Locked': 'var(--accent-danger)'
      };
      return (
        <select 
          value={row.status || 'Active'} 
          onChange={(e) => updateStatus(row._id, e.target.value)}
          style={{ 
            padding: '0.25rem 0.5rem', borderRadius: '1rem', 
            backgroundColor: 'var(--bg-tertiary)', color: colors[row.status] || colors['Active'], 
            fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border-color)' 
          }}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
          <option value="Locked">Locked</option>
        </select>
      );
    }},
    { header: 'Actions', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => handleEdit(row)} title="Edit User" style={{ background: 'none', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer' }}>
          <Edit2 size={16} />
        </button>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Manage your organization's users, roles, and security statuses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormData({});
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <UserPlus size={14} /> Add User
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable columns={columns} data={users} isLoading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit User" : "Create User"}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input type="text" className="input-field" required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input type="text" className="input-field" required value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {!editingId && (
            <div className="input-group">
              <label className="input-label">Temporary Password</label>
              <input type="password" className="input-field" required value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Role</label>
            <select className="input-field" required value={formData.roleId || ''} onChange={e => setFormData({...formData, roleId: e.target.value})}>
              <option value="" disabled>Select a Role</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Data Access Restrictions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Plant Assignment (Optional)</label>
                <select className="input-field" value={formData.plantId || ''} onChange={e => setFormData({...formData, plantId: e.target.value})}>
                  <option value="">None</option>
                  {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Branch Assignment (Optional)</label>
                <select className="input-field" value={formData.branchId || ''} onChange={e => setFormData({...formData, branchId: e.target.value})}>
                  <option value="">None</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">BU Assignment (Optional)</label>
                <select className="input-field" value={formData.businessUnitId || ''} onChange={e => setFormData({...formData, businessUnitId: e.target.value})}>
                  <option value="">None</option>
                  {businessUnits.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update User' : 'Create User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

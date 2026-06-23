import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Building, MapPin, Building2, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CompanySetup = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [data, setData] = useState([]);
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    if (activeTab === 'branches' || activeTab === 'warehouses') fetchPlants();
    if (activeTab === 'plants') fetchUsers();
  }, [activeTab]);



  const fetchPlants = async () => {
    try {
      const res = await axios.get('/company/plants');
      setPlants(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'profiles': endpoint = '/company/profiles'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'branches': endpoint = '/company/branches'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
        case 'business_units': endpoint = '/company/business-units'; break;
      }
      
      if (endpoint) {
        const res = await axios.get(endpoint);
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'profiles': endpoint = '/company/profiles'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'branches': endpoint = '/company/branches'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
        case 'business_units': endpoint = '/company/business-units'; break;
        default: return;
      }
      
      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, formData);
      } else {
        const res = await axios.post(endpoint, formData);
        if (res.status === 202) {
          alert(res.data.message || 'Submitted for approval!');
        }
      }
      
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    }
  };

  const handleEdit = (row) => {
    setFormData({ ...row, plantId: row.plantId?._id || row.plantId });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'profiles': endpoint = '/company/profiles'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'branches': endpoint = '/company/branches'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
        case 'business_units': endpoint = '/company/business-units'; break;
      }
      await axios.put(`${endpoint}/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const tabs = [
    { id: 'profiles', label: 'Company Profiles', icon: <Building size={18} /> },
    { id: 'plants', label: 'Plants', icon: <Building2 size={18} /> },
    { id: 'branches', label: 'Branches', icon: <MapPin size={18} /> },
    { id: 'warehouses', label: 'Warehouses', icon: <Building size={18} /> },
    { id: 'cost_centers', label: 'Cost Centers', icon: <Building size={18} /> },
    { id: 'business_units', label: 'Business Units', icon: <Building size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' }
    ];

    if (activeTab !== 'profiles') {
      baseCols.push({ header: 'Code', accessor: 'code' });
    } else {
      baseCols.push({ header: 'Reg Number', accessor: 'registrationNumber' });
      baseCols.push({ header: 'Contact Email', accessor: 'contactEmail' });
    }

    if (activeTab === 'plants') {
      baseCols.push({ header: 'Location', accessor: 'location' });
      baseCols.push({ header: 'Manager', render: (row) => row.managerId ? `${row.managerId.firstName} ${row.managerId.lastName}` : '-' });
    }
    
    if (activeTab === 'branches' || activeTab === 'warehouses') {
      baseCols.push({ header: 'Plant', render: (row) => row.plantId?.name || '-' });
    }

    baseCols.push({ header: 'Status', render: (row) => (
      <span style={{ 
        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
        backgroundColor: row.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: row.isActive ? 'var(--accent-success)' : 'var(--accent-danger)'
      }}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )});

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Company Setup</h1>
        </div>
        {activeTab !== 'profile' && (
          <button className="btn btn-primary" onClick={() => {
            setFormData({});
            setEditingId(null);
            setIsModalOpen(true);
          }}>
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', backgroundColor: 'var(--bg-tertiary)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                backgroundColor: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                whiteSpace: 'nowrap',
                fontSize: '13px'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={getColumns()} 
            data={data} 
            isLoading={loading} 
            onEdit={handleEdit}
            customActions={(row) => (
              <button 
                onClick={() => toggleStatus(row)} 
                title={row.isActive ? "Deactivate" : "Activate"} 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                  color: row.isActive ? 'var(--accent-danger)' : 'var(--accent-success)' 
                }}
              >
                {row.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
              </button>
            )}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} ${activeTab.slice(0, -1)}`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input type="text" className="input-field" required 
                   value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          {activeTab !== 'profiles' && (
            <div className="input-group">
              <label className="input-label">Code</label>
              <input type="text" className="input-field" required 
                     value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
          )}

          {activeTab === 'profiles' && (
            <>
              <div className="input-group">
                <label className="input-label">Registration Number</label>
                <input type="text" className="input-field" 
                       value={formData.registrationNumber || ''} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Contact Email</label>
                <input type="email" className="input-field" 
                       value={formData.contactEmail || ''} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea className="input-field" rows="3"
                          value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
            </>
          )}
          
          {activeTab === 'plants' && (
            <>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input type="text" className="input-field" 
                       value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Plant Manager</label>
                <select className="input-field" value={formData.managerId || ''} onChange={e => setFormData({...formData, managerId: e.target.value})}>
                  <option value="">None</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.firstName} {user.lastName}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(activeTab === 'branches' || activeTab === 'warehouses') && (
            <div className="input-group">
              <label className="input-label">Plant</label>
              <select className="input-field" required value={formData.plantId || ''} onChange={e => setFormData({...formData, plantId: e.target.value})}>
                <option value="" disabled>Select a Plant</option>
                {plants.map(plant => (
                  <option key={plant._id} value={plant._id}>{plant.name} ({plant.code})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanySetup;

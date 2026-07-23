import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Building, MapPin, Building2, CheckCircle, XCircle, Users } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CompanySetup = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [data, setData] = useState([]);
  
  // Reference data for dropdowns
  const [companies, setCompanies] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [plants, setPlants] = useState([]);
  
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchReferences();
  }, [activeTab]);

  const fetchReferences = async () => {
    try {
      const [compRes, buRes, plantRes] = await Promise.all([
        axios.get('/company/profiles'),
        axios.get('/company/business-units'),
        axios.get('/company/plants')
      ]);
      setCompanies(compRes.data.data || []);
      setBusinessUnits(buRes.data.data || []);
      setPlants(plantRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch references', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'profiles': endpoint = '/company/profiles'; break;
        case 'business_units': endpoint = '/company/business-units'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'departments': endpoint = '/company/departments'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
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
        case 'business_units': endpoint = '/company/business-units'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'departments': endpoint = '/company/departments'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
        default: return;
      }
      
      let payload = { ...formData };
      
      // Clean up empty strings for sparse unique fields
      if (activeTab === 'profiles') {
        if (payload.gst === '') delete payload.gst;
      }

      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, payload);
        alert('Updated successfully!');
      } else {
        await axios.post(endpoint, payload);
        alert('Created successfully!');
      }
      
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
      fetchReferences(); // Refresh references in case a new BU/Plant was added
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.message || err.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    // Flatten populated objects to just their IDs for editing
    const editData = { ...row };
    if (editData.companyId && editData.companyId._id) editData.companyId = editData.companyId._id;
    if (editData.businessUnitId && editData.businessUnitId._id) editData.businessUnitId = editData.businessUnitId._id;
    if (editData.plantId && editData.plantId._id) editData.plantId = editData.plantId._id;
    
    setFormData(editData);
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'profiles': endpoint = '/company/profiles'; break;
        case 'business_units': endpoint = '/company/business-units'; break;
        case 'plants': endpoint = '/company/plants'; break;
        case 'departments': endpoint = '/company/departments'; break;
        case 'warehouses': endpoint = '/company/warehouses'; break;
        case 'cost_centers': endpoint = '/company/cost-centers'; break;
      }
      
      const currentActive = row.status === 'Active';
      // User requested to remove incorrect confirmation message
      
      await axios.put(`${endpoint}/${row._id}`, { status: currentActive ? 'Inactive' : 'Active' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const tabs = [
    { id: 'profiles', label: 'Companies', icon: <Building size={18} /> },
    { id: 'business_units', label: 'Business Units', icon: <Building size={18} /> },
    { id: 'plants', label: 'Plants', icon: <Building2 size={18} /> },
    { id: 'departments', label: 'Departments', icon: <Users size={18} /> },
    { id: 'warehouses', label: 'Warehouses', icon: <Building size={18} /> },
    { id: 'cost_centers', label: 'Cost Centers', icon: <Building size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' }
    ];

    if (activeTab === 'profiles') {
      baseCols.push({ header: 'Code', accessor: 'code' });
      baseCols.push({ header: 'GST', accessor: 'gst' });
      baseCols.push({ header: 'Currency', accessor: 'currency' });
    } else {
      baseCols.push({ header: 'Code', accessor: 'code' });
    }

    if (activeTab === 'business_units') {
      baseCols.push({ header: 'Company', render: (row) => row.companyId?.name || '-' });
    }

    if (activeTab === 'plants') {
      baseCols.push({ header: 'Company', render: (row) => row.companyId?.name || '-' });
      baseCols.push({ header: 'Business Unit', render: (row) => row.businessUnitId?.name || '-' });
    }
    
    if (activeTab === 'departments' || activeTab === 'warehouses') {
      baseCols.push({ header: 'Plant', render: (row) => row.plantId?.name || '-' });
    }

    baseCols.push({ header: 'Status', render: (row) => {
      const active = row.status === 'Active';
      return (
        <span style={{ 
          padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
          backgroundColor: active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: active ? 'var(--accent-success)' : 'var(--accent-danger)'
        }}>
          {active ? 'Active' : 'Inactive'}
        </span>
      );
    }});

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Organization Setup</h1>
        </div>
        <button className="btn btn-primary" onClick={() => {
          let code = '';
          if (activeTab !== 'profiles') {
            let codePrefix = '';
            switch (activeTab) {
              case 'plants': codePrefix = 'PLNT-'; break;
              case 'departments': codePrefix = 'DEPT-'; break;
              case 'warehouses': codePrefix = 'WRHS-'; break;
              case 'cost_centers': codePrefix = 'CC-'; break;
              case 'business_units': codePrefix = 'BU-'; break;
            }
            code = codePrefix + Math.random().toString(36).substring(2, 8).toUpperCase();
          } else {
            code = 'CMP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          }
          setFormData({ code });
          setEditingId(null);
          setIsModalOpen(true);
        }}>
          <Plus size={14} /> Add New
        </button>
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
            customActions={(row) => {
              const active = row.status === 'Active';
              return (
                <button 
                  onClick={() => toggleStatus(row)} 
                  title={active ? "Deactivate" : "Activate"} 
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                    color: active ? 'var(--accent-danger)' : 'var(--accent-success)' 
                  }}
                >
                  {active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                </button>
              );
            }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} ${activeTab.replace('_', ' ')}`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input type="text" className="input-field" required 
                   value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Code</label>
            <input type="text" className="input-field" required readOnly 
                   value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>

          {activeTab === 'profiles' && (
            <>
              <div className="input-group">
                <label className="input-label">GST</label>
                <input type="text" className="input-field" 
                       value={formData.gst || ''} onChange={e => setFormData({...formData, gst: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">PAN</label>
                <input type="text" className="input-field" 
                       value={formData.pan || ''} onChange={e => setFormData({...formData, pan: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" className="input-field" 
                       value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input type="text" className="input-field" 
                       value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea className="input-field" 
                       value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Country</label>
                <input type="text" className="input-field" 
                       value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input type="text" className="input-field" 
                       value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Currency</label>
                <input type="text" className="input-field" 
                       value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Time Zone</label>
                <input type="text" className="input-field" 
                       value={formData.timeZone || ''} onChange={e => setFormData({...formData, timeZone: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Fiscal Year</label>
                <input type="text" className="input-field" 
                       value={formData.fiscalYear || ''} onChange={e => setFormData({...formData, fiscalYear: e.target.value})} />
              </div>
            </>
          )}

          {(activeTab === 'business_units' || activeTab === 'plants') && (
            <div className="input-group">
              <label className="input-label">Company</label>
              <select className="input-field" required value={formData.companyId || ''} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                <option value="" disabled>Select a Company</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'business_units' && (
            <div className="input-group">
              <label className="input-label">Description</label>
              <input type="text" className="input-field" 
                     value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          )}

          {activeTab === 'plants' && (
            <>
              <div className="input-group">
                <label className="input-label">Business Unit</label>
                <select className="input-field" required value={formData.businessUnitId || ''} onChange={e => setFormData({...formData, businessUnitId: e.target.value})}>
                  <option value="" disabled>Select a Business Unit</option>
                  {businessUnits.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea className="input-field" 
                       value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Currency</label>
                <input type="text" className="input-field" 
                       value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Time Zone</label>
                <input type="text" className="input-field" 
                       value={formData.timeZone || ''} onChange={e => setFormData({...formData, timeZone: e.target.value})} />
              </div>
            </>
          )}

          {(activeTab === 'departments' || activeTab === 'warehouses') && (
            <div className="input-group">
              <label className="input-label">Plant</label>
              <select className="input-field" required value={formData.plantId || ''} onChange={e => setFormData({...formData, plantId: e.target.value})}>
                <option value="" disabled>Select a Plant</option>
                {plants.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
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

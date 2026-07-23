import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, Map, Target, Layers, LayoutGrid, Building } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const WarehouseMaster = () => {
  const [activeTab, setActiveTab] = useState('warehouses');
  const [data, setData] = useState([]);
  
  // Reference data
  const [plants, setPlants] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, [activeTab]);

  const fetchDependencies = async () => {
    try {
      if (activeTab === 'warehouses') {
        const res = await axios.get('/company/plants');
        setPlants(res.data.data);
      }
      if (activeTab === 'locations') {
        const res = await axios.get('/master/warehouse');
        setWarehouses(res.data.data);
      }
      if (activeTab === 'zones') {
        const res = await axios.get('/master/storagelocation');
        setLocations(res.data.data);
      }
      if (activeTab === 'racks') {
        const res = await axios.get('/master/storagezone');
        setZones(res.data.data);
      }
      if (activeTab === 'bins') {
        const res = await axios.get('/master/rack');
        setRacks(res.data.data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = `/master/${activeTab === 'locations' ? 'storagelocation' : activeTab === 'zones' ? 'storagezone' : activeTab.slice(0, -1)}`;
      const res = await axios.get(endpoint);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = `/master/${activeTab === 'locations' ? 'storagelocation' : activeTab === 'zones' ? 'storagezone' : activeTab.slice(0, -1)}`;

      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, formData);
      } else {
        await axios.post(endpoint, formData);
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
      warehouseId: row.warehouseId?._id || row.warehouseId,
      storageLocationId: row.storageLocationId?._id || row.storageLocationId,
      zoneId: row.zoneId?._id || row.zoneId,
      rackId: row.rackId?._id || row.rackId
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    const currentActive = row.status === 'Active';
    if (currentActive && !window.confirm('Are you sure you want to deactivate this record?')) return;
    try {
      let endpoint = `/master/${activeTab === 'locations' ? 'storagelocation' : activeTab === 'zones' ? 'storagezone' : activeTab.slice(0, -1)}`;
      await axios.put(`${endpoint}/${row._id}`, { status: currentActive ? 'Inactive' : 'Active' });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const tabs = [
    { id: 'warehouses', label: 'Warehouses', icon: <Building size={18} /> },
    { id: 'locations', label: 'Storage Locations', icon: <Map size={18} /> },
    { id: 'zones', label: 'Storage Zones', icon: <Target size={18} /> },
    { id: 'racks', label: 'Racks', icon: <Layers size={18} /> },
    { id: 'bins', label: 'Bins', icon: <LayoutGrid size={18} /> },
  ];

  const getColumns = () => {
    const baseCols = [
      { header: 'Name', accessor: 'name' },
      { header: 'Code', accessor: 'code' }
    ];

    if (activeTab === 'warehouses') baseCols.push({ header: 'Plant', render: (row) => row.plantId?.name || '-' });
    if (activeTab === 'locations') baseCols.push({ header: 'Warehouse', render: (row) => row.warehouseId?.name || '-' });
    if (activeTab === 'zones') baseCols.push({ header: 'Storage Location', render: (row) => row.storageLocationId?.name || '-' });
    if (activeTab === 'racks') baseCols.push({ header: 'Zone', render: (row) => row.zoneId?.name || '-' });
    if (activeTab === 'bins') baseCols.push({ header: 'Rack', render: (row) => row.rackId?.name || '-' });

    baseCols.push({ header: 'Status', render: (row) => (
      <span style={{ 
        padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
        backgroundColor: row.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: row.status === 'Active' ? 'var(--accent-success)' : 'var(--accent-danger)' 
      }}>
        {row.status === 'Active' ? 'Active' : 'Inactive'}
      </span>
    )});

    return baseCols;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Warehouse Master Setup</h1>
        </div>
        <button className="btn btn-primary" onClick={() => {
          let codePrefix = '';
          switch (activeTab) {
            case 'warehouses': codePrefix = 'WRHS-'; break;
            case 'locations': codePrefix = 'LOC-'; break;
            case 'zones': codePrefix = 'ZN-'; break;
            case 'racks': codePrefix = 'RCK-'; break;
            case 'bins': codePrefix = 'BIN-'; break;
          }
          const code = codePrefix + Math.random().toString(36).substring(2, 8).toUpperCase();
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
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                backgroundColor: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
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
                title={row.status === 'Active' ? "Deactivate" : "Activate"} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: row.status === 'Active' ? 'var(--accent-danger)' : 'var(--accent-success)' }}
              >
                {row.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
              </button>
            )}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} ${activeTab.replace('locations', 'storage location').replace('zones', 'storage zone').replace(/s$/, '')}`}>
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Code</label>
            <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          
          {activeTab === 'warehouses' && (
            <div className="input-group">
              <label className="input-label">Select Plant</label>
              <select className="input-field" required value={formData.plantId || ''} onChange={e => setFormData({...formData, plantId: e.target.value})}>
                <option value="" disabled>Select Plant</option>
                {plants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="input-group">
              <label className="input-label">Select Warehouse</label>
              <select className="input-field" required value={formData.warehouseId || ''} onChange={e => setFormData({...formData, warehouseId: e.target.value})}>
                <option value="" disabled>Select Warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="input-group">
              <label className="input-label">Select Storage Location</label>
              <select className="input-field" required value={formData.storageLocationId || ''} onChange={e => setFormData({...formData, storageLocationId: e.target.value})}>
                <option value="" disabled>Select Storage Location</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'racks' && (
            <div className="input-group">
              <label className="input-label">Select Zone</label>
              <select className="input-field" required value={formData.zoneId || ''} onChange={e => setFormData({...formData, zoneId: e.target.value})}>
                <option value="" disabled>Select Zone</option>
                {zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'bins' && (
            <div className="input-group">
              <label className="input-label">Select Rack</label>
              <select className="input-field" required value={formData.rackId || ''} onChange={e => setFormData({...formData, rackId: e.target.value})}>
                <option value="" disabled>Select Rack</option>
                {racks.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
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

export default WarehouseMaster;

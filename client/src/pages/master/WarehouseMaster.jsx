import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, Map, Target, Layers, LayoutGrid } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const WarehouseMaster = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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
      if (activeTab === 'locations' || activeTab === 'zones') {
        const res = await axios.get('/company/warehouses');
        setWarehouses(res.data.data);
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
      let endpoint = '';
      if (activeTab === 'locations') endpoint = '/master/storagelocation';
      if (activeTab === 'zones') endpoint = '/master/storagezone';
      if (activeTab === 'racks') endpoint = '/master/rack';
      if (activeTab === 'bins') endpoint = '/master/bin';
      
      const res = await axios.get(endpoint);
      setData(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeTab === 'locations') endpoint = '/master/storagelocation';
      if (activeTab === 'zones') endpoint = '/master/storagezone';
      if (activeTab === 'racks') endpoint = '/master/rack';
      if (activeTab === 'bins') endpoint = '/master/bin';

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
      warehouseId: row.warehouseId?._id || row.warehouseId,
      zoneId: row.zoneId?._id || row.zoneId,
      rackId: row.rackId?._id || row.rackId
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const toggleStatus = async (row) => {
    try {
      let endpoint = '';
      if (activeTab === 'locations') endpoint = '/master/storagelocation';
      if (activeTab === 'zones') endpoint = '/master/storagezone';
      if (activeTab === 'racks') endpoint = '/master/rack';
      if (activeTab === 'bins') endpoint = '/master/bin';
      
      await axios.put(`${endpoint}/${row._id}`, { isActive: !row.isActive });
      fetchData();
    } catch (err) { alert('Error updating status'); }
  };

  const tabs = [
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

    if (activeTab === 'locations' || activeTab === 'zones') {
      baseCols.push({ header: 'Warehouse', render: (row) => row.warehouseId?.name || '-' });
    }
    if (activeTab === 'racks') {
      baseCols.push({ header: 'Zone', render: (row) => row.zoneId?.name || '-' });
    }
    if (activeTab === 'bins') {
      baseCols.push({ header: 'Rack', render: (row) => row.rackId?.name || '-' });
    }

    baseCols.push({ header: 'Status', render: (row) => (
      <span style={{ color: row.isActive ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
        {row.isActive ? 'Active' : 'Inactive'}
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
                fontSize: '13px', cursor: 'pointer'
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
                title={row.isActive ? "Deactivate" : "Activate"} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isActive ? 'var(--accent-danger)' : 'var(--accent-success)' }}
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
            <input type="text" className="input-field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Code</label>
            <input type="text" className="input-field" required readOnly value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          
          {(activeTab === 'locations' || activeTab === 'zones') && (
            <div className="input-group">
              <label className="input-label">Select Warehouse</label>
              <select className="input-field" required value={formData.warehouseId || ''} onChange={e => setFormData({...formData, warehouseId: e.target.value})}>
                <option value="" disabled>Select Warehouse</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
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

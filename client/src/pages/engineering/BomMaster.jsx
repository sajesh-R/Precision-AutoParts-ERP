import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ListTree, History, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const BomMaster = () => {
  const [activeTab, setActiveTab] = useState('boms');
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ components: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));
      
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const uomRes = await axios.get('/master/uom');
      setUoms(uomRes.data.data.filter(u => u.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/engineering/bom');
      setBoms(res.data.data);
    } catch (err) { console.error('BOM fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/engineering/bom/${editingId}`, formData);
      } else {
        await axios.post('/engineering/bom', formData);
      }
      setIsModalOpen(false);
      setFormData({ components: [] });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    // If it's a new version, we should ideally use the revision endpoint
    // For simplicity in this base view, we'll edit basic details
    const activeVersion = row.versions?.find(v => v.isActive) || row.versions?.[row.versions.length - 1];
    setFormData({ 
      productId: row.productId?._id || row.productId,
      bomNumber: row.bomNumber,
      description: row.description,
      components: activeVersion?.components || []
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [...(formData.components || []), { componentType: 'Material', quantity: 1, scrapPercentage: 0 }]
    });
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    setFormData({ ...formData, components: newComponents });
  };

  const removeComponent = (index) => {
    const newComponents = [...formData.components];
    newComponents.splice(index, 1);
    setFormData({ ...formData, components: newComponents });
  };

  const columns = [
    { header: 'BOM Number', accessor: 'bomNumber' },
    { header: 'Product', render: (row) => row.productId?.name || '-' },
    { header: 'Description', accessor: 'description' },
    { header: 'Versions', render: (row) => row.versions?.length || 0 },
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
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Bill of Materials (BOM)</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage Multi-Level BOMs and Versions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ components: [], bomNumber: 'BOM-' + Math.random().toString(36).substring(2, 8).toUpperCase() }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create BOM
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={columns} 
            data={boms} 
            isLoading={loading} 
            onEdit={handleEdit}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} BOM`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">BOM Number</label>
              <input type="text" className="input-field" required readOnly value={formData.bomNumber || ''} onChange={e => setFormData({...formData, bomNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Parent Product</label>
              <select className="input-field" required value={formData.productId || ''} onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="" disabled>Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {products.length === 0 && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
                  * Please create an active Product first in Master Data.
                </p>
              )}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input type="text" className="input-field" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* Component Definition Section */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Components</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addComponent}>
                + Add Component
              </button>
            </div>

            {formData.components?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                No components added. Click "+ Add Component" to build the BOM structure.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.components?.map((comp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select className="input-field" style={{ flex: 1 }} value={comp.componentType} onChange={e => updateComponent(idx, 'componentType', e.target.value)}>
                          <option value="Material">Raw Material</option>
                          <option value="Product">Sub-Assembly (Product)</option>
                        </select>

                        {comp.componentType === 'Material' ? (
                          <div style={{ flex: 2 }}>
                            <select className="input-field" style={{ width: '100%' }} required value={comp.materialId || ''} onChange={e => updateComponent(idx, 'materialId', e.target.value)}>
                              <option value="" disabled>Select Material</option>
                              {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                            </select>
                            {materials.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Create a Material first</p>}
                          </div>
                        ) : (
                          <div style={{ flex: 2 }}>
                            <select className="input-field" style={{ width: '100%' }} required value={comp.productId || ''} onChange={e => updateComponent(idx, 'productId', e.target.value)}>
                              <option value="" disabled>Select Sub-Assembly</option>
                              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            {products.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Create a Product first</p>}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <input type="number" placeholder="Qty" className="input-field" required min="0" step="any" value={comp.quantity || ''} onChange={e => updateComponent(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <select className="input-field" required value={comp.uomId || ''} onChange={e => updateComponent(idx, 'uomId', e.target.value)}>
                            <option value="" disabled>UOM</option>
                            {uoms.map(u => <option key={u._id} value={u._id}>{u.symbol}</option>)}
                          </select>
                          {uoms.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Missing UOM</p>}
                        </div>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <input type="number" placeholder="Scrap %" className="input-field" min="0" max="100" value={comp.scrapPercentage || 0} onChange={e => updateComponent(idx, 'scrapPercentage', parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                    </div>

                    <button type="button" onClick={() => removeComponent(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}>
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update BOM' : 'Create BOM (Draft)'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BomMaster;

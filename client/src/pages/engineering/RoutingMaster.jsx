import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const RoutingMaster = () => {
  const [routings, setRoutings] = useState([]);
  const [products, setProducts] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ operations: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const prodRes = await axios.get('/master/product');
      setProducts(prodRes.data.data.filter(p => p.lifecycleStatus === 'Active'));
      
      const wcRes = await axios.get('/master/workcenter');
      setWorkCenters(wcRes.data.data.filter(w => w.isActive));

      const machRes = await axios.get('/master/machine');
      setMachines(machRes.data.data.filter(m => m.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/engineering/routing');
      setRoutings(res.data.data);
    } catch (err) { console.error('Routing fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/engineering/routing/${editingId}`, formData);
      } else {
        await axios.post('/engineering/routing', formData);
      }
      setIsModalOpen(false);
      setFormData({ operations: [] });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (row) => {
    setFormData({ 
      productId: row.productId?._id || row.productId,
      routingNumber: row.routingNumber,
      description: row.description,
      operations: row.operations || []
    });
    setEditingId(row._id);
    setIsModalOpen(true);
  };

  const addOperation = () => {
    setFormData({
      ...formData,
      operations: [...(formData.operations || []), { 
        sequenceNumber: (formData.operations?.length || 0) * 10 + 10, 
        operationName: '', 
        workCenterId: '',
        standardTime: 0
      }]
    });
  };

  const updateOperation = (index, field, value) => {
    const newOps = [...formData.operations];
    newOps[index][field] = value;
    setFormData({ ...formData, operations: newOps });
  };

  const removeOperation = (index) => {
    const newOps = [...formData.operations];
    newOps.splice(index, 1);
    setFormData({ ...formData, operations: newOps });
  };

  const columns = [
    { header: 'Routing No', accessor: 'routingNumber' },
    { header: 'Product', render: (row) => row.productId?.name || '-' },
    { header: 'Operations', render: (row) => row.operations?.length || 0 },
    { header: 'Total Time (mins)', render: (row) => row.operations?.reduce((sum, op) => sum + (op.standardTime || 0), 0) || 0 },
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
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Routing Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Define Manufacturing Processes</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ operations: [] }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus size={14} /> Create Routing
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable 
            columns={columns} 
            data={routings} 
            isLoading={loading} 
            onEdit={handleEdit}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? 'Edit' : 'Create'} Routing`}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Routing Number</label>
              <input type="text" className="input-field" required value={formData.routingNumber || ''} onChange={e => setFormData({...formData, routingNumber: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Product</label>
              <select className="input-field" required value={formData.productId || ''} onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="" disabled>Select Product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {products.length === 0 && (
                <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '4px' }}>
                  * Please create an active Product first.
                </p>
              )}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Description</label>
            <input type="text" className="input-field" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* Operation Sequence Section */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Operation Sequence</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addOperation}>
                + Add Operation
              </button>
            </div>

            {formData.operations?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                No operations defined. Example: Raw Material Prep → Mixing → Pressing.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.operations?.map((op, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <input type="number" placeholder="Seq No" className="input-field" required value={op.sequenceNumber || ''} onChange={e => updateOperation(idx, 'sequenceNumber', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ margin: 0, flex: 3 }}>
                          <input type="text" placeholder="Operation Name (e.g. Grinding)" className="input-field" required value={op.operationName || ''} onChange={e => updateOperation(idx, 'operationName', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <select className="input-field" required value={op.workCenterId || ''} onChange={e => updateOperation(idx, 'workCenterId', e.target.value)}>
                            <option value="" disabled>Work Center</option>
                            {workCenters.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                          </select>
                          {workCenters.length === 0 && <p style={{ color: 'var(--accent-danger)', fontSize: '11px', marginTop: '2px' }}>* Missing Work Center</p>}
                        </div>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <select className="input-field" value={op.machineId || ''} onChange={e => updateOperation(idx, 'machineId', e.target.value)}>
                            <option value="">Machine (Optional)</option>
                            {machines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="input-group" style={{ margin: 0, flex: 1 }}>
                          <input type="number" placeholder="Standard Time (mins)" className="input-field" required min="0" step="any" value={op.standardTime || ''} onChange={e => updateOperation(idx, 'standardTime', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <button type="button" onClick={() => removeOperation(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}>
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Routing' : 'Save Routing'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoutingMaster;

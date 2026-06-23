import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, RefreshCw } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const OperatorManagement = () => {
  const [operators, setOperators] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const woRes = await axios.get('/production/wo');
      setWorkOrders(woRes.data.data.filter(wo => ['Released', 'In-Progress'].includes(wo.status)));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/shopfloor/operator');
      setOperators(res.data.data);
    } catch (err) { console.error('Operator fetch error', err); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`/shopfloor/operator/${formData._id}`, formData);
      } else {
        await axios.post('/shopfloor/operator', formData);
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving operator');
    }
  };

  const triggerProductivityCalc = async (id) => {
    try {
      await axios.put(`/shopfloor/operator/${id}`, { calculateProductivity: true });
      fetchData();
      alert('Productivity calculation triggered successfully!');
    } catch (err) { alert('Error calculating productivity'); }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => triggerProductivityCalc(row._id)} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={12} /> Calc Productivity
        </button>
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={12} /> Reassign
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'Operator', render: (row) => <strong>{row.operatorName}</strong> },
    { header: 'Emp ID', accessor: 'employeeId' },
    { header: 'Shift', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.shift === 'Night' ? '#6366f115' : row.shift === 'Evening' ? '#f59e0b15' : '#10b98115',
        color: row.shift === 'Night' ? '#6366f1' : row.shift === 'Evening' ? '#f59e0b' : '#10b981'
      }}>
        {row.shift}
      </span>
    )},
    { header: 'Active Work Order', render: (row) => row.workOrderId?.workOrderNumber || <span style={{ color: 'var(--text-secondary)' }}>Unassigned</span> },
    { header: 'Productivity Score', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${row.productivityScore}%`, backgroundColor: row.productivityScore > 85 ? '#10b981' : row.productivityScore > 75 ? '#f59e0b' : '#ef4444' }}></div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>{row.productivityScore}%</span>
      </div>
    )},
    { header: 'Assigned Date', render: (row) => new Date(row.assignedDate).toLocaleDateString() }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Operator Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Assign operators to shifts/WOs and track their productivity performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Users size={14} /> Assign Operator
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={operators} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData._id ? "Reassign Operator" : "Assign New Operator"}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Operator Name</label>
              <input type="text" className="input-field" required value={formData.operatorName || ''} onChange={e => setFormData({...formData, operatorName: e.target.value})} disabled={!!formData._id} />
            </div>
            <div className="input-group">
              <label className="input-label">Employee ID</label>
              <input type="text" className="input-field" required value={formData.employeeId || ''} onChange={e => setFormData({...formData, employeeId: e.target.value})} disabled={!!formData._id} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Shift Assignment</label>
              <select className="input-field" required value={formData.shift || ''} onChange={e => setFormData({...formData, shift: e.target.value})}>
                <option value="" disabled>Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Work Order Assignment</label>
              <select className="input-field" value={formData.workOrderId || ''} onChange={e => setFormData({...formData, workOrderId: e.target.value})}>
                <option value="">Unassigned</option>
                {workOrders.map(wo => <option key={wo._id} value={wo._id}>{wo.workOrderNumber}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Performance Notes</label>
            <textarea className="input-field" rows="2" value={formData.performanceNotes || ''} onChange={e => setFormData({...formData, performanceNotes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assignment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OperatorManagement;

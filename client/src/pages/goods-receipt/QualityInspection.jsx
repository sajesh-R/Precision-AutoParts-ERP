import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Microscope, Play, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const QualityInspection = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/receipt/inspection');
      setInspections(res.data.data);
    } catch (err) { console.error('Inspection fetch error', err); }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Validate totals locally
      const total = Number(formData.acceptedQuantity) + Number(formData.rejectedQuantity) + Number(formData.holdQuantity);
      if (total !== formData.inspectedQuantity && formData.inspectionStatus === 'Completed') {
        alert(`Warning: The sum of Accepted, Rejected, and Hold quantities (${total}) does not match the total Inspected quantity (${formData.inspectedQuantity}). Please verify before completing.`);
        return;
      }

      await axios.put(`/receipt/inspection/${formData._id}`, formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating inspection');
    }
  };

  const openInspectionModal = (row) => {
    setFormData({
      ...row,
      inspectorName: row.inspectorName === 'Unassigned' ? '' : row.inspectorName
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Ticket No', accessor: 'inspectionNumber' },
    { header: 'GRN Ref', render: (row) => row.grnId?.grnNumber || '-' },
    { header: 'Material', render: (row) => row.grnId?.materialId?.name || '-' },
    { header: 'Total Qty', render: (row) => <strong style={{ color: 'var(--text-primary)' }}>{row.inspectedQuantity}</strong> },
    { header: 'Accepted', render: (row) => <span style={{ color: '#10b981', fontWeight: 600 }}>{row.acceptedQuantity}</span> },
    { header: 'Rejected', render: (row) => <span style={{ color: '#ef4444', fontWeight: 600 }}>{row.rejectedQuantity}</span> },
    { header: 'Hold', render: (row) => <span style={{ color: '#f59e0b', fontWeight: 600 }}>{row.holdQuantity}</span> },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.inspectionStatus === 'Completed' ? '#10b98115' : row.inspectionStatus === 'Hold-Review' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.inspectionStatus === 'Completed' ? '#10b981' : row.inspectionStatus === 'Hold-Review' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.inspectionStatus}
      </span>
    )}
  ];

  const actionRenderer = (row) => {
    if (row.inspectionStatus !== 'Completed') {
      return (
        <button onClick={() => openInspectionModal(row)} title="Perform Inspection" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <Microscope size={14} /> Update
        </button>
      );
    }
    return (
      <span style={{ fontSize: '12px', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle size={14} /> Done
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Incoming Quality Inspection</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Evaluate received materials and record Acceptance/Rejection/Hold status</p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={inspections} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Inspection: ${formData.inspectionNumber}`}>
        <form onSubmit={handleUpdate}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <div><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Material:</span> <br/> <strong>{formData.grnId?.materialId?.name}</strong></div>
            <div><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vendor:</span> <br/> <strong>{formData.grnId?.vendorId?.name}</strong></div>
            <div><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Qty to Inspect:</span> <br/> <strong>{formData.inspectedQuantity}</strong></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ color: '#10b981' }}>Accepted Qty</label>
              <input type="number" className="input-field" required min="0" value={formData.acceptedQuantity || 0} onChange={e => setFormData({...formData, acceptedQuantity: parseInt(e.target.value)})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ color: '#ef4444' }}>Rejected Qty</label>
              <input type="number" className="input-field" required min="0" value={formData.rejectedQuantity || 0} onChange={e => setFormData({...formData, rejectedQuantity: parseInt(e.target.value)})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ color: '#f59e0b' }}>Hold Qty</label>
              <input type="number" className="input-field" required min="0" value={formData.holdQuantity || 0} onChange={e => setFormData({...formData, holdQuantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Inspector Name</label>
              <input type="text" className="input-field" required value={formData.inspectorName || ''} onChange={e => setFormData({...formData, inspectorName: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Inspection Status</label>
              <select className="input-field" required value={formData.inspectionStatus || ''} onChange={e => setFormData({...formData, inspectionStatus: e.target.value})}>
                <option value="In-Progress">In-Progress</option>
                <option value="Hold-Review">Hold-Review (Needs Management Approval)</option>
                <option value="Completed">Completed (Ready for Inventory)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Remarks / Rejection Reasons</label>
            <textarea className="input-field" rows="2" value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Inspection Details</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QualityInspection;

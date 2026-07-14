import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const DeliveryTracking = () => {
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking'); // tracking, confirmation
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
    setIsModalOpen(false);
    setFormData({});
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/dispatch/tracking');
      setTrackings(res.data.data);
    } catch (err) { console.error('Data fetch error', err); }
    setLoading(false);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const newStatusUpdate = {
        location: formData.newLocation,
        status: formData.newStatus,
        remarks: formData.newRemarks
      };
      await axios.put(`/dispatch/tracking/${formData._id}`, { newStatusUpdate });
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating tracking status');
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/dispatch/tracking/${formData._id}/confirm`, {
        receiverName: formData.receiverName,
        receiverContact: formData.receiverContact,
        proofNotes: formData.proofNotes
      });
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming delivery');
    }
  };

  const actionRenderer = (row) => {
    if (activeTab === 'tracking') {
      return (
        <button onClick={() => { setFormData({ ...row, newLocation: '', newStatus: '', newRemarks: '' }); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Navigation size={12} /> Update Status
        </button>
      );
    } else {
      return row.overallStatus !== 'Delivered' ? (
        <button onClick={() => { setFormData(row); setIsModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={12} /> Confirm Delivery
        </button>
      ) : <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Delivered</span>;
    }
  };

  const trackingColumns = [
    { header: 'Tracking #', accessor: 'trackingNumber' },
    { header: 'Sales Order', render: (row) => row.dispatchExecutionId?.dispatchPlanId?.salesOrderId?.orderNumber || '-' },
    { header: 'Customer', render: (row) => row.dispatchExecutionId?.dispatchPlanId?.salesOrderId?.customerName || '-' },
    { header: 'Current Location', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={12} color="var(--text-secondary)" /> {row.currentLocation}
      </div>
    )},
    { header: 'Status', render: (row) => {
      let bg = 'var(--bg-tertiary)';
      let color = 'var(--text-secondary)';
      if (row.overallStatus === 'Delivered') { bg = '#10b98115'; color = '#10b981'; }
      else if (['In-Transit', 'At Hub', 'Out for Delivery'].includes(row.overallStatus)) { bg = '#3b82f615'; color = '#3b82f6'; }
      else if (row.overallStatus === 'Exception') { bg = '#ef444415'; color = '#ef4444'; }
      
      return (
        <span style={{ 
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
          backgroundColor: bg,
          color: color
        }}>
          {row.overallStatus}
        </span>
      );
    }},
    { header: 'Last Update', render: (row) => new Date(row.updatedAt).toLocaleString() }
  ];

  const deliveryColumns = [
    ...trackingColumns.slice(0, 3),
    { header: 'Delivery Status', render: (row) => row.deliveryConfirmation?.isDelivered ? 'Delivered' : 'Pending' },
    { header: 'Delivered Date', render: (row) => row.deliveryConfirmation?.deliveredDate ? new Date(row.deliveryConfirmation.deliveredDate).toLocaleString() : '-' },
    { header: 'Receiver Name', render: (row) => row.deliveryConfirmation?.receiverName || '-' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Delivery Tracking</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitor shipment progress and record final delivery confirmation</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('tracking')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'tracking' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'tracking' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Navigation size={16} /> Shipment Tracking
        </button>
        <button 
          onClick={() => setActiveTab('confirmation')}
          style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'confirmation' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'confirmation' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle size={16} /> Delivery Confirmation
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={activeTab === 'tracking' ? trackingColumns : deliveryColumns} data={trackings} isLoading={loading} customActions={actionRenderer} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={activeTab === 'tracking' ? "Update Tracking Status" : "Confirm Delivery"}>
        <form onSubmit={activeTab === 'tracking' ? handleUpdateStatus : handleConfirmDelivery}>
          
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px' }}>
            <strong>Tracking #:</strong> {formData.trackingNumber} <br />
            <strong>Current Location:</strong> {formData.currentLocation}
          </div>

          {activeTab === 'tracking' ? (
            <>
              <div className="input-group">
                <label className="input-label">New Location</label>
                <input type="text" className="input-field" required value={formData.newLocation || ''} onChange={e => setFormData({...formData, newLocation: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Status Update</label>
                <select className="input-field" required value={formData.newStatus || ''} onChange={e => setFormData({...formData, newStatus: e.target.value})}>
                  <option value="">Select Status...</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="At Hub">At Hub</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Exception">Exception</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Remarks</label>
                <textarea className="input-field" rows="2" value={formData.newRemarks || ''} onChange={e => setFormData({...formData, newRemarks: e.target.value})}></textarea>
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">Receiver Name</label>
                <input type="text" className="input-field" required value={formData.receiverName || ''} onChange={e => setFormData({...formData, receiverName: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Receiver Contact</label>
                <input type="text" className="input-field" required value={formData.receiverContact || ''} onChange={e => setFormData({...formData, receiverContact: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Proof / Notes</label>
                <textarea className="input-field" rows="2" value={formData.proofNotes || ''} onChange={e => setFormData({...formData, proofNotes: e.target.value})}></textarea>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{activeTab === 'tracking' ? 'Save Update' : 'Confirm Delivery'}</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DeliveryTracking;

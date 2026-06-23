import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Send } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const RFQManagement = () => {
  const [rfqs, setRfqs] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [quoteData, setQuoteData] = useState({});
  const [selectedRfq, setSelectedRfq] = useState(null);

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data.filter(m => m.isActive));

      const reqRes = await axios.get('/procurement/requisition');
      setRequisitions(reqRes.data.data.filter(r => r.status === 'Approved'));

      const venRes = await axios.get('/master/vendor');
      setVendors(venRes.data.data.filter(v => v.isActive));
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/procurement/rfq');
      setRfqs(res.data.data);
    } catch (err) { console.error('RFQ fetch error', err); }
    setLoading(false);
  };

  const handleSaveRFQ = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/procurement/rfq', formData);
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving RFQ');
    }
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/procurement/rfq/${selectedRfq._id}/quotation`, quoteData);
      setIsQuoteModalOpen(false);
      setQuoteData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving quote');
    }
  };

  const handleSelectQuote = async (rfqId, quoteId) => {
    try {
      await axios.put(`/procurement/rfq/${rfqId}/quotation/${quoteId}/select`);
      fetchData();
    } catch (err) { alert('Error selecting quote'); }
  };

  const handleRequisitionSelect = (e) => {
    const reqId = e.target.value;
    const req = requisitions.find(r => r._id === reqId);
    if (req) {
      setFormData({
        ...formData,
        requisitionId: reqId,
        materialId: req.materialId?._id || req.materialId,
        quantity: req.requestedQuantity
      });
    } else {
      setFormData({ ...formData, requisitionId: '' });
    }
  };

  const columns = [
    { header: 'RFQ Number', accessor: 'rfqNumber' },
    { header: 'Due Date', render: (row) => new Date(row.dueDate).toLocaleDateString() },
    { header: 'Material', render: (row) => row.materialId?.name || '-' },
    { header: 'Qty', accessor: 'quantity' },
    { header: 'Invited Vendors', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Users size={12} color="var(--text-secondary)" /> {row.invitedVendors.length}
      </div>
    )},
    { header: 'Quotes Received', render: (row) => row.receivedQuotations.length },
    { header: 'Status', render: (row) => (
      <span style={{ 
        padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
        backgroundColor: row.status === 'Closed' ? '#10b98115' : row.status === 'Comparing' ? '#f59e0b15' : 'var(--bg-tertiary)',
        color: row.status === 'Closed' ? '#10b981' : row.status === 'Comparing' ? '#f59e0b' : 'var(--text-secondary)'
      }}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Request for Quotation (RFQ)</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Manage vendor invitations and compare quotes</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }}>
          <Plus size={14} /> Create RFQ
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* RFQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', fontSize: '13px', fontWeight: 600 }}>
            Active RFQs
          </div>
          <div style={{ padding: '8px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
            <DataTable 
              columns={columns} 
              data={rfqs} 
              isLoading={loading} 
              onEdit={() => {}} 
              customActions={(row) => (
                <button onClick={() => setSelectedRfq(row)} title="View Quotes" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', marginLeft: '8px' }}>
                  <Send size={14} />
                </button>
              )}
            />
          </div>
        </div>

        {/* Quotation Comparison Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Quotation Comparison {selectedRfq && `(${selectedRfq.rfqNumber})`}</span>
            {selectedRfq && selectedRfq.status !== 'Closed' && (
              <button className="btn" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => { setQuoteData({ vendorId: '' }); setIsQuoteModalOpen(true); }}>
                + Add Quote
              </button>
            )}
          </div>
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
            {!selectedRfq ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '32px' }}>
                Select an RFQ to view and compare quotations.
              </div>
            ) : selectedRfq.receivedQuotations.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '32px' }}>
                No quotations received yet for this RFQ.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedRfq.receivedQuotations.map(quote => (
                  <div key={quote._id} style={{ 
                    padding: '12px', border: `1px solid ${quote.selected ? 'var(--accent-success)' : 'var(--border-color)'}`, borderRadius: '6px', 
                    backgroundColor: quote.selected ? '#10b98105' : 'var(--bg-secondary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{quote.vendorId?.name || 'Vendor'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                        <span>Amount: <strong style={{ color: 'var(--text-primary)' }}>${quote.quoteAmount.toFixed(2)}</strong></span>
                        <span>Lead Time: <strong style={{ color: 'var(--text-primary)' }}>{quote.leadTimeDays} Days</strong></span>
                      </div>
                      {quote.notes && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>"{quote.notes}"</div>}
                    </div>
                    {selectedRfq.status !== 'Closed' && !quote.selected && (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleSelectQuote(selectedRfq._id, quote._id)}>
                        Select Winner
                      </button>
                    )}
                    {quote.selected && <span style={{ color: 'var(--accent-success)', fontSize: '12px', fontWeight: 600 }}>WINNING QUOTE</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RFQ Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create RFQ">
        <form onSubmit={handleSaveRFQ}>
          <div className="input-group">
            <label className="input-label">Pull from Approved Requisition (Optional)</label>
            <select className="input-field" value={formData.requisitionId || ''} onChange={handleRequisitionSelect}>
              <option value="">-- Manual Entry --</option>
              {requisitions.map(r => <option key={r._id} value={r._id}>{r.requisitionNumber} - {r.materialId?.name} (Qty: {r.requestedQuantity})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Material</label>
              <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})} disabled={!!formData.requisitionId}>
                <option value="" disabled>Select Material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Quantity required</label>
              <input type="number" className="input-field" required min="1" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} disabled={!!formData.requisitionId} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Submission Due Date</label>
            <input type="date" className="input-field" required value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Invite Vendors (Select one for now to simulate multi-select)</label>
            <select className="input-field" required onChange={e => setFormData({...formData, invitedVendors: [{ vendorId: e.target.value }]})}>
              <option value="" disabled selected>Select Vendor to Invite</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Send RFQ</button>
          </div>
        </form>
      </Modal>

      {/* Quote Modal */}
      <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} title="Record Vendor Quote">
        <form onSubmit={handleSaveQuote}>
          <div className="input-group">
            <label className="input-label">Vendor</label>
            <select className="input-field" required value={quoteData.vendorId || ''} onChange={e => setQuoteData({...quoteData, vendorId: e.target.value})}>
              <option value="" disabled>Select Vendor</option>
              {selectedRfq?.invitedVendors.map(v => <option key={v.vendorId._id} value={v.vendorId._id}>{v.vendorId.name}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Quote Amount ($)</label>
              <input type="number" className="input-field" required min="0" step="0.01" value={quoteData.quoteAmount || ''} onChange={e => setQuoteData({...quoteData, quoteAmount: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Lead Time (Days)</label>
              <input type="number" className="input-field" required min="1" value={quoteData.leadTimeDays || ''} onChange={e => setQuoteData({...quoteData, leadTimeDays: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes/Terms</label>
            <textarea className="input-field" rows="2" value={quoteData.notes || ''} onChange={e => setQuoteData({...quoteData, notes: e.target.value})}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsQuoteModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Quote</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default RFQManagement;

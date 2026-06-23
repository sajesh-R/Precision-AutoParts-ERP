import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ruler, Scale, Target, ActivitySquare } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const QualityParameters = () => {
  const [parameters, setParameters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isDefModalOpen, setIsDefModalOpen] = useState(false);
  const [isMeasModalOpen, setIsMeasModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [measData, setMeasData] = useState({});

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const fetchDependencies = async () => {
    try {
      const matRes = await axios.get('/master/material');
      setMaterials(matRes.data.data);
    } catch (err) { console.error('Dependencies fetch error', err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/quality/parameter');
      setParameters(res.data.data);
    } catch (err) { console.error('Parameter fetch error', err); }
    setLoading(false);
  };

  const handleSaveDef = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/quality/parameter', formData);
      setIsDefModalOpen(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error defining parameter');
    }
  };

  const handleSaveMeasurement = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/quality/parameter/${measData.paramId}/measurement`, { value: measData.value });
      setIsMeasModalOpen(false);
      setMeasData({});
      fetchData();
      alert(res.data.pass ? 'Measurement PASSED tolerance check.' : 'Measurement FAILED tolerance check.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording measurement');
    }
  };

  const actionRenderer = (row) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => { setMeasData({ paramId: row._id }); setIsMeasModalOpen(true); }} className="btn-icon" style={{ fontSize: '11px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ActivitySquare size={12} /> Log Measurement
        </button>
      </div>
    );
  };

  const columns = [
    { header: 'Material / Product', render: (row) => <strong>{row.materialId?.name} ({row.materialId?.code})</strong> },
    { header: 'Parameter', render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {row.parameterType === 'Weight' ? <Scale size={14} /> : row.parameterType === 'Dimensions' ? <Ruler size={14} /> : <Target size={14} />}
        {row.parameterType}
      </span>
    )},
    { header: 'Standard Target', render: (row) => <strong>{row.standardValue}</strong> },
    { header: 'Tolerances (+/-)', render: (row) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+{row.tolerancePlus} / -{row.toleranceMinus}</span> },
    { header: 'Total Readings', render: (row) => `${row.recordedMeasurements?.length || 0} Records` },
    { header: 'Latest Result', render: (row) => {
      if (!row.recordedMeasurements || row.recordedMeasurements.length === 0) return '-';
      const last = row.recordedMeasurements[row.recordedMeasurements.length - 1];
      return <span style={{ color: last.pass ? '#10b981' : '#ef4444', fontWeight: 600 }}>{last.value} ({last.pass ? 'PASS' : 'FAIL'})</span>;
    }}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Quality Parameters</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Define physical specifications and dynamically validate shop floor measurements against standard tolerances</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({}); setIsDefModalOpen(true); }}>
          <Target size={14} /> Define Standard
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <DataTable columns={columns} data={parameters} isLoading={loading} onEdit={() => {}} customActions={actionRenderer} />
        </div>
      </div>

      {/* Define Standard Modal */}
      <Modal isOpen={isDefModalOpen} onClose={() => setIsDefModalOpen(false)} title="Define Quality Standard">
        <form onSubmit={handleSaveDef}>
          <div className="input-group">
            <label className="input-label">Target Material / Finished Good</label>
            <select className="input-field" required value={formData.materialId || ''} onChange={e => setFormData({...formData, materialId: e.target.value})}>
              <option value="" disabled>Select Material</option>
              {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.code})</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Physical Parameter</label>
              <select className="input-field" required value={formData.parameterType || ''} onChange={e => setFormData({...formData, parameterType: e.target.value})}>
                <option value="" disabled>Select Parameter</option>
                <option value="Thickness">Thickness</option>
                <option value="Hardness">Hardness</option>
                <option value="Weight">Weight</option>
                <option value="Dimensions">Dimensions</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Target Standard Value</label>
              <input type="number" step="0.001" className="input-field" required value={formData.standardValue || ''} onChange={e => setFormData({...formData, standardValue: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Acceptable Tolerance (+)</label>
              <input type="number" step="0.001" className="input-field" required value={formData.tolerancePlus || ''} onChange={e => setFormData({...formData, tolerancePlus: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label className="input-label">Acceptable Tolerance (-)</label>
              <input type="number" step="0.001" className="input-field" required value={formData.toleranceMinus || ''} onChange={e => setFormData({...formData, toleranceMinus: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDefModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Standard</button>
          </div>
        </form>
      </Modal>

      {/* Log Measurement Modal */}
      <Modal isOpen={isMeasModalOpen} onClose={() => setIsMeasModalOpen(false)} title="Log Quality Measurement">
        <form onSubmit={handleSaveMeasurement}>
          <div className="input-group">
            <label className="input-label">Actual Measurement Value</label>
            <input type="number" step="0.001" className="input-field" required value={measData.value || ''} onChange={e => setMeasData({...measData, value: parseFloat(e.target.value)})} />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>The system will automatically validate this reading against the predefined tolerances.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMeasModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Validate Reading</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QualityParameters;

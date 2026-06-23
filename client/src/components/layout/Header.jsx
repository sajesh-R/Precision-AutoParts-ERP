import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Moon, LogOut, KeyRound } from 'lucide-react';
import Modal from '../common/Modal';
import axios from 'axios';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPassError('New passwords do not match');
    }

    setLoading(true);
    try {
      await axios.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPassMessage('Password changed successfully');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassMessage('');
      }, 2000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Error changing password');
    }
    setLoading(false);
  };

  return (
    <>
      <header style={{
        height: '40px', /* Compact Native Toolbar */
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        backgroundColor: 'var(--bg-secondary)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {/* Left side spacer / contextual breadcrumbs could go here */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
           {/* Application title or context */}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '2px' }}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>[{user?.role?.name || user?.role || 'User'}]</span>
            </div>

            <button onClick={() => setIsPasswordModalOpen(true)} title="Change Password" style={{ background: 'none', color: 'var(--text-secondary)', padding: '2px', marginLeft: '4px' }}>
              <KeyRound size={14} />
            </button>

            <button onClick={logout} title="Logout" style={{ background: 'none', color: 'var(--accent-danger)', padding: '2px' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        {passError && <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-danger)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '12px' }}>{passError}</div>}
        {passMessage && <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-success)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '12px' }}>{passMessage}</div>}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <input type="password" className="input-field" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input type="password" className="input-field" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input type="password" className="input-field" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Header;

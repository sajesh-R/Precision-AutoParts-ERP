import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'mfa', 'forcePassword'
  const [message, setMessage] = useState('');
  
  const [tempToken, setTempToken] = useState('');
  
  const { login, setSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/auth/login', { email, password });
      
      if (res.data.requirePasswordChange) {
        setTempToken(res.data.tempToken);
        setMode('forcePassword');
        setMessage('Your password has expired. You must change it to continue.');

      } else {
        setSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Check your email for reset instructions.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset link.');
    }
    
    setLoading(false);
  };


  const handleForcePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const res = await axios.post('/auth/force-update-password', {
        tempToken,
        currentPassword: password,
        newPassword
      });
      setSession(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        padding: '32px 24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Precision Auto Parts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
            {mode === 'login' && 'Secure Enterprise Authentication'}
            {mode === 'forgot' && 'Password Recovery'}

          </p>
        </div>

        {error && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-danger)',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-success)',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            {message}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="input-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '11px', cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '8px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                className="input-field"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '8px' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button 
              type="button" 
              onClick={() => { setMode('login'); setMessage(''); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
            >
              Back to Login
            </button>
          </form>
        ) : mode === 'forcePassword' ? (
          <form onSubmit={handleForcePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="input-field"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '8px' }}
            >
              {loading ? 'Updating...' : 'Update Password & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => { setMode('login'); setMessage(''); setError(''); setPassword(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
            >
              Cancel
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default Login;

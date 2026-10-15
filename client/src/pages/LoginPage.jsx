import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'devotee' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Database status
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'error' | 'checking'

  // If already logged in, redirect to role home
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Check database health on load
  useEffect(() => {
    let isMounted = true;
    axios.get('/api/health')
      .then(res => {
        if (isMounted) {
          if (res.data.status === 'ok') setDbStatus('connected');
          else setDbStatus('error');
        }
      })
      .catch(() => {
        if (isMounted) setDbStatus('error');
      });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e, customPhone, customPass) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetPhone = customPhone || form.phone;
    const targetPass = customPass || form.password;

    try {
      if (mode === 'login') {
        await login(targetPhone, targetPass);
      } else {
        await register(form.name, targetPhone, targetPass, form.role);
      }
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Auth submit error:', err);
      const msg = err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (phone, password) => {
    setMode('login');
    setForm((prev) => ({ ...prev, phone, password }));
    handleSubmit(null, phone, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem 2rem',
        boxSizing: 'border-box'
      }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(245, 158, 11, 0.2))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '1.75rem',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }}>
            🛕
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.1rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem 0'
          }}>
            DarshanQ
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Smart Temple Queue & Token Management
          </p>
        </div>

        {/* Database Connection Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '20px',
          background: dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.12)' : dbStatus === 'error' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${dbStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : dbStatus === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: dbStatus === 'connected' ? '#34d399' : dbStatus === 'error' ? '#f87171' : '#9ca3af'
        }}>
          {dbStatus === 'connected' && <span className="pulse-dot" />}
          {dbStatus === 'connected' ? 'Supabase PostgreSQL Database Connected' : dbStatus === 'error' ? '❌ Supabase DB Offline / Connecting...' : '⏳ Connecting to Supabase DB...'}
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(10, 8, 20, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: '9px',
              background: mode === 'login' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: mode === 'login' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: '9px',
              background: mode === 'register' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: mode === 'register' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="custom-input"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 9000000001"
              className="custom-input"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="custom-input"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.2rem'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Account Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="custom-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="devotee" style={{ background: '#161224', color: '#fff' }}>🙏 Devotee (Public Access)</option>
                <option value="staff" style={{ background: '#161224', color: '#fff' }}>🛡️ Staff (Checkpoint Operator)</option>
                <option value="admin" style={{ background: '#161224', color: '#fff' }}>👑 Admin (Temple Manager)</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#fda4af',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <>
                <span className="pulse-dot" style={{ background: '#fff' }} />
                Verifying Credentials...
              </>
            ) : mode === 'login' ? (
              'Sign In →'
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        {/* Interactive 1-Click Demo Login Badges */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>⚡ 1-Click Demo Login</span>
            <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>Select role to test</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoLogin('9000000001', 'admin123')}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a' }}>👑 Admin Portal</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: 9000000001 | Pass: admin123</div>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#fcd34d', fontWeight: 600 }}>
                Login →
              </span>
            </button>

            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoLogin('9000000002', 'staff123')}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>🛡️ Staff Gate Panel</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: 9000000002 | Pass: staff123</div>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#60a5fa', fontWeight: 600 }}>
                Login →
              </span>
            </button>

            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoLogin('9000000004', 'devotee123')}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a7f3d0' }}>🙏 Devotee Portal</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: 9000000004 | Pass: devotee123</div>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', color: '#34d399', fontWeight: 600 }}>
                Login →
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

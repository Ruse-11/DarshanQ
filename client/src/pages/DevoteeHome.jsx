import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socket from '../lib/socket';
import TempleFlowMap from '../components/TempleFlowMap';

export default function DevoteeHome() {
  const { user, logout, token } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedGateId, setSelectedGateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [approachingAlert, setApproachingAlert] = useState(null);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch devotee's current active token and checkpoints
  const fetchActiveTokenAndCheckpoints = async () => {
    try {
      setLoading(true);
      const [tokenRes, cpRes] = await Promise.all([
        axios.get('/api/tokens/active', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/checkpoints', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setActiveToken(tokenRes.data.token);
      setCheckpoints(cpRes.data.checkpoints || []);
    } catch (err) {
      console.error('Failed to load devotee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTokenAndCheckpoints();
  }, [token]);

  // Wire up Socket.IO realtime connection
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) socket.connect();

    if (activeToken?.temple_id) {
      socket.emit('join:temple', { temple_id: activeToken.temple_id });
    }
    socket.emit('join:user', { user_id: user.id });

    // Handle live wait-time updates
    const handleQueueUpdate = (data) => {
      setActiveToken((prev) => {
        if (!prev) return prev;
        if (prev.id === data.token_id || prev.token_number === data.token_number) {
          return {
            ...prev,
            estimated_wait_minutes: data.estimated_wait_minutes,
            tokens_ahead: data.tokens_ahead,
            scan_rate: data.scan_rate || prev.scan_rate,
          };
        }
        return prev;
      });
    };

    // Handle approaching alert
    const handleApproaching = (data) => {
      if (data.user_id === user.id || data.token_id === activeToken?.id) {
        setApproachingAlert(data.message);
      }
    };

    // Handle density update
    const handleDensityUpdate = (data) => {
      setCheckpoints((prev) =>
        prev.map((cp) =>
          (cp.id === data.checkpoint_id || cp.checkpoint_id === data.checkpoint_id)
            ? { ...cp, density_level: data.density_level, people_waiting: data.people_waiting, scan_rate: data.scan_rate }
            : cp
        )
      );
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:approaching', handleApproaching);
    socket.on('density:update', handleDensityUpdate);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:approaching', handleApproaching);
      socket.off('density:update', handleDensityUpdate);
    };
  }, [user, activeToken?.id, activeToken?.temple_id]);

  // Book a new virtual token
  const handleBookToken = async () => {
    setError('');
    setBookingLoading(true);
    try {
      const payload = selectedGateId ? { gate_id: selectedGateId } : {};
      const res = await axios.post('/api/tokens', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveToken(res.data.token);
      if (res.data.token?.temple_id) {
        socket.emit('join:temple', { temple_id: res.data.token.temple_id });
      }
      fetchActiveTokenAndCheckpoints();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book virtual token.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel token
  const handleCancelToken = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue token?')) return;
    try {
      await axios.patch(
        `/api/tokens/${activeToken.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveToken(null);
      setApproachingAlert(null);
      fetchActiveTokenAndCheckpoints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel token');
    }
  };

  const gateOptions = checkpoints.filter((cp) => cp.checkpoint_type === 'gate' || cp.sequence_order === 1);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Top Navbar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🛕</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>DarshanQ — Devotee Portal</h2>
            <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
              <span className="pulse-dot" /> Live Queue Connected
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Welcome, <strong style={{ color: '#fff' }}>{user?.name}</strong>
          </span>
          <button
            onClick={logout}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Approaching Gate Urgent Alert */}
      {approachingAlert && (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))',
            borderColor: 'rgba(245, 158, 11, 0.5)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#fef08a', fontSize: '1.05rem' }}>Attention Devotee!</div>
            <div style={{ color: '#fde68a', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {approachingAlert}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span className="pulse-dot" style={{ width: '12px', height: '12px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Checking queue status...</p>
        </div>
      ) : activeToken ? (
        /* ACTIVE TOKEN DASHBOARD */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              🎟️ Virtual Darshan Pass Active
            </div>

            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
              {activeToken.temple_name || 'Sri Venkateswara Temple, Tirupati'}
            </h3>

            {/* Huge Token Number Display */}
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Token Number
              </div>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, #a78bfa 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                #{activeToken.token_number}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.825rem', fontWeight: 600 }}>
                <span className="pulse-dot" /> Current Status: {activeToken.status.toUpperCase()}
              </div>
            </div>

            {/* Devotee Code & Telegram Bot Integration */}
            {activeToken.devotee_code && (
              <div
                style={{
                  margin: '1.25rem auto 1.5rem',
                  padding: '1.25rem 1.75rem',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '16px',
                  maxWidth: '520px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                  Devotee Tracking Code
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '2.4rem',
                      fontWeight: 900,
                      color: '#38bdf8',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {activeToken.devotee_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeToken.devotee_code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="Copy Devotee Code"
                    style={{
                      background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: copied ? '#4ade80' : '#38bdf8',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <p style={{ margin: '0.75rem 0 0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                  Message this code to our Telegram bot for live updates
                </p>
                <a
                  href={`https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'DarshanQ_bot'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    padding: '0.55rem 1.35rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  <span>✈️</span> Message @{import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'DarshanQ_bot'}
                </a>
              </div>
            )}

            {/* Assigned Gate & Queue Route Tracker */}
            <div style={{ background: 'rgba(10, 8, 20, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.25rem', borderRadius: '14px', margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>🚪</span> {activeToken.checkpoint_name || 'Gate 1'}
              </div>
              <span style={{ color: 'var(--text-dim)' }}>➔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>🛡️</span> {activeToken.next_checkpoint_name || 'Checkpoint'}
              </div>
              <span style={{ color: 'var(--text-dim)' }}>➔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fcd34d', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>🛕</span> Sanctum Sanctorum
              </div>
            </div>

            {/* Wait Time & Explainability Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
              <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Estimated Wait
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fef08a', marginTop: '0.25rem' }}>
                  ~{activeToken.estimated_wait_minutes ?? 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>mins</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a3e635', marginTop: '0.2rem' }}>⚡ Real-time dynamic estimate</div>
              </div>

              <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Devotees Ahead
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
                  {activeToken.tokens_ahead ?? 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>people</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>In front of you in queue</div>
              </div>

              <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Your Current Station
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f472b6', marginTop: '0.5rem' }}>
                  {activeToken.checkpoint_name || 'Gate 1 (Entry)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Proceed here when called</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {showMap ? 'Hide Temple Map' : '🗺️ View Live Temple Flow Map'}
              </button>

              <button
                type="button"
                onClick={handleCancelToken}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fda4af',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel Token
              </button>
            </div>
          </div>

          {/* Show Temple Map for Devotee with active location highlighted */}
          {showMap && (
            <TempleFlowMap
              checkpoints={checkpoints}
              activeTokenCheckpointId={activeToken.current_checkpoint_id}
            />
          )}
        </div>
      ) : (
        /* NO ACTIVE TOKEN — BOOKING UI */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>
              Book Your Virtual Darshan Token
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
              Select an entry gate or let our smart queue engine auto-assign the gate with the shortest wait time!
            </p>

            {/* Select Entry Gate */}
            {gateOptions.length > 0 && (
              <div style={{ maxWidth: '380px', margin: '0 auto 1.5rem auto', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Select Entry Gate (Optional)
                </label>
                <select
                  value={selectedGateId}
                  onChange={(e) => setSelectedGateId(e.target.value)}
                  className="custom-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" style={{ background: '#161224', color: '#fff' }}>
                    ⚡ Auto-balance (Fastest Available Gate)
                  </option>
                  {gateOptions.map((g) => (
                    <option key={g.id} value={g.id} style={{ background: '#161224', color: '#fff' }}>
                      🚪 {g.name} ({g.people_waiting || 0} waiting)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '10px', padding: '0.75rem', color: '#fda4af', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleBookToken}
              disabled={bookingLoading}
              className="btn-primary"
              style={{ maxWidth: '340px', margin: '0 auto' }}
            >
              {bookingLoading ? 'Issuing Token...' : '⚡ Get Virtual Token Now →'}
            </button>
          </div>

          {/* Temple Map Preview */}
          <TempleFlowMap checkpoints={checkpoints} />
        </div>
      )}
    </div>
  );
}

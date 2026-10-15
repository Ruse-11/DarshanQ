import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socket from '../lib/socket';
import TempleFlowMap from '../components/TempleFlowMap';

export default function StaffPanel() {
  const { user, logout, token } = useAuth();
  const [checkpoints, setCheckpoints] = useState([]);
  const [activeModalCp, setActiveModalCp] = useState(null); // The checkpoint currently opened in scan modal
  const [manualTokenId, setManualTokenId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Walk-in Quick Add State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinGateId, setWalkinGateId] = useState('');
  const [walkinLoading, setWalkinLoading] = useState(false);
  const [walkinError, setWalkinError] = useState('');
  const [createdDevoteeToken, setCreatedDevoteeToken] = useState(null);
  const [walkinCopied, setWalkinCopied] = useState(false);

  // Fetch checkpoints with live density
  const fetchCheckpoints = async () => {
    try {
      const res = await axios.get('/api/checkpoints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.checkpoints || [];
      setCheckpoints(list);
    } catch (err) {
      console.error('Failed to load checkpoints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  }, [token]);

  // Keep active modal checkpoint in sync when live updates come in
  useEffect(() => {
    if (activeModalCp) {
      const updated = checkpoints.find(
        (c) => (c.id || c.checkpoint_id) === (activeModalCp.id || activeModalCp.checkpoint_id)
      );
      if (updated) {
        setActiveModalCp((prev) => ({ ...prev, ...updated }));
      }
    }
  }, [checkpoints]);

  // Socket.IO realtime connection
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleDensityUpdate = (data) => {
      setCheckpoints((prev) =>
        prev.map((cp) =>
          (cp.id === data.checkpoint_id || cp.checkpoint_id === data.checkpoint_id)
            ? { ...cp, density_level: data.density_level, people_waiting: data.people_waiting, scan_rate: data.scan_rate }
            : cp
        )
      );
    };

    socket.on('density:update', handleDensityUpdate);

    return () => {
      socket.off('density:update', handleDensityUpdate);
    };
  }, []);

  // When staff clicks any node on the map, open the Scan Action Modal!
  const handleNodeClick = (cpId) => {
    const cp = checkpoints.find((c) => (c.id || c.checkpoint_id) === cpId);
    if (cp) {
      setActiveModalCp(cp);
      setScanMessage(null);
      setManualTokenId('');
    }
  };

  // Perform checkpoint scan
  const handleScan = async (customTokenId = null) => {
    if (!activeModalCp) return;
    setScanning(true);
    setScanMessage(null);

    const cpId = activeModalCp.id || activeModalCp.checkpoint_id;

    try {
      const body = customTokenId ? { token_id: customTokenId } : {};
      const res = await axios.post(
        `/api/checkpoints/${cpId}/scan`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const nextDestination = res.data.next_station ? `➔ Next: ${res.data.next_station}` : '➔ Darshan Completed! 🎉';
      const msg = res.data.scanned_token_number
        ? `✅ Token #${res.data.scanned_token_number} passed! (${nextDestination})`
        : `✅ General pass recorded (+1 flow)`;

      setScanMessage({ text: msg, type: 'success' });
      setRecentScans((prev) => [
        {
          id: Date.now(),
          token_number: res.data.scanned_token_number ? `#${res.data.scanned_token_number}` : 'General Pass',
          checkpoint_name: activeModalCp.name,
          next_station: res.data.next_station || 'Completed',
          time: new Date().toLocaleTimeString(),
          status: res.data.new_status || 'Verified',
        },
        ...prev.slice(0, 6),
      ]);

      if (customTokenId) setManualTokenId('');
      fetchCheckpoints();
    } catch (err) {
      setScanMessage({
        text: err.response?.data?.error || 'Scan failed. Check server connection.',
        type: 'error',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      setWalkinError('Devotee name is required');
      return;
    }
    setWalkinError('');
    setWalkinLoading(true);
    try {
      const res = await axios.post(
        '/api/tokens/quick-add',
        {
          name: walkinName.trim(),
          phone: walkinPhone.trim() || undefined,
          gate_id: walkinGateId || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatedDevoteeToken(res.data.token);
      setWalkinName('');
      setWalkinPhone('');
      fetchCheckpoints();
    } catch (err) {
      setWalkinError(err.response?.data?.error || 'Failed to add walk-in devotee');
    } finally {
      setWalkinLoading(false);
    }
  };

  const getDensityColor = (level) => {
    switch (level) {
      case 'high': return '#f43f5e';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const gateOptions = checkpoints.filter((cp) => cp.checkpoint_type === 'gate' || cp.sequence_order === 1);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1050px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Navbar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🛡️</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>DarshanQ — Staff Terminal</h2>
            <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
              <span className="pulse-dot" /> Live Scan Terminal Active &bull; Click Any Node to Scan
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Operator: <strong style={{ color: '#fff' }}>{user?.name}</strong>
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

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span className="pulse-dot" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading temple stations...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Instructions Hint Banner */}
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#c084fc',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👆</span> Click on any <strong>Gate</strong>, <strong>Checkpoint</strong>, or <strong>Sanctum</strong> below to open its Scan Terminal!
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {checkpoints.length} active stations
            </span>
          </div>

          {/* ─── QUICK ADD WALK-IN DEVOTEE FORM ─── */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🚶</span> Quick Add Walk-in Devotee
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                  Issue an instant token & devotee tracking code for pilgrims without a mobile account
                </div>
              </div>
            </div>

            {/* Success Announcement Banner when token is created */}
            {createdDevoteeToken && (
              <div
                className="animate-fade-in"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.8), rgba(15, 23, 42, 0.9))',
                  border: '1px solid rgba(52, 211, 153, 0.5)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                      ✅ Walk-in Token Created Successfully
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fef08a' }}>
                        Token #{createdDevoteeToken.token_number}
                      </span>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '2rem',
                          fontWeight: 900,
                          color: '#38bdf8',
                          letterSpacing: '0.1em',
                          background: 'rgba(0, 0, 0, 0.4)',
                          padding: '0.2rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                        }}
                      >
                        {createdDevoteeToken.devotee_code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdDevoteeToken.devotee_code);
                          setWalkinCopied(true);
                          setTimeout(() => setWalkinCopied(false), 2000);
                        }}
                        style={{
                          background: walkinCopied ? 'rgba(34, 197, 94, 0.25)' : 'rgba(56, 189, 248, 0.2)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: walkinCopied ? '#4ade80' : '#38bdf8',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {walkinCopied ? '✓ Copied' : '📋 Copy Code'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                      <strong>Devotee:</strong> {createdDevoteeToken.devotee_name || 'Walk-in'} &bull;{' '}
                      <strong>Assigned Gate:</strong> {createdDevoteeToken.checkpoint_name || 'Gate'} &bull;{' '}
                      <strong>Est. Wait:</strong> ~{createdDevoteeToken.estimated_wait_minutes ?? 0} mins
                    </div>
                    <div style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: '#fde047', fontWeight: 600 }}>
                      🔊 Read this out: &ldquo;Your devotee code is <strong>{createdDevoteeToken.devotee_code}</strong>. You can check your status on Telegram anytime!&rdquo;
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCreatedDevoteeToken(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Done / Next
                  </button>
                </div>
              </div>
            )}

            {/* Walk-in Form */}
            <form onSubmit={handleQuickAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Devotee Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="custom-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="custom-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Assigned Gate
                </label>
                <select
                  value={walkinGateId}
                  onChange={(e) => setWalkinGateId(e.target.value)}
                  className="custom-input"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
                >
                  <option value="">⚡ Auto-Balance (Lowest Queue)</option>
                  {gateOptions.map((g) => (
                    <option key={g.id || g.checkpoint_id} value={g.id || g.checkpoint_id}>
                      🚪 {g.name} (Lane {g.lane || 1})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={walkinLoading || !walkinName.trim()}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: walkinLoading || !walkinName.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>🎟️</span>
                  {walkinLoading ? 'Generating...' : 'Issue Walk-in Pass'}
                </button>
              </div>
            </form>

            {walkinError && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#fda4af', fontWeight: 600 }}>
                ⚠️ {walkinError}
              </div>
            )}
          </div>

          {/* ─── FULL-WIDTH BEAUTIFUL LIVE TEMPLE FLOW MAP ─── */}
          <TempleFlowMap
            checkpoints={checkpoints}
            selectedCheckpointId={activeModalCp?.id || activeModalCp?.checkpoint_id}
            onSelectCheckpoint={handleNodeClick}
            compact={false}
          />

          {/* ─── RECENT SCAN STREAM SUMMARY ─── */}
          {recentScans.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📋</span> Recent Scan Stream
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    style={{
                      background: 'rgba(10, 8, 20, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fef08a' }}>{scan.token_number}</strong> at{' '}
                      <span style={{ color: '#c084fc', fontWeight: 600 }}>{scan.checkpoint_name}</span>{' '}
                      <span style={{ color: 'var(--text-dim)' }}>➔ {scan.next_station}</span>
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>{scan.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── INTERACTIVE SCAN ACTION MODAL (OPENS ON NODE CLICK) ─── */}
      {activeModalCp && (
        <div
          onClick={() => setActiveModalCp(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 3, 12, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              boxSizing: 'border-box',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalCp(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
              }}
              title="Close terminal"
            >
              ✕
            </button>

            {/* Station Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                {activeModalCp.checkpoint_type === 'gate' ? '🚪' : activeModalCp.checkpoint_type === 'sanctum' ? '🛕' : '🛡️'}
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem 0' }}>
                {activeModalCp.name}
              </h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: getDensityColor(activeModalCp.density_level), fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '6px', background: `${getDensityColor(activeModalCp.density_level)}22` }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getDensityColor(activeModalCp.density_level) }} />
                {activeModalCp.density_level} DENSITY &bull; {activeModalCp.checkpoint_type?.toUpperCase()}
              </div>
            </div>

            {/* Live Queue Waiting Count */}
            <div
              style={{
                background: 'rgba(10, 8, 20, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Devotees Stationed Here
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, margin: '0.35rem 0 0.15rem 0' }}>
                {activeModalCp.people_waiting}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Waiting to be scanned & advanced
              </div>
            </div>

            {/* BIG ONE-TAP SCAN BUTTON */}
            <button
              type="button"
              onClick={() => handleScan()}
              disabled={scanning}
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.25rem',
                fontWeight: 900,
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                cursor: scanning ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
              {scanning ? 'Passing Devotee...' : `+1 Pass Next Devotee`}
            </button>

            {/* Instant Scan Message Result */}
            {scanMessage && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: scanMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${scanMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                  color: scanMessage.type === 'success' ? '#34d399' : '#fda4af',
                  textAlign: 'center',
                }}
              >
                {scanMessage.text}
              </div>
            )}

            {/* Specific Token Search / Scan */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                Or scan specific devotee (Devotee Code, Token #, or UUID)
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualTokenId.trim()) handleScan(manualTokenId.trim());
                }}
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="text"
                  placeholder="e.g. DQ-C6CZ6Y, #14, or UUID..."
                  value={manualTokenId}
                  onChange={(e) => setManualTokenId(e.target.value)}
                  className="custom-input"
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.825rem' }}
                />
                <button
                  type="submit"
                  disabled={!manualTokenId.trim() || scanning}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#8b5cf6',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Scan
                </button>
              </form>
            </div>

            {/* Done / Dismiss Button */}
            <button
              type="button"
              onClick={() => setActiveModalCp(null)}
              style={{
                width: '100%',
                marginTop: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '0.3rem',
              }}
            >
              Done Scanning (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

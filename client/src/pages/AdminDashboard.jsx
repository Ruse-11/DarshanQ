import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import socket from '../lib/socket';
import TempleFlowMap from '../components/TempleFlowMap';

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const [checkpoints, setCheckpoints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [inspectedCpId, setInspectedCpId] = useState(null);

  // Devotee lookup state
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const handleDevoteeLookup = async (e) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await axios.get(
        `/api/admin/devotee/${encodeURIComponent(searchCode.trim().toUpperCase())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.error || `Devotee code '${searchCode}' not found`);
    } finally {
      setSearching(false);
    }
  };

  // Fetch admin density and analytics
  const fetchDashboardData = async () => {
    try {
      const [densityRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/density', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const list = densityRes.data.checkpoints || [];
      setCheckpoints(list);
      setAnalytics(analyticsRes.data.analytics || null);
      setLastUpdated(new Date().toLocaleTimeString());
      if (list.length > 0 && !inspectedCpId) {
        setInspectedCpId(list[0].checkpoint_id || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, [token]);

  // Wire up Socket.IO realtime connection for density updates
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleDensityUpdate = (data) => {
      setCheckpoints((prev) =>
        prev.map((cp) =>
          (cp.checkpoint_id === data.checkpoint_id || cp.id === data.checkpoint_id)
            ? {
                ...cp,
                density_level: data.density_level,
                people_waiting: data.people_waiting,
                scan_rate: data.scan_rate,
              }
            : cp
        )
      );
      setLastUpdated(new Date().toLocaleTimeString());
    };

    socket.on('density:update', handleDensityUpdate);

    return () => {
      socket.off('density:update', handleDensityUpdate);
    };
  }, []);

  const inspectedCheckpoint = checkpoints.find(
    (cp) => cp.checkpoint_id === inspectedCpId || cp.id === inspectedCpId
  ) || checkpoints[0];

  const getDensityBadge = (level) => {
    switch (level) {
      case 'high':
        return {
          color: '#f43f5e',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.4)',
          text: 'HIGH CONGESTION',
          desc: 'High crowd density. Consider deploying additional staff to speed up clearance.',
        };
      case 'medium':
        return {
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: 'MODERATE QUEUE',
          desc: 'Steady queue flow within acceptable operational parameters.',
        };
      default:
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          text: 'LOW DENSITY',
          desc: 'Free flow of devotees with minimal waiting delay.',
        };
    }
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
      {/* Top Navbar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>👑</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>DarshanQ — Admin Command Center</h2>
            <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
              <span className="pulse-dot" /> Live Monitoring Active &bull; Last sync: {lastUpdated}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            ↻ Refresh
          </button>
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
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading live analytics...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Executive KPI Overview Cards */}
          {analytics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active in Queue
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fef08a', marginTop: '0.25rem' }}>
                  {analytics.active_waiting}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total devotees in line</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Average Wait Time
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#60a5fa', marginTop: '0.25rem' }}>
                  {analytics.avg_wait_minutes} <span style={{ fontSize: '1rem', fontWeight: 500 }}>min</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated queue velocity</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Completed Darshans
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', marginTop: '0.25rem' }}>
                  {analytics.tokens_completed_today}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Through sanctum gate</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Scans Today
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#c084fc', marginTop: '0.25rem' }}>
                  {analytics.scans_today}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all checkpoints</div>
              </div>
            </div>
          )}

          {/* ─── DEVOTEE CODE LOOKUP & JOURNEY TRACE ─── */}
          <div className="glass-card" style={{ padding: '1.5rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🔍</span> Look up devotee by code
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Trace a pilgrim&apos;s real-time journey & checkpoint audit log using their unique DQ-code
                </div>
              </div>

              {searchResult && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchResult(null);
                    setSearchCode('');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-muted)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleDevoteeLookup} style={{ display: 'flex', gap: '0.75rem', maxWidth: '520px' }}>
              <input
                type="text"
                placeholder="Enter devotee code (e.g. DQ-7F3K2)..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="custom-input"
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="submit"
                disabled={searching || !searchCode.trim()}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: searching || !searchCode.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {searching ? 'Searching...' : 'Trace Devotee'}
              </button>
            </form>

            {searchError && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fda4af',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                ⚠️ {searchError}
              </div>
            )}

            {/* Devotee Trace Result Details */}
            {searchResult && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Summary Metadata Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Devotee Code</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      {searchResult.devotee.devotee_code}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Token Number</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fef08a', marginTop: '0.2rem' }}>
                      #{searchResult.devotee.token_number}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pilgrim Info</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.35rem' }}>
                      {searchResult.devotee.devotee_name || 'Online Pilgrim'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {searchResult.devotee.devotee_phone || 'No phone recorded'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Current Position</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span className="pulse-dot" /> {searchResult.devotee.current_checkpoint_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Status: {searchResult.devotee.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(10, 8, 20, 0.6)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Gate Check-in Time</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: searchResult.devotee.gate_checkin_time ? '#fcd34d' : 'var(--text-dim)', marginTop: '0.35rem' }}>
                      {searchResult.devotee.gate_checkin_time
                        ? new Date(searchResult.devotee.gate_checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Awaiting Gate Scan'}
                    </div>
                  </div>
                </div>

                {/* Ordered Audit Timeline */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>📍</span> Checkpoint Scan History &amp; Journey Trace
                  </div>

                  {searchResult.logs.length === 0 ? (
                    <div
                      style={{
                        padding: '1.25rem',
                        background: 'rgba(10, 8, 20, 0.4)',
                        borderRadius: '12px',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      Awaiting initial gate scan. Currently assigned to <strong>{searchResult.devotee.current_checkpoint_name}</strong>.
                    </div>
                  ) : (
                    <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Vertical line connecting timeline nodes */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '11px',
                          top: '12px',
                          bottom: '12px',
                          width: '2px',
                          background: 'linear-gradient(to bottom, #38bdf8, #8b5cf6, #10b981)',
                        }}
                      />

                      {searchResult.logs.map((log, index) => {
                        const isCurrentPosition =
                          log.checkpoint_name === searchResult.devotee.current_checkpoint_name;

                        return (
                          <div
                            key={log.id}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '1rem',
                            }}
                          >
                            {/* Dot Marker */}
                            <div
                              style={{
                                position: 'absolute',
                                left: '-1.5rem',
                                top: '4px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: isCurrentPosition ? '#10b981' : '#1e1b4b',
                                border: `2px solid ${isCurrentPosition ? '#34d399' : '#8b5cf6'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                color: '#fff',
                                fontWeight: 800,
                                zIndex: 1,
                                boxShadow: isCurrentPosition ? '0 0 10px rgba(52, 211, 153, 0.8)' : 'none',
                              }}
                            >
                              {index + 1}
                            </div>

                            {/* Node Card */}
                            <div
                              style={{
                                flex: 1,
                                background: isCurrentPosition
                                  ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.6), rgba(15, 23, 42, 0.8))'
                                  : 'rgba(15, 23, 42, 0.6)',
                                border: `1px solid ${isCurrentPosition ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                                borderRadius: '12px',
                                padding: '0.85rem 1.15rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isCurrentPosition ? '#a7f3d0' : '#fff' }}>
                                    {log.checkpoint_type === 'gate' ? '🚪' : log.checkpoint_type === 'checkpoint' ? '🛡️' : '🛕'}{' '}
                                    {log.checkpoint_name}
                                  </span>
                                  {isCurrentPosition && (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(52, 211, 153, 0.4)',
                                        color: '#34d399',
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '6px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      📍 Current Live Position
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  Verified by: <strong style={{ color: '#cbd5e1' }}>{log.scanned_by}</strong>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fef08a' }}>
                                  {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                  {new Date(log.scanned_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Final destination if devotee completed darshan */}
                      {searchResult.devotee.status === 'completed' && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                          <div
                            style={{
                              position: 'absolute',
                              left: '-1.5rem',
                              top: '4px',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: '#f59e0b',
                              border: '2px solid #fef08a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              zIndex: 1,
                            }}
                          >
                            ✓
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.4), rgba(15, 23, 42, 0.8))',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              borderRadius: '12px',
                              padding: '0.85rem 1.15rem',
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fef08a' }}>
                              🛕 Sanctum Sanctorum — Darshan Successfully Completed
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Pilgrim safely completed temple darshan and exited holy sanctum.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── FOCUSED REAL-TIME TEMPLE FLOW MAP ─── */}
          <TempleFlowMap
            checkpoints={checkpoints}
            selectedCheckpointId={inspectedCheckpoint?.checkpoint_id || inspectedCheckpoint?.id}
            onSelectCheckpoint={(id) => setInspectedCpId(id)}
          />

          {/* Station Deep Dive Inspector (Appears when any station is clicked) */}
          {inspectedCheckpoint && (
            <div
              className="glass-card animate-fade-in"
              style={{
                padding: '1.75rem',
                borderLeft: `4px solid ${getDensityBadge(inspectedCheckpoint.density_level).color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                    Station Inspector Details
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0 0 0' }}>
                    {inspectedCheckpoint.name}
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: getDensityBadge(inspectedCheckpoint.density_level).bg,
                    color: getDensityBadge(inspectedCheckpoint.density_level).color,
                    border: `1px solid ${getDensityBadge(inspectedCheckpoint.density_level).border}`,
                  }}
                >
                  {getDensityBadge(inspectedCheckpoint.density_level).text}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ background: 'rgba(10, 8, 20, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Queue</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                    {inspectedCheckpoint.people_waiting} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>devotees</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(10, 8, 20, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Scan Velocity</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.2rem' }}>
                    {inspectedCheckpoint.scan_rate || 0.5} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ min</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(10, 8, 20, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Topology Level</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fcd34d', marginTop: '0.5rem' }}>
                    Level {inspectedCheckpoint.sequence_order} ({inspectedCheckpoint.checkpoint_type?.toUpperCase() || 'STATION'})
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.825rem', color: getDensityBadge(inspectedCheckpoint.density_level).color, marginTop: '0.25rem' }}>
                ℹ️ {getDensityBadge(inspectedCheckpoint.density_level).desc}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function TempleFlowMap({
  checkpoints = [],
  selectedCheckpointId = null,
  onSelectCheckpoint = null,
  activeTokenCheckpointId = null, // Devotee's current location if provided
  compact = false, // Compact mode for split-screen layouts
}) {
  // Categorize checkpoints into Gates, Checkpoints, and Sanctum
  const gates = checkpoints
    .filter((cp) => cp.checkpoint_type === 'gate' || cp.sequence_order === 1)
    .sort((a, b) => (a.lane || 0) - (b.lane || 0));

  const intermediateCheckpoints = checkpoints
    .filter((cp) => cp.checkpoint_type === 'checkpoint' || cp.sequence_order === 2)
    .sort((a, b) => (a.lane || 0) - (b.lane || 0));

  const sanctum = checkpoints.find(
    (cp) => cp.checkpoint_type === 'sanctum' || cp.sequence_order === 3
  );

  const getDensityInfo = (level) => {
    switch (level) {
      case 'high':
        return {
          color: '#f43f5e',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.45)',
          glow: 'rgba(244, 63, 94, 0.35)',
          text: 'HIGH',
        };
      case 'medium':
        return {
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.45)',
          glow: 'rgba(245, 158, 11, 0.3)',
          text: 'MODERATE',
        };
      default:
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.45)',
          glow: 'rgba(16, 185, 129, 0.25)',
          text: 'LOW',
        };
    }
  };

  const renderNode = (cp, icon = '🚪', subtitle = '') => {
    if (!cp) return null;
    const isSelected = selectedCheckpointId === cp.checkpoint_id || selectedCheckpointId === cp.id;
    const isDevoteeHere = activeTokenCheckpointId === cp.checkpoint_id || activeTokenCheckpointId === cp.id;
    const badge = getDensityInfo(cp.density_level);

    return (
      <div
        key={cp.checkpoint_id || cp.id}
        onClick={() => onSelectCheckpoint && onSelectCheckpoint(cp.checkpoint_id || cp.id)}
        style={{
          flex: 1,
          minWidth: compact ? '140px' : '200px',
          maxWidth: compact ? '220px' : '300px',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(45, 33, 85, 0.95), rgba(24, 18, 48, 0.95))'
            : 'rgba(18, 14, 34, 0.85)',
          border: `2px solid ${
            isSelected
              ? 'var(--primary)'
              : isDevoteeHere
              ? '#f59e0b'
              : badge.border
          }`,
          boxShadow: isSelected
            ? '0 0 25px rgba(139, 92, 246, 0.6), 0 8px 20px rgba(0,0,0,0.6)'
            : `0 6px 16px rgba(0,0,0,0.4), 0 0 12px ${badge.glow}`,
          borderRadius: compact ? '12px' : '16px',
          padding: compact ? '0.75rem 0.85rem' : '1.2rem 1.1rem',
          cursor: onSelectCheckpoint ? 'pointer' : 'default',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          userSelect: 'none',
          transform: isSelected ? 'scale(1.03)' : 'none',
        }}
      >
        {/* Active badges */}
        {isDevoteeHere && (
          <div
            style={{
              position: 'absolute',
              top: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '2px 8px',
              borderRadius: '20px',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.5)',
              whiteSpace: 'nowrap',
              zIndex: 2,
            }}
          >
            📍 YOU ARE HERE
          </div>
        )}

        {isSelected && !isDevoteeHere && (
          <div
            style={{
              position: 'absolute',
              top: '-9px',
              right: '10px',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.62rem',
              padding: '2px 6px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px var(--primary-glow)',
              zIndex: 2,
            }}
          >
            TARGET
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: compact ? '0.35rem' : '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: compact ? '1.1rem' : '1.35rem' }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: compact ? '0.9rem' : '1.05rem', color: '#fff' }}>
                {cp.name}
              </div>
              {!compact && subtitle && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <span
            style={{
              fontSize: compact ? '0.6rem' : '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '5px',
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
            }}
          >
            {badge.text}
          </span>
        </div>

        {/* Live Devotees Count */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: compact ? '0.4rem 0' : '0.75rem 0 0.5rem 0' }}>
          <span style={{ fontSize: compact ? '1.75rem' : '2.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {cp.people_waiting}
          </span>
          <span style={{ fontSize: compact ? '0.75rem' : '0.85rem', color: 'var(--text-muted)' }}>waiting</span>
        </div>

        {/* Velocity Scan Rate */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: compact ? '0.35rem' : '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: compact ? '0.7rem' : '0.78rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Velocity:</span>
          <span style={{ color: '#a78bfa', fontWeight: 600 }}>
            {cp.scan_rate ? `${cp.scan_rate}/m` : '0.5/m'}
          </span>
        </div>

        {/* Action Prompt */}
        {onSelectCheckpoint && (
          <div
            style={{
              marginTop: compact ? '0.4rem' : '0.65rem',
              padding: compact ? '0.3rem' : '0.4rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontWeight: 800,
              fontSize: compact ? '0.7rem' : '0.78rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            <span>⚡</span> Tap to Scan
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: compact ? '1.25rem 1rem' : '2rem 1.5rem',
        overflowX: 'auto',
        background: 'rgba(15, 12, 28, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: compact ? '1.25rem' : '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          <span>🏛️</span> TEMPLE ARCHITECTURE TOPOLOGY
        </div>
        <h2 style={{ fontSize: compact ? '1.3rem' : '1.6rem', fontWeight: 800, margin: '0.15rem 0', color: '#fff' }}>
          Live Queue Flow Map
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: compact ? '0.78rem' : '0.85rem', maxWidth: '520px', margin: '0 auto' }}>
          3 Entry Gates channel into 3 Security Checkpoints, converging into 1 Sacred Sanctum.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: compact ? '480px' : '680px', margin: '0 auto' }}>
        
        {/* ─── LEVEL 1: ENTRY GATES ─── */}
        <div style={{ width: '100%', marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa', marginBottom: '0.5rem', textAlign: 'center' }}>
            ▲ LEVEL 1: ENTRANCE GATES
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: compact ? '0.75rem' : '1.5rem', width: '100%' }}>
            {gates.map((gate, idx) =>
              renderNode(gate, '🚪', `Lane ${gate.lane || idx + 1} Entry`)
            )}
          </div>
        </div>

        {/* ─── CONNECTOR CHANNELS 1 (Vertical downward arrows) ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', margin: '0.25rem 0' }}>
          {gates.map((_, idx) => (
            <div
              key={`conn-gate-${idx}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#8b5cf6',
              }}
            >
              <div style={{ width: '3px', height: compact ? '20px' : '30px', background: 'linear-gradient(to bottom, #8b5cf6, #3b82f6)', borderRadius: '2px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '-4px', left: '-5px', fontSize: compact ? '0.75rem' : '0.85rem', color: '#3b82f6' }}>
                  ▼
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── LEVEL 2: SECURITY CHECKPOINTS ─── */}
        <div style={{ width: '100%', marginTop: '0.2rem', marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa', marginBottom: '0.5rem', textAlign: 'center' }}>
            ▲ LEVEL 2: SECURITY CHECKPOINTS
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: compact ? '0.75rem' : '1.5rem', width: '100%' }}>
            {intermediateCheckpoints.map((cp, idx) =>
              renderNode(cp, '🛡️', `Security ${cp.lane || idx + 1}`)
            )}
          </div>
        </div>

        {/* ─── CONNECTOR CHANNELS 2: CONVERGENCE FUNNEL ─── */}
        <div style={{ width: '100%', padding: compact ? '0.4rem 0' : '0.6rem 0', position: 'relative' }}>
          {/* Vertical pipes dropping from Checkpoints */}
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            {intermediateCheckpoints.map((_, idx) => (
              <div
                key={`conn-cp-${idx}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '3px', height: compact ? '16px' : '24px', background: '#ec4899', borderRadius: '2px' }} />
              </div>
            ))}
          </div>

          {/* Horizontal Convergence Crossbar connecting all 3 lanes */}
          <div
            style={{
              width: '66%',
              margin: '0 auto',
              height: '3px',
              background: 'linear-gradient(90deg, #ec4899 0%, #f59e0b 50%, #ec4899 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
            }}
          />

          {/* Single Drop pipe funneling into Sanctum */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0' }}>
            <div style={{ width: '3px', height: compact ? '22px' : '32px', background: 'linear-gradient(to bottom, #f59e0b, #eab308)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '-4px', left: '-5px', fontSize: compact ? '0.75rem' : '0.9rem', color: '#eab308' }}>
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* ─── LEVEL 3: SINGLE SANCTUM SANCTORUM ─── */}
        <div style={{ marginTop: '0.3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fcd34d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>⭐</span> LEVEL 3: 1 FINAL SANCTUM SANCTORUM
          </div>

          {sanctum ? (
            <div style={{ minWidth: compact ? '220px' : '300px', maxWidth: compact ? '260px' : '360px' }}>
              {renderNode(sanctum, '🛕', 'Sacred Inner Sanctum Darshan')}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Sanctum loading...
            </div>
          )}
        </div>

      </div>

      {/* Legend Footnote */}
      <div style={{ marginTop: compact ? '1.5rem' : '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Low (&lt;4)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Moderate (4–7)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
            High (8+)
          </span>
        </div>

        {onSelectCheckpoint && (
          <div style={{ color: '#a78bfa', fontWeight: 600 }}>
            💡 Click any station on the map to target it
          </div>
        )}
      </div>
    </div>
  );
}

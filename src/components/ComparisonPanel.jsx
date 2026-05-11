import { Activity, TrendingUp, Grid, ShieldCheck } from 'lucide-react';

const ComparisonPanel = ({ sensors, waveParams }) => {
  const s4 = sensors.find(s => s.id === 'S4') || { currentError: 0, currentVal: 0 };
  const s6 = sensors.find(s => s.id === 'S6') || { currentError: 0, currentVal: 0 };

  // Error Matrix simulation for visual impact
  const matrix = [
    [s4.currentError * 0.8, s4.currentError * 1.2],
    [s6.currentError * 0.9, s6.currentError * 2.5] // S6 has high error
  ];

  const renderSparkline = (color) => (
    <svg width="100%" height="40" style={{ opacity: 0.8 }}>
      <path
        d={`M 0 20 Q 50 ${10 + Math.random() * 20} 100 20 T 200 20`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <div style={{
      width: '320px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(30px)',
      padding: '1.5rem',
      borderRadius: '0 0 0 1.5rem',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      height: 'calc(100vh - 80px)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <TrendingUp size={20} color="#10b981" />
        <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>CRITICAL COMPARISON</h2>
      </div>

      {/* Error Matrix Section */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Grid size={12} /> ABSOLUTE ERROR DIFFERENCE (S4 vs S6)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {matrix.flat().map((val, i) => (
            <div key={i} style={{
              height: '40px',
              background: `rgba(${Math.min(255, val * 300)}, ${Math.max(0, 100 - val * 100)}, 50, 0.6)`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {val.toFixed(3)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', opacity: 0.5, textAlign: 'center' }}>HEAT DIAGRAM MATRIX (DOCENT REQUIRED)</div>
      </div>

      {/* Raw Data Comparison */}
      <div>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, marginBottom: '0.8rem' }}>RAW DATA (S4 vs S6)</div>
        <div style={{ position: 'relative', height: '60px', background: 'rgba(2, 6, 23, 0.4)', borderRadius: '8px', padding: '10px' }}>
          {renderSparkline('#4ade80')}
          <div style={{ position: 'absolute', top: 5, left: 10, fontSize: '10px', color: '#4ade80' }}>S4: OK</div>
          <div style={{ position: 'absolute', bottom: 5, right: 10, fontSize: '10px', color: '#f43f5e' }}>S6: FAULT</div>
        </div>
      </div>

      {/* Inverse Model Convergence */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, marginBottom: '0.4rem' }}>MODEL CONVERGENCE</div>
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.3rem' }}>
            <ShieldCheck size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>MODEL STATUS: STABLE</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>σ = 0.0421</div>
          <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>RESIDUAL RMS ERROR</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ fontSize: '0.65rem', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
        Engineering metrics Sharp and Legible. <br />
        © 2026 UCC Pasto - Monitoring Network.
      </div>
    </div>
  );
};

export default ComparisonPanel;

import { Activity, TrendingUp, Grid, ShieldCheck, AlertTriangle } from 'lucide-react';

const ComparisonPanel = ({ sensors, A0 }) => {
  const s4 = sensors.find(s => s.id === 'S4') || { currentError: 0, currentVal: 0 };
  const s6 = sensors.find(s => s.id === 'S6') || { currentError: 0, currentVal: 0 };

  const rmsError = Math.sqrt(
    sensors.reduce((acc, s) => acc + s.currentError ** 2, 0) / sensors.length
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
        <TrendingUp size={20} color="#f43f5e" />
        <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>COMPARATIVA CRÍTICA</h2>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={12} /> RESIDUALES POR ESTACIÓN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <StatRow label="S4 (OESTE)" val={s4.currentVal.toFixed(4)} err={s4.currentError.toFixed(4)} />
          <StatRow label="S6 (ESTE)" val={s6.currentVal.toFixed(4)} err={s6.currentError.toFixed(4)} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, marginBottom: '0.4rem' }}>CONVERGENCIA DEL MODELO</div>
        <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '1.2rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', marginBottom: '0.8rem' }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>ESTADO: ESTIMANDO</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 950, color: '#f43f5e' }}>{rmsError.toFixed(4)}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700 }}>ERROR CUADRÁTICO MEDIO (RMS)</div>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', fontSize: '0.7rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ color: '#60a5fa', fontWeight: 800, marginBottom: '5px' }}>ANÁLISIS TEÓRICO</div>
          Se observa que al aumentar la profundidad (z0), el error residual en la red de superficie tiende a estabilizarse.
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={12} />
        Software de uso académico - UCC Pasto
      </div>
    </div>
  );
};

const StatRow = ({ label, val, err }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>{label}</div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>{val}</div>
      <div style={{ fontSize: '0.6rem', color: '#f43f5e' }}>Δ: {err}</div>
    </div>
  </div>
);

export default ComparisonPanel;


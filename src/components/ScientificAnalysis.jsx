import { BarChart3, TrendingDown, Info, Zap } from 'lucide-react';

const ScientificAnalysis = ({ sensors }) => {
  const avgError = sensors.reduce((acc, s) => acc + s.currentError, 0) / sensors.length;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '320px',
      background: 'rgba(2, 6, 23, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1.5rem',
      padding: '1.5rem',
      color: 'white',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <BarChart3 size={18} color="#60a5fa" />
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>ANÁLISIS ESTADÍSTICO FIJO</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '0.2rem' }}>ERROR PROMEDIO RED</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f43f5e' }}>{avgError.toFixed(4)}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '0.2rem' }}>CONVERGENCIA (J)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>ESTABLE</div>
        </div>
      </div>

      {/* 2D Error Heatmap Matrix */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} /> DIAGRAMA DE CALOR 2D (TASA DE ERROR)
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '4px',
          background: 'rgba(255,255,255,0.05)',
          padding: '4px',
          borderRadius: '8px'
        }}>
          {sensors.map((s, i) => (
            <div key={i} style={{
              height: '40px',
              background: `rgba(${Math.min(255, s.currentError * 300)}, ${Math.max(0, 100 - s.currentError * 100)}, 100, 0.7)`,
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: 900,
              boxShadow: s.hasFault ? 'inset 0 0 10px rgba(244, 63, 94, 0.5)' : 'none',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ opacity: 0.7 }}>{s.id}</div>
              <div style={{ color: 'white', fontSize: '0.7rem' }}>{s.currentError.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', opacity: 0.4, marginTop: '4px' }}>
          <span>OESTE</span>
          <span>EJE GALERAS</span>
          <span>ESTE</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Info size={14} color="#fcd34d" />
        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Monitoreo espacial de error en red 3x3.</span>
      </div>
    </div>
  );
};

export default ScientificAnalysis;

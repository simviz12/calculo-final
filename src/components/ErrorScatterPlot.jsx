import { Activity } from 'lucide-react';

const ErrorScatterPlot = ({ sensors }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '180px',
      height: '180px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '1.5rem',
      padding: '1.2rem',
      color: 'white',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Activity size={14} color="#f43f5e" />
        <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.5px' }}>MAPA ESTATICO (XY)</h3>
      </div>

      <div style={{ 
        flex: 1, 
        position: 'relative', 
        background: 'radial-gradient(circle at 70% 50%, rgba(244, 63, 94, 0.1) 0%, transparent 70%)',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden'
      }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '33% 33%' }} />
        
        {sensors.map((s, i) => {
          const left = 50 + (s.x / 12) * 100;
          const top = 50 - (s.y / 12) * 100;
          const errorScale = Math.min(25, 8 + s.currentError * 20);
          const isHighError = s.currentError > 0.5;
          
          return (
            <div key={s.id} style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${errorScale}px`,
              height: `${errorScale}px`,
              background: isHighError ? '#f43f5e' : '#10b981',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${errorScale * 1.5}px ${isHighError ? 'rgba(244, 63, 94, 0.6)' : 'rgba(16, 185, 129, 0.3)'}`,
              transition: 'all 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 900,
              color: 'black'
            }}>
              {s.id.replace('S', '')}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> OK
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e' }} /> ERROR
        </div>
      </div>
    </div>
  );
};

export default ErrorScatterPlot;


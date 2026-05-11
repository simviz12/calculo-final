import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, ContactShadows, DragControls, Float } from '@react-three/drei';
import { Suspense, useState, useEffect, useRef } from 'react';
import { 
  Zap, MapPin, Sliders, ShieldAlert, Download, 
  Layers, Eye, Thermometer, Wind, MousePointer2,
  User, Database, Globe, Activity, Info, BarChart
} from 'lucide-react';

import SeismicGrid from './components/SeismicGrid';
import Sensor from './components/Sensor';
import ComparisonPanel from './components/ComparisonPanel';
import ScientificAnalysis from './components/ScientificAnalysis';
import ErrorScatterPlot from './components/ErrorScatterPlot';
import { seismicWaveGaleras, getNoiseProfile, exportGalerasData } from './utils/mathUtils';

const SENSOR_CONFIG = [
  { id: 'S1', x: -5, y: 5, profile: 'low', label: 'S1' },
  { id: 'S2', x: 0, y: 5, profile: 'low', label: 'S2' },
  { id: 'S3', x: 5, y: 5, profile: 'low', label: 'S3' },
  { id: 'S4', x: -5, y: 0, profile: 'critical', label: 'S4' },
  { id: 'S5', x: 0, y: 0, profile: 'critical', label: 'S5' },
  { id: 'S6', x: 5, y: 0, profile: 'critical', label: 'S6', hasFault: true },
  { id: 'S7', x: -5, y: -5, profile: 'moderate', label: 'S7' },
  { id: 'S8', x: 0, y: -5, profile: 'moderate', label: 'S8' },
  { id: 'S9', x: 5, y: -5, profile: 'moderate', label: 'S9' },
];

function App() {
  const [sourcePos, setSourcePos] = useState({ x: 0, y: 0 });
  const [waveParams, setWaveParams] = useState({ amplitude: 8.0, damping: 0.1, waveNumber: 1.5, frequency: 2.0 });
  const [noiseBase, setNoiseBase] = useState(0.1);
  const [magmaViscosity, setMagmaViscosity] = useState(1);
  const [viewMode, setViewMode] = useState('wave');
  const [showGradients, setShowGradients] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [sensors, setSensors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const history = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      const updatedSensors = SENSOR_CONFIG.map(config => {
        const zIdeal = seismicWaveGaleras(config.x, config.y, t, sourcePos, { ...waveParams, frequency: waveParams.frequency * magmaViscosity });
        let noise = getNoiseProfile(config.profile, noiseBase);
        if (config.hasFault) noise += Math.sin(t * 12) * 0.4;
        const zObs = zIdeal + noise;
        return { ...config, currentVal: zObs, currentError: Math.abs(zObs - zIdeal) };
      });
      setSensors(updatedSensors);
    }, 100);
    return () => clearInterval(interval);
  }, [waveParams, noiseBase, magmaViscosity, sourcePos]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', fontFamily: 'Inter', color: 'white', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 0%, rgba(2, 6, 23, 0.4) 100%)', zIndex: 10 }} />

      <header style={{ height: '80px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ background: '#f43f5e', padding: '0.6rem', borderRadius: '0.8rem', boxShadow: '0 0 30px rgba(244, 63, 94, 0.6)' }}><Zap size={24} color="white" /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.5px' }}>SISMO-MONITOR 3D <span style={{ color: '#f43f5e' }}>GALERAS</span></h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2px' }}>
              <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>SIMULATION: ACTIVE</span>
              <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 800 }}>• UCC PASTO, NARIÑO</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.85rem' }}>
              <User size={16} color="#f43f5e" /> CARLOS JULIÁN BENAVIDES BURBANO
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700 }}>INGENIERÍA - CÁLCULO MULTIVARIADO</div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        <aside style={{ width: '320px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(40px)', padding: '1.5rem', borderRight: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Sliders size={20} color="#f43f5e" />
            <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>PARAMETRIZACIÓN</h2>
          </div>

          <ControlSlider label="Amplitud Sísmica (A)" value={waveParams.amplitude.toFixed(1)} min={0.1} max={15} step={0.1} icon={Activity} onChange={v => setWaveParams(p => ({ ...p, amplitude: v }))} />
          <ControlSlider label="Atenuación Suelo (b)" value={waveParams.damping.toFixed(2)} min={0.01} max={0.5} step={0.01} icon={Wind} onChange={v => setWaveParams(p => ({ ...p, damping: v }))} />
          <ControlSlider label="Viscosidad Magma (ω)" value={magmaViscosity.toFixed(1)} min={0.5} max={4} step={0.1} icon={Thermometer} onChange={v => setMagmaViscosity(v)} />
          <ControlSlider label="Nivel Ruido Mausigno" value={noiseBase.toFixed(2)} min={0.01} max={1.0} step={0.01} icon={ShieldAlert} onChange={v => setNoiseBase(v)} />

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <SidebarButton active={viewMode === 'error'} onClick={() => setViewMode(viewMode === 'wave' ? 'error' : 'wave')} icon={Layers} text="VER CAMPO DE ERROR (E)" />
            <SidebarButton active={showGradients} onClick={() => setShowGradients(!showGradients)} icon={MousePointer2} text="DIRECCIÓN DE ENERGÍA (∇f)" />
            <SidebarButton active={showStats} onClick={() => setShowStats(!showStats)} icon={BarChart} text="ANÁLISIS ESTADÍSTICO" />
            <button onClick={() => exportGalerasData(sensors)} style={{ background: '#10b981', border: 'none', color: 'white', padding: '1rem', borderRadius: '1rem', cursor: 'pointer', fontWeight: 900, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}>
              <Download size={16} /> GENERAR REPORTE WORD
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas shadows>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[25, 25, 25]} />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 20, 10]} intensity={3} color="#38bdf8" />
              
              <SeismicGrid 
                source={sourcePos}
                waveParams={{ ...waveParams, frequency: waveParams.frequency * magmaViscosity }} 
                viewMode={viewMode}
                showGradients={showGradients}
                sensors={sensors}
              />

              <DragControls 
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                onDrag={(matrix) => {
                  const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
                  setSourcePos({ x: pos.x, y: pos.z });
                }}
              >
                <group position={[sourcePos.x, 1.2, sourcePos.y]}>
                  <mesh>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={20} />
                  </mesh>
                  <pointLight distance={15} intensity={12} color="#f43f5e" />
                </group>
              </DragControls>

              {sensors.map(s => (
                <Sensor 
                  key={s.id} 
                  position={[s.x, 0.8, s.y]} 
                  color={s.hasFault ? '#f43f5e' : '#10b981'} 
                  label={s.label}
                  intensity={s.currentVal}
                  error={s.currentError}
                  noiseProfile={s.profile}
                />
              ))}

              <Environment preset="night" />
              <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={40} blur={2.5} far={4.5} />
              <OrbitControls makeDefault enabled={!isDragging} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
            </Suspense>
          </Canvas>

          {/* DRAGGABLE EPICENTER INSTRUCTION */}
          <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(2, 6, 23, 0.6)', padding: '0.6rem 1.2rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', letterSpacing: '1px', color: '#f43f5e' }}>
            MASTER CONTROL: ARRASTRA EL EPICENTRO
          </div>

          {/* NEW STATIC XY MAP PANEL */}
          {showStats && <ErrorScatterPlot sensors={sensors} />}
          
          {showStats && <ScientificAnalysis sensors={sensors} />}
        </div>

        <ComparisonPanel sensors={sensors} waveParams={waveParams} />

      </main>
    </div>
  );
}

const ControlSlider = ({ label, value, min, max, step, onChange, icon: Icon }) => (
  <div style={{ marginBottom: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.7 }}><Icon size={14} /> {label}</div>
      <span style={{ fontWeight: 900, color: '#f43f5e' }}>{value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e', cursor: 'pointer' }} />
  </div>
);

const SidebarButton = ({ active, onClick, icon: Icon, text }) => (
  <button onClick={onClick} style={{ width: '100%', background: active ? '#f43f5e' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.85rem', borderRadius: '1rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.2s', border: active ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
    <Icon size={16} /> {text}
  </button>
);

export default App;

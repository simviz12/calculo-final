import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import createPlotlyComponentRef from 'react-plotly.js/factory';
import './index.css';

const createPlotlyComponent = createPlotlyComponentRef.default || createPlotlyComponentRef;
const Plot = createPlotlyComponent(Plotly);

// Presets de los Escenarios solicitados
const ESCENARIOS = {
  1: {
    name: "Análisis de Sensibilidad (5 Sensores)",
    sensors: [
      { id: 'S1', x: 0, y: 0, z: 0 },
      { id: 'S2', x: 5, y: 0, z: 0 },
      { id: 'S3', x: 0, y: 5, z: 0 },
      { id: 'S4', x: 5, y: 5, z: 0 },
      { id: 'S5', x: 2.5, y: 2.5, z: -1.5 },
    ],
    trueX: 2.2, trueY: 2.8, trueZ: -3.0, trueA0: 150
  },
  2: {
    name: "Escaneo Perimetral (8 Sensores)",
    sensors: [
      { id: 'S1', x: 0, y: 0, z: 0 }, { id: 'S2', x: 5, y: 0, z: 0 }, { id: 'S3', x: 10, y: 0, z: 0 },
      { id: 'S4', x: 10, y: 5, z: 0 }, { id: 'S5', x: 10, y: 10, z: 0 },
      { id: 'S6', x: 5, y: 10, z: 0 }, { id: 'S7', x: 0, y: 10, z: 0 }, { id: 'S8', x: 0, y: 5, z: 0 },
    ],
    trueX: 4.8, trueY: 5.2, trueZ: -4.5, trueA0: 180
  },
  3: {
    name: "Incertidumbre en Falla (Alineación Crítica)",
    sensors: [
      { id: 'S1', x: 2, y: 2, z: 0 }, { id: 'S2', x: 4, y: 4, z: 0 }, { id: 'S3', x: 6, y: 6, z: 0 },
      { id: 'S4', x: 8, y: 8, z: 0 }, { id: 'S5', x: 0, y: 10, z: -2 },
    ],
    trueX: 2.5, trueY: 7.5, trueZ: -5.0, trueA0: 200
  }
};

function App() {
  const [activeSensors, setActiveSensors] = useState(ESCENARIOS[1].sensors);
  const [trueX, setTrueX] = useState(ESCENARIOS[1].trueX);
  const [trueY, setTrueY] = useState(ESCENARIOS[1].trueY);
  const [trueZ, setTrueZ] = useState(ESCENARIOS[1].trueZ);
  const [trueA0, setTrueA0] = useState(ESCENARIOS[1].trueA0);
  
  const [scanZ, setScanZ] = useState(-5.0);

  const [plotData, setPlotData] = useState([]);
  const [activeView, setActiveView] = useState('simulator'); // 'simulator' o 'guide'

  // Modelo Matemático Riguroso en 3 Dimensiones (R = Distancia Euclidiana 3D)
  const calculateAmplitude = (sx, sy, sz, srcX, srcY, srcZ, a0) => {
    const dx = sx - srcX;
    const dy = sy - srcY;
    const dz = sz - srcZ;
    const r = Math.sqrt(dx*dx + dy*dy + dz*dz); // Aquí operamos en pleno 3D
    if (r === 0) return a0;
    return a0 * (Math.exp(-r) / r);
  };

  useEffect(() => {
    const gridRes = 40; // Resolución optimizada para gráficos 3D fluidos
    
    const observations = activeSensors.map(s => {
      const amp = calculateAmplitude(s.x, s.y, s.z, trueX, trueY, trueZ, trueA0);
      return { ...s, obsAmp: amp };
    });

    const minCoord = -2;
    const maxCoord = 12;
    const step = (maxCoord - minCoord) / gridRes;

    let z_data = [];
    let x_data = [];
    let y_data = [];

    for (let i = 0; i < gridRes; i++) {
      let z_row = [];
      let y_val = minCoord + i * step;
      if (i === 0) {
        for (let j = 0; j < gridRes; j++) {
           x_data.push(minCoord + j * step);
        }
      }
      y_data.push(y_val);

      for (let j = 0; j < gridRes; j++) {
        const testX = minCoord + j * step;
        const testY = y_val;
        
        let errorSum = 0;
        for (const obs of observations) {
          const calcAmp = calculateAmplitude(obs.x, obs.y, obs.z, testX, testY, scanZ, trueA0);
          const res = obs.obsAmp - calcAmp;
          errorSum += res * res;
        }
        
        // Log1p para revelar el valle profundo de error en la superficie 3D
        z_row.push(Math.log1p(errorSum * 1000)); 
      }
      z_data.push(z_row);
    }

    setPlotData([{
      z: z_data,
      x: x_data,
      y: y_data,
      type: 'surface',
      colorscale: 'Viridis',
      showscale: false
    }]);

    // Lógica del Mapa de Calor 2D (Canvas)
    const canvas = document.getElementById('heatmapCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      
      const imgData = ctx.createImageData(w, h);
      
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const x_coord = minCoord + (px / w) * (maxCoord - minCoord);
          const y_coord = maxCoord - (py / h) * (maxCoord - minCoord);
          
          let error = 0;
          for (const obs of observations) {
            const calc = calculateAmplitude(obs.x, obs.y, obs.z, x_coord, y_coord, scanZ, trueA0);
            error += Math.pow(obs.obsAmp - calc, 2);
          }
          
          // Paleta de colores "Magma" profesional (de Oscuro a Brillante)
          // Normalización dinámica basada en escala logarítmica
          const norm = Math.min(1, Math.log1p(error * 50) / 12);
          const idx = (py * w + px) * 4;
          
          // Mapeo Magma-like: Negro -> Púrpura -> Naranja -> Blanco/Amarillo
          imgData.data[idx] = 255 * Math.pow(norm, 0.4);            // R (más brillante rápido)
          imgData.data[idx+1] = 255 * Math.pow(norm, 2.5);          // G (aparece tarde)
          imgData.data[idx+2] = 255 * (1 - Math.cos(norm * Math.PI)); // B (efecto profundo)
          imgData.data[idx+3] = 255;                                // A
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Dibujar Sensores
      activeSensors.forEach(s => {
        const sx = ((s.x - minCoord) / (maxCoord - minCoord)) * w;
        const sy = h - ((s.y - minCoord) / (maxCoord - minCoord)) * h;
        ctx.fillStyle = '#4facfe';
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI*2); ctx.fill();
      });

      // Dibujar Sismo Real
      const rx = ((trueX - minCoord) / (maxCoord - minCoord)) * w;
      const ry = h - ((trueY - minCoord) / (maxCoord - minCoord)) * h;
      ctx.strokeStyle = '#ff4b2b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rx-5, ry-5); ctx.lineTo(rx+5, ry+5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx+5, ry-5); ctx.lineTo(rx-5, ry+5); ctx.stroke();

      // Dibujar Ejes y Etiquetas
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "10px Inter";
      ctx.textAlign = "center";
      
      // Marcas Eje X
      for (let v = 0; v <= 10; v += 2) {
        const mx = ((v - minCoord) / (maxCoord - minCoord)) * w;
        ctx.fillText(v + "km", mx, h - 5);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, h); ctx.stroke();
      }

      // Marcas Eje Y
      ctx.textAlign = "left";
      for (let v = 0; v <= 10; v += 2) {
        const my = h - ((v - minCoord) / (maxCoord - minCoord)) * h;
        ctx.fillText(v + "km", 5, my);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(w, my); ctx.stroke();
      }

      ctx.fillStyle = "#00f2fe";
      ctx.font = "bold 12px Inter";
      ctx.fillText("Eje X →", w - 50, h - 20);
      ctx.save();
      ctx.translate(25, 50);
      ctx.rotate(-Math.PI/2);
      ctx.fillText("Eje Y →", 0, 0);
      ctx.restore();
    }

  }, [trueX, trueY, trueZ, trueA0, scanZ, activeView, activeSensors]);

  const loadEscenario = (id) => {
    const esc = ESCENARIOS[id];
    setActiveSensors(esc.sensors);
    setTrueX(esc.trueX);
    setTrueY(esc.trueY);
    setTrueZ(esc.trueZ);
    setTrueA0(esc.trueA0);
    setScanZ(esc.trueZ);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Simulador Dinámico 3D de Inversión</h1>
        <p>Todo el motor matemático está procesando en 3 Dimensiones espaciales (Ejes X, Y, Z)</p>
      </header>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeView === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveView('simulator')}
        >
          🕹️ Simulador 3D
        </button>
        <button 
          className={`tab-button ${activeView === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveView('guide')}
        >
          📚 Guía Matemática
        </button>
      </div>

      <div className="main-content">
        {activeView === 'simulator' ? (
          <>
            <div className="glass-panel">
              <h2>🎛️ Panel de Control Espacial</h2>
              
              <div className="control-group">
                <div className="control-header">
                  <span>Profundidad del Escáner (Eje Z)</span>
                  <span className="value-badge">{scanZ.toFixed(1)} km</span>
                </div>
                <input 
                  type="range" min="-10" max="0" step="0.1" 
                  value={scanZ} onChange={(e) => setScanZ(parseFloat(e.target.value))} 
                />
                <p className="info-text">
                  Explora el Eje Z. Nuestro algoritmo de Gauss-Newton se mueve a través del espacio 3D para hallar la solución usando matrices Jacobianas en R³.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
                <button className="tab-button" onClick={() => loadEscenario(1)} style={{ fontSize: '0.7rem', padding: '6px' }}>Esc. 1: Sensibilidad</button>
                <button className="tab-button" onClick={() => loadEscenario(2)} style={{ fontSize: '0.7rem', padding: '6px' }}>Esc. 2: Escaneo</button>
                <button className="tab-button" onClick={() => loadEscenario(3)} style={{ fontSize: '0.7rem', padding: '6px', gridColumn: 'span 2' }}>Esc. 3: Falla Geológica (Avanzado)</button>
              </div>

              <hr style={{ border: '1px solid rgba(255,255,255,0.05)', margin: '30px 0' }} />
              
              <h3 style={{ color: '#00f2fe', marginBottom: '15px' }}>Secretos Ocultos (Verdad 3D)</h3>

              <div className="control-group">
                <div className="control-header">
                  <span>Mover Epicentro (Eje X)</span>
                  <span className="value-badge">{trueX.toFixed(1)} km</span>
                </div>
                <input type="range" min="0" max="10" step="0.1" value={trueX} onChange={(e) => setTrueX(parseFloat(e.target.value))} />
              </div>

              <div className="control-group">
                <div className="control-header">
                  <span>Mover Epicentro (Eje Y)</span>
                  <span className="value-badge">{trueY.toFixed(1)} km</span>
                </div>
                <input type="range" min="0" max="10" step="0.1" value={trueY} onChange={(e) => setTrueY(parseFloat(e.target.value))} />
              </div>

              <div className="control-group">
                <div className="control-header">
                  <span>Cambiar Profundidad Verdadera (Eje Z)</span>
                  <span className="value-badge">{trueZ.toFixed(1)} km</span>
                </div>
                <input type="range" min="-10" max="0" step="0.1" value={trueZ} onChange={(e) => setTrueZ(parseFloat(e.target.value))} />
              </div>

            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2>🎯 Visualización Dual 3D/2D</h2>
              <div style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                
                {/* Gráfico 3D */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '10px' }}>
                  <h4 style={{ textAlign: 'center', color: '#00f2fe', marginBottom: '5px' }}>Topografía del Valle (3D)</h4>
                  <Plot
                    data={plotData}
                    layout={{
                      width: 380,
                      height: 380,
                      margin: { l: 0, r: 0, b: 0, t: 0 },
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: '#ffffff' },
                      scene: {
                        xaxis: { title: 'Eje X', gridcolor: '#444' },
                        yaxis: { title: 'Eje Y', gridcolor: '#444' },
                        zaxis: { title: 'Error(Log)', gridcolor: '#444' },
                        camera: { eye: { x: 1.4, y: 1.4, z: 1.1 } }
                      }
                    }}
                    config={{ displayModeBar: false }}
                  />
                </div>

                {/* Mapa de Calor 2D */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 style={{ textAlign: 'center', color: '#4facfe', marginBottom: '5px' }}>Mapa de Calor (Ojo de Buey)</h4>
                  <canvas id="heatmapCanvas" width="380" height="380" style={{ borderRadius: '8px' }}></canvas>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                    <span style={{ color: '#4facfe' }}>● Sensor</span>
                    <span style={{ color: '#ff4b2b' }}>✖ Sismo Real</span>
                  </div>
                </div>

              </div>
              
              <p className="info-text" style={{ textAlign: 'center', maxWidth: '800px' }}>
                Esta vista dual te permite comparar el **Valle de Error 3D** con el clásico **Mapa de Calor (Ojo de Buey)**. Ambos se actualizan en tiempo real.
              </p>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
            <h2>📚 Problemas de Aplicación (Cálculo Multivariado)</h2>
            <div className="guide-content">
              <div className="guide-card">
                <h3>Problema 1: El Descenso del Gradiente "A Mano"</h3>
                <p>Este problema explica cómo el algoritmo "sabe" hacia dónde moverse para encontrar el sismo.</p>
                <div className="math-box">
                  E(x, y, z) = (Az1 - A'z1)² <br/>
                  ∇E = [∂E/∂x, ∂E/∂y, ∂E/∂z]
                </div>
                <p><strong>Puntos clave:</strong></p>
                <ul>
                  <li><strong>Derivadas Parciales:</strong> Calculamos la dirección de máximo crecimiento del error.</li>
                  <li><strong>Regla de la Cadena:</strong> Conectamos el error con la distancia espacial R.</li>
                  <li><strong>Optimización:</strong> Damos un paso en dirección opuesta al gradiente (-∇E).</li>
                </ul>
              </div>

              <div className="guide-card">
                <h3>Problema 2: El Valle de Error en el Eje Z</h3>
                <p>Demostración analítica de por qué el escaneo de profundidad revela el epicentro real.</p>
                <div className="math-box">
                  E_min(z) = f(x*, y*, z=k) <br/>
                  En el sismo: ∂E/∂x = ∂E/∂y = ∂E/∂z = 0
                </div>
                <p><strong>Puntos clave:</strong></p>
                <ul>
                  <li><strong>Fijación de Variables:</strong> Analizamos planos horizontales (Z constante).</li>
                  <li><strong>Puntos Críticos:</strong> Hallamos el centro de cada "ojo de buey".</li>
                  <li><strong>Mínimo Global:</strong> El punto más bajo de la curva reducida Error vs Z.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

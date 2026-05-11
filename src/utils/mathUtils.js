/**
 * Seismic Wave Function f(x, y, t) - Galeras Scenario
 * f(x, y, t) = A * (cos(k * r - omega * t) / r) * e^(-b * r)
 */
export const seismicWaveGaleras = (x, y, t, source = { x: 0, y: 0 }, params = {}) => {
  const {
    amplitude = 5.0,    // A
    damping = 0.1,      // b (Atenuación)
    waveNumber = 1.5,   // k
    frequency = 2.0     // omega (Affected by magma viscosity)
  } = params;

  const dx = x - source.x;
  const dy = y - source.y;
  const r = Math.max(1.0, Math.sqrt(dx * dx + dy * dy)); // Epsilon to avoid singularity
  
  // Spherical body wave with exponential decay
  const z = amplitude * (Math.cos(waveNumber * r - frequency * t) / r) * Math.exp(-damping * r);
  
  return z;
};

/**
 * Noise Generator (Mausigno) with different profiles
 */
export const getNoiseProfile = (profile = 'low', baseLevel = 0.1) => {
  const multipliers = {
    low: 0.5,
    moderate: 1.5,
    critical: 4.0
  };
  const stdDev = baseLevel * (multipliers[profile] || 1);
  const u1 = Math.random();
  const u2 = Math.random();
  return stdDev * Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
};

/**
 * Bilinear Interpolation for Error Surface
 * Given 9 sensors in a 3x3 grid, we interpolate the error at (x, y)
 */
export const interpolateError = (x, y, sensors) => {
  // Simplification: Nearest Neighbor or weighted average for real-time mesh
  // For a 3x3 grid, we can use Inverse Distance Weighting (IDW)
  let totalWeight = 0;
  let weightedError = 0;
  
  sensors.forEach(s => {
    const dx = x - s.x;
    const dy = y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
    const weight = 1 / (dist * dist);
    
    weightedError += s.currentError * weight;
    totalWeight += weight;
  });
  
  return weightedError / totalWeight;
};

/**
 * Gradient Calculation ∇E
 * Returns the vector [dE/dx, dE/dy] at (x, y)
 */
export const calculateGradient = (x, y, sensors) => {
  const step = 0.5;
  const e0 = interpolateError(x, y, sensors);
  const ex = interpolateError(x + step, y, sensors);
  const ey = interpolateError(x, y + step, sensors);
  
  return {
    dx: (ex - e0) / step,
    dy: (ey - e0) / step
  };
};

/**
 * Export to CSV with Official Header
 */
/**
 * Export to Word (.doc) with Professional Formatting
 */
export const exportGalerasData = (sensors) => {
  const date = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  
  // HTML template that Word can interpret as a document
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Reporte de Análisis Microsísmico</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #f43f5e; padding-bottom: 10px; margin-bottom: 20px; }
        .title { color: #f43f5e; font-size: 24pt; font-weight: bold; margin: 0; }
        .subtitle { font-size: 14pt; color: #64748b; margin: 5px 0; }
        .meta-table { width: 100%; margin-bottom: 20px; font-size: 10pt; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: bold; color: #0f172a; }
        .data-table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 10pt; }
        .footer { margin-top: 40px; font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .status-badge { padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 8pt; }
        .critical { background-color: #fee2e2; color: #991b1b; }
        .stable { background-color: #dcfce7; color: #166534; }
      </style>
    </head>
    <body>
      <div class="header">
        <p class="title">SISMO-MONITOR 3D GALERAS</p>
        <p class="subtitle">Reporte de Análisis Microsísmico de Campo</p>
      </div>

      <table class="meta-table">
        <tr>
          <td><strong>Institución:</strong> Universidad Cooperativa de Colombia - Sede Pasto</td>
          <td align="right"><strong>Fecha/Hora:</strong> ${date}</td>
        </tr>
        <tr>
          <td><strong>Proyecto:</strong> Ingeniería - Cálculo Multivariado</td>
          <td align="right"><strong>Ubicación:</strong> Red de Monitoreo UCC-PASTO</td>
        </tr>
        <tr>
          <td><strong>Analista:</strong> Carlos Julián Benavides Burbano</td>
          <td align="right"><strong>Estado de Red:</strong> <span class="status-badge stable">OPERATIVO</span></td>
        </tr>
      </table>

      <h3 style="border-left: 5px solid #f43f5e; padding-left: 10px;">RESUMEN DE SENSORES (SNAPSHOT)</h3>
      <p style="font-size: 10pt;">A continuación se presentan los valores observados y el error calculado en la red de 9 sensores distribuidos en el eje del Volcán Galeras.</p>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID Sensor</th>
            <th>Coordenadas (X, Y)</th>
            <th>V. Observado (Dobs)</th>
            <th>Error Abs. (E)</th>
            <th>Perfil de Ruido</th>
          </tr>
        </thead>
        <tbody>
          ${sensors.map(s => `
            <tr>
              <td><strong>${s.label}</strong></td>
              <td>[${s.x.toFixed(1)}, ${s.y.toFixed(1)}]</td>
              <td>${s.currentVal.toFixed(6)}</td>
              <td style="color: ${s.currentError > 0.5 ? '#f43f5e' : '#0f172a'}">${s.currentError.toFixed(6)}</td>
              <td>${s.profile.toUpperCase()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; background-color: #f8fafc; padding: 15px; border-radius: 8px; font-size: 9pt; border: 1px solid #e2e8f0;">
        <strong>Nota Técnica:</strong> El error absoluto se calcula como E = |Dobs - Dideal|, donde Dideal es la solución de la función de onda esférica con decaimiento exponencial <i>f(x, y, t) = A * (cos(kr - &omega;t) / r) * e^(-br)</i>.
      </div>

      <div class="footer">
        Este documento es un reporte técnico generado por el sistema de simulación sísmica UCC. <br/>
        &copy; 2026 Carlos Julián Benavides Burbano - Ingeniería UCC Pasto
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_Sismico_Galeras_${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Inverse Model: Estimating Amplitude A using Least Squares
 */
export const estimateAmplitudeLS = (sensorSignals, sensorPositions, sourcePos, tHistory, waveParams) => {
  let sumDobsPhi = 0;
  let sumPhi2 = 0;
  const { damping: b, waveNumber: k, frequency: omega } = waveParams;

  sensorSignals.forEach((signal, sIndex) => {
    const pos = sensorPositions[sIndex];
    const dx = pos.x - sourcePos.x;
    const dy = pos.y - sourcePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

    signal.forEach((Dobs, tIndex) => {
      const t = tHistory[tIndex];
      const phi = Math.exp(-b * dist) * Math.cos(k * dist - omega * t);
      sumDobsPhi += Dobs * phi;
      sumPhi2 += phi * phi;
    });
  });

  if (sumPhi2 === 0) return 0;
  return sumDobsPhi / sumPhi2;
};

/**
 * Calculates Delta Error between two sensors
 */
export const calculateDeltaError = (ds1, z1, ds2, z2) => {
  const e1 = ds1 - z1;
  const e2 = ds2 - z2;
  return Math.abs(e1 - e2);
};

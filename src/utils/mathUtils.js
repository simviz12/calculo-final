/**
 * Seismic Attenuation Model - Equation (1) & (2)
 * Azi = A0 * (exp(-Ri) / Ri)
 * Ri = sqrt((xi-x0)^2 + (yi-y0)^2 + (zi-z0)^2)
 */
export const calculateSeismicAmplitude = (point, source, A0) => {
  const dx = point.x - source.x;
  const dy = point.y - source.y;
  const dz = (point.z || 0) - (source.z || 0);
  
  const R = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const R_safe = Math.max(0.1, R); // Avoid division by zero
  
  return A0 * (Math.exp(-R_safe) / R_safe);
};

/**
 * Noise Generator - Equation (3)
 * epsilon ~ N(0, sigma^2), where sigma = alpha * A_ideal
 */
export const getGaussianNoise = (idealAmplitude, alpha = 0.05) => {
  const sigma = alpha * idealAmplitude;
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  return z0 * sigma;
};

/**
 * Error Function Err - Equation (7)
 * Err = sum( (Azi - A'zi)^2 )
 */
export const calculateTotalError = (sensors, sourceCandidate, A0Candidate) => {
  return sensors.reduce((acc, sensor) => {
    const predicted = calculateSeismicAmplitude(
      { x: sensor.x, y: sensor.y, z: sensor.z || 0 },
      sourceCandidate,
      A0Candidate
    );
    const diff = sensor.currentVal - predicted;
    return acc + (diff * diff);
  }, 0);
};

/**
 * Bilinear Interpolation / IDW for Error Surface visualization
 */
export const interpolateError = (x, y, z, sensors) => {
  let totalWeight = 0;
  let weightedError = 0;
  
  sensors.forEach(s => {
    const dx = x - s.x;
    const dy = y - s.y;
    const dz = z - (s.z || 0);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
    const weight = 1 / (dist * dist);
    
    weightedError += s.currentError * weight;
    totalWeight += weight;
  });
  
  return weightedError / totalWeight;
};

/**
 * Export to Word (.doc) with updated model details
 */
export const exportGalerasData = (sensors, sourcePos, A0) => {
  const date = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Reporte de Análisis de Problema Inverso</title>
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
      </style>
    </head>
    <body>
      <div class="header">
        <p class="title">PROYECTO: LOCALIZACIÓN DE FUENTE SÍSMICA</p>
        <p class="subtitle">Análisis mediante Problema Inverso y Mínimos Cuadrados</p>
      </div>

      <table class="meta-table">
        <tr>
          <td><strong>Analista:</strong> Carlos Julián Benavides Burbano</td>
          <td align="right"><strong>Fecha:</strong> ${date}</td>
        </tr>
        <tr>
          <td><strong>Fuente Real (x0, y0, z0):</strong> [${sourcePos.x.toFixed(2)}, ${sourcePos.y.toFixed(2)}, ${sourcePos.z.toFixed(2)}]</td>
          <td align="right"><strong>Amplitud A0:</strong> ${A0.toFixed(2)}</td>
        </tr>
      </table>

      <h3 style="border-left: 5px solid #f43f5e; padding-left: 10px;">DATOS DE ESTACIONES (Azi)</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Estación</th>
            <th>Posición (xi, yi, zi)</th>
            <th>Amplitud Observada</th>
            <th>Error Cuadrático</th>
          </tr>
        </thead>
        <tbody>
          ${sensors.map(s => `
            <tr>
              <td>${s.label}</td>
              <td>[${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${(s.z || 0).toFixed(1)}]</td>
              <td>${s.currentVal.toFixed(6)}</td>
              <td>${(s.currentError ** 2).toFixed(6)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; background-color: #f8fafc; padding: 15px; border-radius: 8px; font-size: 9pt; border: 1px solid #e2e8f0;">
        <strong>Nota Metodológica:</strong> El modelo utiliza la ecuación de atenuación Azi = A0 * exp(-Ri)/Ri + epsilon. 
        Se busca minimizar la función de error Err = sum( (Azi - A'zi)^2 ) para estimar la posición de la fuente.
      </div>

      <div class="footer">
        Generado por Sistema de Simulación de Cálculo Multivariado - UCC Pasto
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_Problema_Inverso_${new Date().toISOString().slice(0,10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


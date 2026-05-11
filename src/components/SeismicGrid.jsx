import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seismicWaveGaleras, interpolateError, calculateGradient } from '../utils/mathUtils';

const SeismicGrid = ({ 
  source = { x: 0, y: 0 }, 
  waveParams = {}, 
  viewMode = 'wave', 
  showGradients = false,
  sensors = [] 
}) => {
  const meshRef = useRef();
  const gridResolution = 80;
  const gridRange = 32;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(gridRange, gridRange, gridResolution, gridResolution);
  }, []);

  const tempColor = useMemo(() => new THREE.Color(), []);
  const lastUpdateTime = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Performance Optimization: Update mesh every 2 frames to avoid lag
    if (t - lastUpdateTime.current < 0.03) return;
    lastUpdateTime.current = t;

    const posAttr = meshRef.current.geometry.attributes.position;
    const colorAttr = meshRef.current.geometry.attributes.color;
    
    if (!colorAttr) {
      meshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(posAttr.count * 3), 3));
    }
    
    const positions = posAttr.array;
    const colors = colorAttr ? colorAttr.array : new Float32Array(posAttr.count * 3);

    const isWaveMode = viewMode === 'wave';
    const damping = waveParams.damping;
    const { x: sx, y: sy } = source;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      const zWave = seismicWaveGaleras(x, y, t, source, waveParams);
      const baseHeight = (Math.sin(x * 0.15) * Math.cos(y * 0.15)) * 0.4;

      if (isWaveMode) {
        positions[i + 2] = baseHeight + zWave;
        // Ripple effect logic
        const dist = Math.sqrt((x - sx)**2 + (y - sy)**2);
        const ripple = Math.sin(dist * 0.5 - t * 2) * 0.15 + 0.1;
        colors[i] = 0.05 + ripple;
        colors[i + 1] = 0.1 + ripple;
        colors[i + 2] = 0.2 + ripple;
      } else {
        const zError = interpolateError(x, y, sensors) || 0;
        positions[i + 2] = baseHeight + zError * 2.5;
        const intensity = Math.min(1, Math.abs(zError) * 1.5);
        
        // Manual lerp for performance (avoiding Color object overhead)
        colors[i] = 0.23 + (0.94 - 0.23) * intensity; // Red channel
        colors[i + 1] = 0.51 + (0.27 - 0.51) * intensity; // Green channel
        colors[i + 2] = 0.96 + (0.16 - 0.96) * intensity; // Blue channel
      }
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
    // Only compute normals if in wave mode to save CPU
    if (isWaveMode) meshRef.current.geometry.computeVertexNormals();
  });

  // Gradient Analysis: Showing Energy Propagation (∇f)
  const arrows = useMemo(() => {
    if (!showGradients) return null;
    const items = [];
    const step = 4;
    for (let x = -12; x <= 12; x += step) {
      for (let y = -12; y <= 12; y += step) {
        // Simple radial gradient for energy propagation from source
        const dx = x - source.x;
        const dy = y - source.y;
        const angle = Math.atan2(dx, dy);
        items.push({ pos: [x, 0.5, -y], rotation: [0, angle, 0] });
      }
    }
    return items;
  }, [showGradients, source]);

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          vertexColors
          roughness={0.2}
          metalness={0.8}
          wireframe={viewMode === 'wave'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {showGradients && arrows && arrows.map((arrow, idx) => (
        <group key={idx} position={arrow.pos} rotation={arrow.rotation}>
          <mesh castShadow>
            <coneGeometry args={[0.08, 0.5, 6]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default SeismicGrid;

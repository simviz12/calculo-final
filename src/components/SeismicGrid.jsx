import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateSeismicAmplitude, interpolateError } from '../utils/mathUtils';

const SeismicGrid = ({ 
  source = { x: 0, y: 0, z: -2 }, 
  A0 = 10.0, 
  viewMode = 'wave', 
  sensors = [] 
}) => {
  const meshRef = useRef();
  const gridResolution = 60;
  const gridRange = 30;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(gridRange, gridRange, gridResolution, gridResolution);
  }, []);

  const lastUpdateTime = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (t - lastUpdateTime.current < 0.05) return;
    lastUpdateTime.current = t;

    const posAttr = meshRef.current.geometry.attributes.position;
    if (!posAttr) return;

    let colorAttr = meshRef.current.geometry.attributes.color;
    if (!colorAttr) {
      meshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(posAttr.count * 3), 3));
      colorAttr = meshRef.current.geometry.attributes.color;
    }
    
    const positions = posAttr.array;
    const colors = colorAttr.array;

    const isErrorMode = viewMode === 'error';

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      const baseHeight = (Math.sin(x * 0.2) * Math.cos(y * 0.2)) * 0.2;

      if (!isErrorMode) {
        // Amplitude mode: Show signal intensity at surface (z=0)
        const intensity = calculateSeismicAmplitude({ x, y, z: 0 }, source, A0);
        positions[i + 2] = baseHeight + intensity * 0.3;
        
        const normIntensity = Math.min(1, intensity / 2);
        colors[i] = 0.1 + normIntensity * 0.5;
        colors[i + 1] = 0.2 + normIntensity * 0.2;
        colors[i + 2] = 0.4 + normIntensity * 0.1;
      } else {
        // Error mode: Interpolate error between sensors
        const zError = interpolateError(x, y, 0, sensors) || 0;
        positions[i + 2] = baseHeight + zError * 2.0;
        
        const normError = Math.min(1, zError * 2.0);
        colors[i] = 0.1 + normError * 0.8;   // Red for high error
        colors[i + 1] = 0.3 * (1 - normError); 
        colors[i + 2] = 0.6 * (1 - normError);
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          vertexColors
          roughness={0.4}
          metalness={0.6}
          wireframe={viewMode === 'wave'}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default SeismicGrid;


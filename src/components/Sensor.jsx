import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

const Sensor = ({ position, color, label, intensity = 0, error = 0 }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const clampedIntensity = Math.min(3, Math.abs(intensity));
    const pulse = 1 + clampedIntensity * 0.4;
    
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.1);
    }
    
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 1.5);
      glowRef.current.opacity = 0.1 + Math.abs(intensity) * 0.2;
    }
  });

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={hovered ? 5 : 2} 
            metalness={1}
            roughness={0}
          />
        </mesh>

        <mesh ref={glowRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>

        {hovered && (
          <Html distanceFactor={10} position={[0, 0.8, 0]}>
            <div style={{
              background: 'rgba(2, 6, 23, 0.9)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              border: `1px solid ${color}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              minWidth: '140px',
              fontFamily: 'Inter'
            }}>
              <div style={{ fontWeight: 800, marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}>
                ESTACIÓN {label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>Amplitud (Azi):</span>
                <span style={{ fontWeight: 700 }}>{intensity.toFixed(4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f43f5e' }}>
                <span>Error Cuadrático:</span>
                <span style={{ fontWeight: 700 }}>{(error ** 2).toFixed(5)}</span>
              </div>
              <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '4px', textTransform: 'uppercase' }}>
                SISTEMA OPERATIVO
              </div>
            </div>
          </Html>
        )}

        {!hovered && (
          <Html distanceFactor={12} position={[0, -0.5, 0]}>
            <div style={{ color: 'white', fontSize: '9px', opacity: 0.6, fontWeight: 700 }}>{label}</div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export default Sensor;


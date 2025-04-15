import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { playClickSound } from '../SoundUtils';

// Floating button component
function Button({ position, color, icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Channel Base */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => {setHovered(false); setClicked(false);}}
        onPointerDown={() => setClicked(true)}
        onPointerUp={() => {
          setClicked(false);
          if (hovered && onClick) {
            playClickSound(); // Play click sound
            onClick();
          }
        }}
        castShadow
      >
        <boxGeometry args={[2, 2, 0.5]} />
        <meshStandardMaterial color={color || "#ffffff"} />
        
        {/* Channel Shadow */}
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[2, 2, 0.2]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.2} />
        </mesh>
        
        {/* Label */}
        {label && (
          <Text
            position={[0, 0, 0.3]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/assets/fonts/Nunito-Bold.ttf"
          >
            {label}
          </Text>
        )}
      </mesh>
    </group>
  );
}

export default Button;

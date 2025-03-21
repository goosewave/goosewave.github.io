import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { playWiiClickSound } from './SoundUtils';

// Simple Mii head component
export function MiiHead(props) {
  const headRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    // Gentle bobbing animation
    if (headRef.current) {
      headRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group 
      ref={headRef} 
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Head */}
      <mesh castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffe0bd" />
      </mesh>
    </group>
  );
}

// Wii-style floating channel/button
export function WiiChannel({ position, color, icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
      
      // Scale when hovered
      meshRef.current.scale.x = THREE.MathUtils.lerp(
        meshRef.current.scale.x,
        hovered ? 1.1 : 1,
        0.1
      );
      meshRef.current.scale.y = THREE.MathUtils.lerp(
        meshRef.current.scale.y,
        hovered ? 1.1 : 1,
        0.1
      );
      meshRef.current.scale.z = THREE.MathUtils.lerp(
        meshRef.current.scale.z,
        hovered ? 1.1 : 1,
        0.1
      );
      
      // Push down when clicked
      if (clicked) {
        meshRef.current.position.z = THREE.MathUtils.lerp(
          meshRef.current.position.z,
          position[2] - 0.2,
          0.1
        );
      } else {
        meshRef.current.position.z = THREE.MathUtils.lerp(
          meshRef.current.position.z,
          position[2],
          0.1
        );
      }
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
            playWiiClickSound(); // Play click sound
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

// Wii-style navigation menu
export function WiiMenu({ options, onSelect }) {
  return (
    <Float floatIntensity={0.5} rotationIntensity={0.2} speed={2}>
      <group>
        {options.map((option, index) => (
          <WiiChannel
            key={index}
            position={[index * 3 - (options.length - 1) * 1.5, 0, 0]}
            color={option.color}
            label={option.label}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </group>
    </Float>
  );
}
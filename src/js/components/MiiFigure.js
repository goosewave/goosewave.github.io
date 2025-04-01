import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSkinTone } from '../utils/ColorUtils';

function MiiFigure({ position = [0, 0, 0], color = '#ff0000', skinToneParams = null, isUserMii = false }) {
  const miiRef = useRef();
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(...position));
  const [nextMoveTime, setNextMoveTime] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const walkSpeed = 0.02;
  const rotationSpeed = 0.1;
  
  // Generate skin tone color using Lab color space
  const skinToneColor = useMemo(() => {
    if (skinToneParams) {
      // Use provided skin tone parameters
      return getSkinTone(skinToneParams.u, skinToneParams.v, skinToneParams.w);
    } else {
      // Generate random parameters for skin tone
      const u = Math.random(); // Lightness
      const v = Math.random(); // Green-Red undertone
      const w = Math.random(); // Blue-Yellow undertone
      return getSkinTone(u, v, w);
    }
  }, [skinToneParams]);
  
  // Generate consistent pants color based on shirt color (but different)
  const getPantsColor = () => {
    // Create a darker version of the shirt color
    const color3 = new THREE.Color(color);
    color3.offsetHSL(0.3, 0, -0.2); // Shift hue and darken
    return color3.getHexString();
  };
  
  const pantsColor = "#" + getPantsColor();
  
  useFrame((state) => {
    if (!miiRef.current) return;
    
    const currentPosition = miiRef.current.position;
    const time = state.clock.getElapsedTime();
    
    // Special effect for user's Mii - gentle floating
    if (isUserMii) {
      miiRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
      // Gentle rotation
      miiRef.current.rotation.y = Math.sin(time * 0.5) * 0.5;
      return; // Skip regular movement for user's Mii
    }
    
    // Decide if we need a new destination
    if (time > nextMoveTime) {
      if (isMoving) {
        // Stop moving for a while
        setIsMoving(false);
        setNextMoveTime(time + Math.random() * 3 + 1); // Stand still for 1-4 seconds
      } else {
        // Start moving to a new position
        const randomX = position[0] + (Math.random() * 20 - 10);
        const randomZ = position[2] + (Math.random() * 20 - 10);
        setTargetPosition(new THREE.Vector3(randomX, position[1], randomZ));
        setIsMoving(true);
        setNextMoveTime(time + Math.random() * 5 + 3); // Walk for 3-8 seconds
      }
    }
    
    if (isMoving) {
      // Calculate direction to target
      const direction = new THREE.Vector3().subVectors(targetPosition, currentPosition).normalize();
      
      // Move toward target
      currentPosition.x += direction.x * walkSpeed;
      currentPosition.z += direction.z * walkSpeed;
      
      // Bounce effect while walking
      miiRef.current.position.y = position[1] + Math.abs(Math.sin(time * 5)) * 0.1;
      
      // Rotate to face direction of movement
      const targetRotation = Math.atan2(direction.x, direction.z);
      miiRef.current.rotation.y = THREE.MathUtils.lerp(
        miiRef.current.rotation.y,
        targetRotation,
        rotationSpeed
      );
    }
  });
  
  // Scale factor for user's Mii
  const scale = isUserMii ? 1.5 : 1;
  
  return (
    <group ref={miiRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head with random skin tone */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={skinToneColor} />
      </mesh>
      
      {/* Legs - with consistent pants color */}
      <mesh position={[-0.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      <mesh position={[0.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.3, 0.7, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.3, 0.7, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default MiiFigure;

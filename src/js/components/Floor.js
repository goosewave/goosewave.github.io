import React from 'react';
import * as THREE from 'three';

// Floor component with proper grid orientation
function Floor() {
  return (
    <group>
      {/* The main floor plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Grid helper - separate from the floor plane */}
      <gridHelper 
        args={[100, 100, '#cccccc', '#eeeeee']} 
        position={[0, -0.49, 0]} 
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

export default Floor;

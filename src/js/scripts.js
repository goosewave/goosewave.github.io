import React, { useState, useRef, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera, Sky } from '@react-three/drei';
import { MiiHead, WiiMenu } from './WiiComponents';
import * as THREE from 'three';
import '../css/styles.css';

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

function MiiFigure({ position = [0, 0, 0], color = '#ff0000' }) {
  const miiRef = useRef();
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(...position));
  const [nextMoveTime, setNextMoveTime] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const walkSpeed = 0.02;
  const rotationSpeed = 0.1;
  
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
  
  return (
    <group ref={miiRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffe0bd" />
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

// Setup camera with Mii Channel view
function MiiChannelCamera() {
  const { camera } = useThree();
  
  React.useEffect(() => {
    // Set camera to a position that looks at the scene from a tilted angle
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

// Main App component
function App() {
  const [activeSection, setActiveSection] = useState('miiChannel');
  
  // Generate random colors for Mii figures
  const getRandomColor = () => {
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Generate random positions for Mii figures
  const generateMiiPositions = (count) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 30 - 15;
      const z = Math.random() * 30 - 15;
      positions.push({
        id: i,
        position: [x, 0, z],
        color: getRandomColor()
      });
    }
    return positions;
  };
  
  const miiPositions = generateMiiPositions(30); // 15 Mii figures
  
  return (
    <Canvas 
      shadows
      gl={{ 
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: true
      }}
    >
      {/* Scene background color - Wii-like blue */}
      <color attach="background" args={['#87CEEB']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Sky sunPosition={[100, 20, 100]} />
      
      {/* Custom camera setup */}
      <MiiChannelCamera />
      
      {/* Scene content */}
      <Suspense fallback={null}>
        {activeSection === 'miiChannel' && (
          <>
            <Floor />
            {/* Mii figures walking around */}
            {miiPositions.map((mii) => (
              <MiiFigure 
                key={mii.id} 
                position={mii.position} 
                color={mii.color} 
              />
            ))}
            
            {/* Title text */}
            <Text
              font="/assets/fonts/Nunito-Bold.ttf"
              fontSize={2}
              position={[0, 8, -10]}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Lucas Poirier
            </Text>
            <Text
              font="/assets/fonts/Nunito-Regular.ttf"
              fontSize={1}
              position={[0, 6, -10]}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Portfolio
            </Text>
            
            {/* Navigation Menu */}
            <group position={[0, 2, -18]}>
              <WiiMenu 
                options={[
                  { id: 'about', label: 'About', color: '#ffaa00' },
                  { id: 'projects', label: 'Projects', color: '#00aaff' },
                  { id: 'contact', label: 'Contact', color: '#ff00aa' },
                ]} 
                onSelect={(section) => setActiveSection(section)}
              />
            </group>
          </>
        )}
        
        {/* Other sections can be added here */}
      </Suspense>
      
      {/* Limited controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, 2, 0]}
      />
    </Canvas>
  );
}

// Mount the React app when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  
  const root = createRoot(container);
  root.render(<App />);
});
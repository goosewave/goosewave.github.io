import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function KeyboardControls({ controlsRef }) {
  const { camera } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.1;
  const boostMultiplier = 2.0; // Speed multiplier when shift is pressed
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const friction = 0.9;
  
  // Simple keyboard listener setup
  useEffect(() => {
    const handleKeyDown = (e) => { 
      keys.current[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e) => { 
      keys.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Configure OrbitControls and handle shift key for mouse button mapping
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enablePan = false;
      controlsRef.current.enableZoom = false;
      
      // Initial mouse button configuration
      updateMouseButtons(false);
      
      // Function to update mouse buttons based on shift key state
      function updateMouseButtons(isShiftPressed) {
        if (controlsRef.current) {
          if (isShiftPressed) {
            // When shift is pressed, use right button for rotation
            controlsRef.current.mouseButtons = {
              LEFT: THREE.MOUSE.NONE,
              MIDDLE: THREE.MOUSE.NONE,
              RIGHT: THREE.MOUSE.ROTATE
            };
          } else {
            // Normal state: use left button for rotation
            controlsRef.current.mouseButtons = {
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.NONE,
              RIGHT: THREE.MOUSE.NONE
            };
          }
        }
      }
      
      // Add event listeners for shift key
      const handleKeyDown = (e) => {
        if (e.key.toLowerCase() === 'shift') {
          updateMouseButtons(true);
        }
      };
      
      const handleKeyUp = (e) => {
        if (e.key.toLowerCase() === 'shift') {
          updateMouseButtons(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [controlsRef]);
  
  useFrame(() => {
    if (!controlsRef.current) return;
    
    // Get the forward and right vectors
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    // Apply camera rotation to get correct directions
    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);
    
    // Make movement horizontal
    forward.y = 0;
    right.y = 0;
    
    if (forward.length() > 0) forward.normalize();
    if (right.length() > 0) right.normalize();
    
    // Check if shift is pressed for speed boost
    const isBoostActive = keys.current['shift'];
    
    // Calculate the actual movement speed with boost if applicable
    const currentSpeed = isBoostActive ? moveSpeed * boostMultiplier : moveSpeed;
    
    // Calculate desired movement direction
    const direction = new THREE.Vector3(0, 0, 0);
    
    if (keys.current['w']) direction.add(forward.clone().multiplyScalar(currentSpeed));
    if (keys.current['s']) direction.add(forward.clone().multiplyScalar(-currentSpeed));
    if (keys.current['a']) direction.add(right.clone().multiplyScalar(-currentSpeed));
    if (keys.current['d']) direction.add(right.clone().multiplyScalar(currentSpeed));
    
    // Handle vertical movement with E and Q
    let verticalMovement = 0;
    if (keys.current['e']) verticalMovement = currentSpeed;    // E to go up
    if (keys.current['q']) verticalMovement = -currentSpeed;   // Q to go down
    
    // Update velocity with momentum
    if (direction.length() > 0) {
      velocity.current.x = direction.x;
      velocity.current.z = direction.z;
    } else {
      velocity.current.x *= friction;
      velocity.current.z *= friction;
    }
    
    // Handle vertical momentum separately
    if (verticalMovement !== 0) {
      velocity.current.y = verticalMovement;
    } else {
      velocity.current.y *= friction;
    }
    
    // Stop very small movements
    if (Math.abs(velocity.current.x) < 0.001) velocity.current.x = 0;
    if (Math.abs(velocity.current.y) < 0.001) velocity.current.y = 0;
    if (Math.abs(velocity.current.z) < 0.001) velocity.current.z = 0;
    
    // Apply velocity to camera position
    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;
    camera.position.y += velocity.current.y;
    
    // Flood boundary
    if (camera.position.y < 1) {
      camera.position.y = 1;
      velocity.current.y = 0;
    }

    // Ceiling boundary
    if (camera.position.y > 20) {
      camera.position.y = 20;
      velocity.current.y = 0;
    }

    // Left boundary
    if (camera.position.x < -50) {
      camera.position.x = -50;
      velocity.current.x = 0;
    }

    // Right boundary
    if (camera.position.x > 50) {
      camera.position.x = 50;
      velocity.current.x = 0;
    }

    // Back boundary
    if (camera.position.z < -50) {
      camera.position.z = -50;
      velocity.current.z = 0;
    }

    // Front boundary
    if (camera.position.z > 50) {
      camera.position.z = 50;
      velocity.current.z = 0;
    }
    
    // Update the OrbitControls target to be in front of the camera
    const lookDistance = 5; 
    const lookForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    controlsRef.current.target.copy(
      camera.position.clone().add(lookForward.multiplyScalar(lookDistance))
    );
  });
  
  return null;
}

export default KeyboardControls;

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a custom event for speed changes
const SPEED_CHANGE_EVENT = 'speed-multiplier-change';

function KeyboardControls({ controlsRef }) {
  const { camera } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.1;
  const speedMultiplier = useRef(1.0); // Default speed multiplier
  const minSpeedMultiplier = 0.5; // Minimum speed multiplier
  const maxSpeedMultiplier = 3.0; // Maximum speed multiplier
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const friction = 0.9;
  const acceleration = 0.05; // Reduced acceleration (half of the original)
  const altKeyPressed = useRef(false);
  
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
  
  // Configure OrbitControls and handle mouse button mapping
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enablePan = false;
      controlsRef.current.enableZoom = false;
      
      // Initial mouse button configuration
      updateMouseButtons(false);
      
      // Function to update mouse buttons based on alt key state
      function updateMouseButtons(isAltPressed) {
        if (controlsRef.current) {
          if (isAltPressed) {
            // When alt is pressed, use left button for rotation (for trackpad users)
            controlsRef.current.mouseButtons = {
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.NONE,
              RIGHT: THREE.MOUSE.NONE
            };
          } else {
            // Normal state: use middle button for rotation
            controlsRef.current.mouseButtons = {
              LEFT: THREE.MOUSE.NONE,
              MIDDLE: THREE.MOUSE.ROTATE,
              RIGHT: THREE.MOUSE.NONE
            };
          }
        }
      }
      
      // Add event listeners for alt key
      const handleKeyDown = (e) => {
        if (e.key.toLowerCase() === 'alt') {
          altKeyPressed.current = true;
          updateMouseButtons(true);
        }
      };
      
      const handleKeyUp = (e) => {
        if (e.key.toLowerCase() === 'alt') {
          altKeyPressed.current = false;
          updateMouseButtons(false);
        }
      };
      
      // Add scroll wheel event listener for speed modulation
      const handleWheel = (e) => {
        // Adjust speed multiplier based on scroll direction
        // Negative deltaY means scrolling up, positive means scrolling down
        const delta = -Math.sign(e.deltaY) * 0.1; // Small increment/decrement
        
        // Update speed multiplier within bounds
        const newMultiplier = Math.max(
          minSpeedMultiplier,
          Math.min(maxSpeedMultiplier, speedMultiplier.current + delta)
        );
        
        speedMultiplier.current = newMultiplier;
        
        // Dispatch a custom event with the new multiplier value
        window.dispatchEvent(new CustomEvent(SPEED_CHANGE_EVENT, { 
          detail: { multiplier: newMultiplier } 
        }));
        
        // Prevent default scrolling behavior
        e.preventDefault();
      };
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('wheel', handleWheel);
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
    
    // Calculate the actual movement speed with current multiplier
    const currentSpeed = moveSpeed * speedMultiplier.current;
    
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
    
    // Update velocity with gradual acceleration
    if (direction.length() > 0) {
      // Gradually approach the target velocity
      velocity.current.x += (direction.x - velocity.current.x) * acceleration;
      velocity.current.z += (direction.z - velocity.current.z) * acceleration;
    } else {
      // Apply friction when no keys are pressed
      velocity.current.x *= friction;
      velocity.current.z *= friction;
    }
    
    // Handle vertical momentum separately with gradual acceleration
    if (verticalMovement !== 0) {
      // Gradually approach the target vertical velocity
      velocity.current.y += (verticalMovement - velocity.current.y) * acceleration;
    } else {
      // Apply friction when no keys are pressed
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
    // Reduced lookDistance from 5 to 2 to bring the orbit point closer to the camera
    const lookDistance = 0.1; 
    const lookForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    controlsRef.current.target.copy(
      camera.position.clone().add(lookForward.multiplyScalar(lookDistance))
    );
  });
  
  return null;
}

export default KeyboardControls;

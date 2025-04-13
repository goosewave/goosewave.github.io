import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a custom event for speed changes
const SPEED_CHANGE_EVENT = 'speed-multiplier-change';

function KeyboardControls({ controlsRef }) {
  const { camera } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.2;
  const speedMultiplier = useRef(1.0); // Default speed multiplier
  const minSpeedMultiplier = 0.5; // Minimum speed multiplier
  const maxSpeedMultiplier = 3.0; // Maximum speed multiplier
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const friction = 0.9;
  const acceleration = 0.05; // Reduced acceleration (half of the original)
  
  // Mouse movement state for camera rotation
  const mousePosition = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const isAltPressed = useRef(false);
  const rotationSpeed = 0.002; // Base rotation speed
  const maxRotationMultiplier = 2.0; // Maximum rotation speed multiplier
  const initialMousePosition = useRef({ x: 0, y: 0 }); // Store initial mouse position when MMB is pressed
  const currentMousePosition = useRef({ x: 0, y: 0 }); // Store current mouse position
  
  // Rotational physics
  const rotationalVelocity = useRef(new THREE.Vector2(0, 0)); // x for horizontal, y for vertical
  const rotationalAcceleration = 0.1; // How quickly rotation accelerates
  const rotationalFriction = 0.9; // How quickly rotation slows down
  
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
  
  // Configure direct camera rotation with mouse
  useEffect(() => {
    // Disable OrbitControls if it exists
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    // Handle mouse down events
    const handleMouseDown = (e) => {
      // Middle mouse button (button 1) or left mouse button with Alt key
      if (e.button === 1 || (e.button === 0 && isAltPressed.current)) {
        isMouseDown.current = true;
        // Store initial mouse position when MMB is pressed
        initialMousePosition.current = { x: e.clientX, y: e.clientY };
        currentMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    // Handle mouse up events
    const handleMouseUp = (e) => {
      // Middle mouse button (button 1) or left mouse button
      if (e.button === 1 || e.button === 0) {
        isMouseDown.current = false;
      }
    };
    
    // Handle mouse move events for camera rotation
    const handleMouseMove = (e) => {
      if (isMouseDown.current) {
        // Update current mouse position
        currentMousePosition.current = { x: e.clientX, y: e.clientY };
        
        // Calculate mouse movement delta
        const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        // Store mouse position for rotation calculation in useFrame
        mousePosition.current = { x: deltaX, y: deltaY };
      }
    };
    
    // Handle key events for Alt key (for trackpad users)
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'alt') {
        isAltPressed.current = true;
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'alt') {
        isAltPressed.current = false;
      }
    };
    
    // Add event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlsRef]);
  
  // Configure scroll wheel for speed modulation
  useEffect(() => {
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
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  
  useFrame(() => {
    // Handle camera rotation with acceleration
    if (isMouseDown.current && mousePosition.current) {
      const { x: deltaX, y: deltaY } = mousePosition.current;
      
      // Reset mouse position after checking
      mousePosition.current = { x: 0, y: 0 };
      
      // Calculate distance from initial position to current position
      const distanceX = currentMousePosition.current.x - initialMousePosition.current.x;
      const distanceY = currentMousePosition.current.y - initialMousePosition.current.y;
      
      // Calculate Euclidean distance (pythagoras)
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Calculate rotation multiplier based on distance (max 2x at farthest point)
      // We'll use a simple scaling factor based on screen size
      // Assuming a typical screen, 1000px distance would reach max multiplier
      const screenScaleFactor = 1000;
      const rotationMultiplier = Math.min(
        1 + (distance / screenScaleFactor) * (maxRotationMultiplier - 1),
        maxRotationMultiplier
      );
      
      // Update rotational velocity based on mouse movement and distance-based multiplier
      if (deltaX !== 0 || deltaY !== 0) {
        // Gradually accelerate rotation with distance-based multiplier
        rotationalVelocity.current.x += (-deltaX * rotationSpeed * rotationMultiplier - rotationalVelocity.current.x) * rotationalAcceleration;
        rotationalVelocity.current.y += (-deltaY * rotationSpeed * rotationMultiplier - rotationalVelocity.current.y) * rotationalAcceleration;
      }
    }
    
    // Apply rotational friction when no mouse movement or mouse is up
    if (!isMouseDown.current || (mousePosition.current.x === 0 && mousePosition.current.y === 0)) {
      rotationalVelocity.current.x *= rotationalFriction;
      rotationalVelocity.current.y *= rotationalFriction;
    }
    
    // Stop very small rotational movements
    if (Math.abs(rotationalVelocity.current.x) < 0.0001) rotationalVelocity.current.x = 0;
    if (Math.abs(rotationalVelocity.current.y) < 0.0001) rotationalVelocity.current.y = 0;
    
    // Apply rotational velocity to camera
    if (rotationalVelocity.current.x !== 0) {
      const horizontalRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), // Y axis
        rotationalVelocity.current.x
      );
      camera.quaternion.premultiply(horizontalRotation);
    }
    
    if (rotationalVelocity.current.y !== 0) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const verticalRotation = new THREE.Quaternion().setFromAxisAngle(
        right,
        rotationalVelocity.current.y
      );
      camera.quaternion.premultiply(verticalRotation);
    }
    
    // Normalize quaternion to prevent drift
    if (rotationalVelocity.current.x !== 0 || rotationalVelocity.current.y !== 0) {
      camera.quaternion.normalize();
    }
    
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
    
    // Apply velocity directly to camera position (no damping)
    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;
    camera.position.y += velocity.current.y;
    
    // Apply position boundaries directly to camera position
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
    
    // No need to update OrbitControls target since we're using direct camera rotation
  });
  
  return null;
}

export default KeyboardControls;

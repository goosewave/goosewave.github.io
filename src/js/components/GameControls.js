import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a custom event for speed changes
const SPEED_CHANGE_EVENT = 'speed-multiplier-change';

function GameControls({ isPaused, setPaused, controlsRef }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const moveSpeed = 0.2;
  const speedMultiplier = useRef(1.0); // Default speed multiplier
  const minSpeedMultiplier = 0.5; // Minimum speed multiplier
  const maxSpeedMultiplier = 3.0; // Maximum speed multiplier
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const friction = 0.9;
  const acceleration = 0.05;
  
  // Mouse movement state for camera rotation
  const rotationSpeed = 0.002; // Base rotation speed
  const rotationalVelocity = useRef(new THREE.Vector2(0, 0)); // x for horizontal, y for vertical
  const rotationalAcceleration = 0.1; // How quickly rotation accelerates
  const rotationalFriction = 0.9; // How quickly rotation slows down
  
  // Pointer lock state
  const isLocked = useRef(false);
  
  // Setup pointer lock and keyboard controls
  useEffect(() => {
    const canvas = gl.domElement;
    
    // Handle pointer lock changes
    const handleLockChange = () => {
      const wasLocked = isLocked.current;
      isLocked.current = document.pointerLockElement === canvas;
      
      // If we were locked and now we're not, show the pause menu
      if (wasLocked && !isLocked.current) {
        setPaused(true);
      }
      // If we were paused and now we're locked, unpause
      else if (isPaused && isLocked.current) {
        setPaused(false);
      }
    };
    
    // Handle key down events
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    
    // Handle key up events
    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    
    // Handle mouse movement for camera rotation when pointer is locked
    const handleMouseMove = (e) => {
      if (isLocked.current && !isPaused) {
        // Calculate mouse movement delta
        const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        // Update rotational velocity based on mouse movement
        if (deltaX !== 0 || deltaY !== 0) {
          rotationalVelocity.current.x += (-deltaX * rotationSpeed - rotationalVelocity.current.x) * rotationalAcceleration;
          rotationalVelocity.current.y += (-deltaY * rotationSpeed - rotationalVelocity.current.y) * rotationalAcceleration;
        }
      }
    };
    
    // Click handler to request pointer lock
    const handleCanvasClick = () => {
      if (!isPaused && !isLocked.current) {
        canvas.requestPointerLock();
      }
    };
    
    // Add event listeners
    document.addEventListener('pointerlockchange', handleLockChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gl, isPaused, setPaused]);
  
  // Handle pointer lock based on pause state
  useEffect(() => {
    if (isPaused && isLocked.current) {
      // Exit pointer lock when paused
      document.exitPointerLock();
    }
  }, [isPaused]);
  
  // Configure scroll wheel for speed modulation
  useEffect(() => {
    // Add scroll wheel event listener for speed modulation
    const handleWheel = (e) => {
      if (isPaused) return; // Don't change speed when paused
      
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
  }, [isPaused]);
  
  // Disable OrbitControls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  }, [controlsRef]);
  
  // Game loop
  useFrame(() => {
    if (isPaused) {
      // When paused, zero out velocities to stop movement
      velocity.current.set(0, 0, 0);
      rotationalVelocity.current.set(0, 0);
      return;
    }
    
    // Apply rotational friction
    rotationalVelocity.current.x *= rotationalFriction;
    rotationalVelocity.current.y *= rotationalFriction;
    
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
    
    // Apply velocity directly to camera position
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
  });
  
  return null;
}

export default GameControls;

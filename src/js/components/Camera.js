import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Setup camera with Abstra Channel view
function Camera() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set camera to a position that looks at the scene from a tilted angle
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

export default Camera;

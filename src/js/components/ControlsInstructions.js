import React, { useState, useEffect } from 'react';

function ControlsInstructions() {
  const [visible, setVisible] = useState(true);
  
  // Hide instructions after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Hide instructions when user clicks
  useEffect(() => {
    const handleClick = () => {
      setVisible(false);
    };
    
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      maxWidth: '400px',
      textAlign: 'center',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{ margin: '0 0 15px 0', color: '#4fc3f7' }}>Controls</h2>
      <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
        <li><strong>Left-click and drag</strong> to look around</li>
        <li><strong>Right-click and drag</strong> when holding Shift</li>
        <li><strong>WASD</strong> to move</li>
        <li><strong>E/Q</strong> to move up/down</li>
        <li><strong>Hold Shift</strong> to move faster</li>
      </ul>
    </div>
  );
}

export default ControlsInstructions;

import React, { useState, useEffect } from 'react';

// Import the same event name constant
const SPEED_CHANGE_EVENT = 'speed-multiplier-change';

function SpeedIndicator() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    // Function to handle the speed change event
    const handleSpeedChange = (event) => {
      setMultiplier(event.detail.multiplier);
      setOpacity(1); // Reset opacity to fully visible
      setVisible(true);
      
      // Start fade out after 2 seconds
      const fadeTimer = setTimeout(() => {
        setOpacity(0); // Start fading out
      }, 2000);
      
      // Hide the element completely after fade completes
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 2500); // 2000ms delay + 500ms for fade
      
      // Clear both timers if the event fires again
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    };
    
    // Add event listener
    window.addEventListener(SPEED_CHANGE_EVENT, handleSpeedChange);
    
    // Clean up
    return () => {
      window.removeEventListener(SPEED_CHANGE_EVENT, handleSpeedChange);
    };
  }, []);
  
  // Don't render anything if not visible
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // More translucent background
      color: 'white',
      padding: '20px 30px', // Double the padding for larger size
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px', // Double the font size
      zIndex: 1000,
      boxShadow: '0 0 15px rgba(0,0,0,0.5)',
      opacity: opacity,
      transition: 'opacity 0.5s ease' // Smooth fade transition
    }}>
      <span style={{ 
        color: 'white', 
        opacity: 1 // Ensure text remains fully opaque
      }}>
        {multiplier.toFixed(1)}x
      </span>
    </div>
  );
}

export default SpeedIndicator;

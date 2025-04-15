import React, { useState, useEffect } from 'react';

function PauseMenu({ isPaused, onClick, user, hasAbstra, onCustomize, onSignOut }) {
  const [isResumeAvailable, setIsResumeAvailable] = useState(false);
  
  // Timer effect when paused
  useEffect(() => {
    if (isPaused) {
      setIsResumeAvailable(false);
      const timer = setTimeout(() => {
        setIsResumeAvailable(true);
      }, 1250);
      return () => clearTimeout(timer);
    }
  }, [isPaused]);
  
  // Handle resume button click
  const handleResumeClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (isResumeAvailable) {
      onClick(); // This sets isPaused to false
      
      // Request pointer lock immediately
      try {
        const canvas = document.querySelector('canvas');
        if (canvas && document.pointerLockElement !== canvas) {
          canvas.requestPointerLock();
        }
      } catch (error) {
        console.warn("Could not request pointer lock:", error);
      }
    }
  };
  
  if (!isPaused) return null;
  
  return (
    <div className="pause-menu">
      <div className="pause-overlay"></div>
      <div className="pause-content">
        <h1 className="pause-title">PAUSED</h1>
        <div className="resume-container">
          <div className={`resume-loader ${isResumeAvailable ? 'complete' : ''}`}>
            <svg width="60" height="60" viewBox="-25 -25 250 250" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{transform: 'rotate(-90deg)'}}>
              {/* Progress circle */}
              <circle 
                className="progress-circle" 
                r="90" 
                cx="100" 
                cy="100" 
                stroke="#ffffff" 
                strokeWidth="16px" 
                strokeLinecap="round" 
                fill="transparent" 
                strokeDasharray="565.48px"
              ></circle>
            </svg>
          </div>
          <button 
            className={`resume-button ${isResumeAvailable ? 'available' : ''}`}
            onClick={handleResumeClick}
          >
            Resume
          </button>
        </div>
        
        {/* User controls - only shown when paused and user is logged in */}
        {user && (
          <div className="user-controls">
            {hasAbstra && (
              <button className="button customise-button" onClick={onCustomize} style={{ marginRight: '10px' }}>
                Customise Abstra
              </button>
            )}
            <button className="button sign-out-button" onClick={onSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PauseMenu;

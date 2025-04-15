// SoundUtils.js - Utility functions for handling sounds
export const playClickSound = () => {
  const clickSound = document.getElementById('click-sound');
  if (clickSound) {
    // Reset the audio to the beginning if it's already playing
    clickSound.pause();
    clickSound.currentTime = 0;
    
    // Play the click sound
    clickSound.play().catch(e => console.log('Audio play failed:', e));
  }
};

// You can add more sound utility functions here

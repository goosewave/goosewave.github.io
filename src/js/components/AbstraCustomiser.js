import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import supabase from '../utils/supabaseClient';
import { getSkinTone } from '../utils/ColorUtils';

// Simple Abstra head component for the customizer
function CustomizableAbstraHead({ skinToneParams }) {
  const headRef = useRef();
  const { u, v, w } = skinToneParams;
  const skinToneColor = getSkinTone(u, v, w);
  
  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={skinToneColor} />
      </mesh>
    </group>
  );
}

// AbstraCustomiser component
function AbstraCustomiser({ user, existingAbstra = null, onComplete }) {
  // Initialize with default values or existing Abstra values if available
  const [skinToneParams, setSkinToneParams] = useState(
    existingAbstra 
      ? {
          u: existingAbstra.skin_tone_u,
          v: existingAbstra.skin_tone_v,
          w: existingAbstra.skin_tone_w
        }
      : { u: 0.5, v: 0.5, w: 0.5 }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [abstraData, setAbstraData] = useState(existingAbstra);
  
  // If existingAbstra prop changes, update the state
  useEffect(() => {
    if (existingAbstra) {
      setAbstraData(existingAbstra);
      setSkinToneParams({
        u: existingAbstra.skin_tone_u,
        v: existingAbstra.skin_tone_v,
        w: existingAbstra.skin_tone_w
      });
    }
  }, [existingAbstra]);
  
  // Handle slider changes
  const handleSliderChange = (param, value) => {
    setSkinToneParams(prev => ({
      ...prev,
      [param]: value / 100
    }));
  };
  
  // Save Abstra customization to database
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (abstraData) {
        // Update existing Abstra
        response = await supabase
          
          .from('abstras')
          .update({
            skin_tone_u: skinToneParams.u,
            skin_tone_v: skinToneParams.v,
            skin_tone_w: skinToneParams.w,
            updated_at: new Date()
          })
          .eq('id', abstraData.id);
      } else {
        // Create new Abstra
        response = await supabase
          
          .from('abstras')
          .insert([{
            user_id: user.id,
            skin_tone_u: skinToneParams.u,
            skin_tone_v: skinToneParams.v,
            skin_tone_w: skinToneParams.w
          }]);
      }
      
      if (response.error) {
        throw response.error;
      }
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving Abstra:', error);
      setError('Failed to save your Abstra. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel/close
  const handleCancel = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <div className="abstra-customizer">
      <div className="customizer-header">
        <h2 className="title">Customise Your Abstra</h2>
        <button 
          className="close-button"
          onClick={handleCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      {error && <div className="auth-error">{error}</div>}
      
      <div className="customizer-container">
        <div className="customizer-preview">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 50 }}
            style={{ height: 300, width: '100%', background: '#87CEEB' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <CustomizableAbstraHead skinToneParams={skinToneParams} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
        
        <div className="customizer-controls">
          <div className="slider-group">
            <label>Light ↔ Dark</label>
            <input
              type="range"
              min="0"
              max="100"
              value={skinToneParams.u * 100}
              onChange={(e) => handleSliderChange('u', parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="slider-group">
            <label>Cool/Pink ↔ Warm/Red</label>
            <input
              type="range"
              min="0"
              max="100"
              value={skinToneParams.v * 100}
              onChange={(e) => handleSliderChange('v', parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="slider-group">
            <label>More Blue ↔ More Yellow</label>
            <input
              type="range"
              min="0"
              max="100"
              value={skinToneParams.w * 100}
              onChange={(e) => handleSliderChange('w', parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <button 
            className="button save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : abstraData ? 'Update Abstra' : 'Save Abstra'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AbstraCustomiser;

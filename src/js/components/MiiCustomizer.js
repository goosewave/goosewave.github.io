import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import supabase from '../utils/supabaseClient';
import { getSkinTone } from '../utils/ColorUtils';

// Simple Mii head component for the customizer
function CustomizableMiiHead({ skinToneParams }) {
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
      
      {/* Eyes */}
      <mesh position={[0.3, 0.1, 0.85]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.3, 0.1, 0.85]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[0.3, 0.1, 0.98]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.3, 0.1, 0.98]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, -0.3, 0.85]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#cc6666" />
      </mesh>
    </group>
  );
}

// MiiCustomizer component
function MiiCustomizer({ user, existingMii = null, onComplete }) {
  // Initialize with default values or existing Mii values if available
  const [skinToneParams, setSkinToneParams] = useState(
    existingMii 
      ? {
          u: existingMii.skin_tone_u,
          v: existingMii.skin_tone_v,
          w: existingMii.skin_tone_w
        }
      : { u: 0.5, v: 0.5, w: 0.5 }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [miiData, setMiiData] = useState(existingMii);
  
  // If existingMii prop changes, update the state
  useEffect(() => {
    if (existingMii) {
      setMiiData(existingMii);
      setSkinToneParams({
        u: existingMii.skin_tone_u,
        v: existingMii.skin_tone_v,
        w: existingMii.skin_tone_w
      });
    }
  }, [existingMii]);
  
  // Handle slider changes
  const handleSliderChange = (param, value) => {
    setSkinToneParams(prev => ({
      ...prev,
      [param]: value / 100
    }));
  };
  
  // Save Mii customization to database
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (miiData) {
        // Update existing Mii
        response = await supabase
          .from('mii_characters')
          .update({
            skin_tone_u: skinToneParams.u,
            skin_tone_v: skinToneParams.v,
            skin_tone_w: skinToneParams.w,
            updated_at: new Date()
          })
          .eq('id', miiData.id);
      } else {
        // Create new Mii
        response = await supabase
          .from('mii_characters')
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
      console.error('Error saving Mii:', error);
      setError('Failed to save your Mii. Please try again.');
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
    <div className="mii-customizer">
      <div className="customizer-header">
        <h2 className="wii-title">Customize Your Mii</h2>
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
            <CustomizableMiiHead skinToneParams={skinToneParams} />
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
              className="wii-slider"
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
              className="wii-slider"
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
              className="wii-slider"
            />
          </div>
          
          <button 
            className="wii-button save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : miiData ? 'Update Mii' : 'Save Mii'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiiCustomizer;

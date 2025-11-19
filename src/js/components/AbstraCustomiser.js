import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import supabase from '../utils/supabaseClient';
import { getSkinTone } from '../utils/ColorUtils';
import Abstra from './Abstra';

// Helper: HSV to Hex
function hsvToHex(h, s, v) {
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper: Hex to HSV
function hexToHsv(hex) {
  const c = new THREE.Color(hex);
  const r = c.r;
  const g = c.g;
  const b = c.b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h, s, v = max;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

// Custom Color Picker Component
function CustomColorPicker({ color, onChange }) {
  // Initialize local HSV state from the incoming color prop
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const slBoxRef = useRef(null);
  const hueSliderRef = useRef(null);
  const isDraggingSL = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync local HSV with external color prop ONLY if we are not currently dragging.
  useEffect(() => {
    if (!isDraggingSL.current && !isDraggingHue.current) {
      const newHsv = hexToHsv(color);
      // Only update if significantly different to avoid fighting with rounding errors
      if (Math.abs(newHsv.h - hsv.h) > 0.01 || Math.abs(newHsv.s - hsv.s) > 0.01 || Math.abs(newHsv.v - hsv.v) > 0.01) {
        setHsv(newHsv);
      }
    }
  }, [color]);

  const updateColor = useCallback((newHsv) => {
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [onChange]);

  const handleSLMouseDown = (e) => {
    isDraggingSL.current = true;
    handleSLMove(e);
  };

  const handleHueMouseDown = (e) => {
    isDraggingHue.current = true;
    handleHueMove(e);
  };

  const handleMouseUp = () => {
    isDraggingSL.current = false;
    isDraggingHue.current = false;
  };

  const handleSLMove = (e) => {
    if (!isDraggingSL.current || !slBoxRef.current) return;

    const rect = slBoxRef.current.getBoundingClientRect();

    // Calculate relative position within the box
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // x is Saturation, y is Value (inverted, top is 1)
    updateColor({ ...hsv, s: x, v: 1 - y });
  };

  const handleHueMove = (e) => {
    if (!isDraggingHue.current || !hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    // Only update Hue, preserve S and V
    updateColor({ ...hsv, h: x });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (isDraggingSL.current) handleSLMove(e);
      if (isDraggingHue.current) handleHueMove(e);
    };
    const onUp = () => {
      isDraggingSL.current = false;
      isDraggingHue.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [hsv]); // Re-bind with current hsv state

  // Background color for SL box (pure hue)
  const hueColor = hsvToHex(hsv.h, 1, 1);

  return (
    <div className="custom-color-picker">
      <div
        className="color-sl-box"
        ref={slBoxRef}
        onMouseDown={handleSLMouseDown}
        style={{ backgroundColor: hueColor }}
      >
        <div
          className="color-sl-bg"
          style={{
            background: 'linear-gradient(to right, #fff 0%, transparent 100%)'
          }}
        />
        <div
          className="color-sl-bg"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, #000 100%)'
          }}
        />
        <div
          className="color-sl-handle"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: color
          }}
        />
      </div>

      <div
        className="color-hue-slider"
        ref={hueSliderRef}
        onMouseDown={handleHueMouseDown}
      >
        <div
          className="color-hue-handle"
          style={{ left: `${hsv.h * 100}%` }}
        />
      </div>

      <div className="color-preview-row">
        <div className="color-preview-box" style={{ backgroundColor: color }} />
        <div className="color-hex-display">{color}</div>
      </div>
    </div>
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

  // Clothing colors (default or from existing)
  // Defaults: Shirt Red, Pants Blue, Shoes Yellow
  const [shirtColor, setShirtColor] = useState(existingAbstra?.color || '#ff0000');
  const [pantsColor, setPantsColor] = useState('#0000ff'); // Default Blue
  const [shoesColor, setShoesColor] = useState('#ffff00'); // Default Yellow

  const [activeTab, setActiveTab] = useState('skin'); // 'skin', 'shirt', 'pants', 'shoes'
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
      if (existingAbstra.color) setShirtColor(existingAbstra.color);
    }
  }, [existingAbstra]);

  // Handle skin tone slider changes
  const handleSkinSliderChange = (param, value) => {
    setSkinToneParams(prev => ({
      ...prev,
      [param]: value / 100
    }));
  };

  // Handle color picker changes
  const handleColorChange = (type, color) => {
    if (type === 'shirt') setShirtColor(color);
    else if (type === 'pants') setPantsColor(color);
    else if (type === 'shoes') setShoesColor(color);
  };

  // Save Abstra customization to database
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      let response;

      const updateData = {
        skin_tone_u: skinToneParams.u,
        skin_tone_v: skinToneParams.v,
        skin_tone_w: skinToneParams.w,
        color: shirtColor, // Saving shirt color
        updated_at: new Date()
      };

      if (abstraData) {
        // Update existing Abstra
        response = await supabase
          .from('abstras')
          .update(updateData)
          .eq('id', abstraData.id);
      } else {
        // Create new Abstra
        response = await supabase
          .from('abstras')
          .insert([{
            user_id: user.id,
            ...updateData
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
            shadows
            camera={{ position: [0, 1, 4], fov: 50 }}
            style={{ height: 300, width: '100%', background: '#87CEEB' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
            <group position={[0, -1, 0]}>
              <Abstra
                position={[0, 0, 0]}
                skinToneParams={skinToneParams}
                shirtColor={shirtColor}
                pantsColor={pantsColor}
                shoesColor={shoesColor}
                username={user?.user_metadata?.username || "Preview"}
                isStatic={true}
              />
            </group>
            {/* OrbitControls with damping and target at Abstra center */}
            {/* Group is at y=-1. Abstra center is approx y=0.8 relative to group. 
                So world center is -0.2. Setting target to [0, -0.2, 0]. */}
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={2}
              maxDistance={6}
              target={[0, -0.2, 0]}
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={0.5}
            />
          </Canvas>
        </div>

        <div className="customizer-controls">
          {/* Tabs */}
          <div className="customizer-tabs">
            <button
              className={`tab-button ${activeTab === 'skin' ? 'active' : ''}`}
              onClick={() => setActiveTab('skin')}
            >
              Skin
            </button>
            <button
              className={`tab-button ${activeTab === 'shirt' ? 'active' : ''}`}
              onClick={() => setActiveTab('shirt')}
            >
              Shirt
            </button>
            <button
              className={`tab-button ${activeTab === 'pants' ? 'active' : ''}`}
              onClick={() => setActiveTab('pants')}
            >
              Pants
            </button>
            <button
              className={`tab-button ${activeTab === 'shoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('shoes')}
            >
              Shoes
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'skin' && (
              <>
                <div className="slider-group">
                  <label>Skin Tone (Light ↔ Dark)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skinToneParams.u * 100}
                    onChange={(e) => handleSkinSliderChange('u', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="slider-group">
                  <label>Skin Warmth (Cool ↔ Warm)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skinToneParams.v * 100}
                    onChange={(e) => handleSkinSliderChange('v', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="slider-group">
                  <label>Skin Undertone (Blue ↔ Yellow)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skinToneParams.w * 100}
                    onChange={(e) => handleSkinSliderChange('w', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </>
            )}

            {activeTab === 'shirt' && (
              <CustomColorPicker
                color={shirtColor}
                onChange={(c) => handleColorChange('shirt', c)}
              />
            )}
            {activeTab === 'pants' && (
              <CustomColorPicker
                color={pantsColor}
                onChange={(c) => handleColorChange('pants', c)}
              />
            )}
            {activeTab === 'shoes' && (
              <CustomColorPicker
                color={shoesColor}
                onChange={(c) => handleColorChange('shoes', c)}
              />
            )}
          </div>

          <button
            className="button save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : abstraData ? 'Update Abstra' : 'Save Abstra'}
          </button>
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px', textAlign: 'center' }}>
            * Note: Only Shirt and Skin settings are saved to the database currently.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AbstraCustomiser;

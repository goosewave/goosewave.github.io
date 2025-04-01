import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import Floor from './components/Floor';
import MiiFigure from './components/MiiFigure';
import KeyboardControls from './components/KeyboardControls';
import MiiChannelCamera from './components/MiiChannelCamera';
import WiiMenu from './components/WiiMenu';
import ControlsInstructions from './components/ControlsInstructions';
import AuthForm from './components/AuthForm';
import MiiCustomizer from './components/MiiCustomizer';

// Import Supabase client
import supabase from './utils/supabaseClient';

// Main App component
function App() {
  const [activeSection, setActiveSection] = useState('miiChannel');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [hasMii, setHasMii] = useState(false);
  const [userMii, setUserMii] = useState(null);
  const orbitControlsRef = useRef();
  
  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    // Clean up listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  // Check if user has a Mii character and fetch Mii data
  useEffect(() => {
    const checkForMii = async () => {
      if (!user) {
        setHasMii(false);
        setUserMii(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('mii_characters')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          console.error('Error checking for Mii:', error);
        }
        
        // If data exists, user has a Mii
        const hasMiiData = !!data;
        setHasMii(hasMiiData);
        
        if (hasMiiData) {
          setUserMii(data);
        } else if (!showCustomizer) {
          // If user just logged in and doesn't have a Mii, show customizer
          setShowCustomizer(true);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    checkForMii();
  }, [user, showCustomizer]);
  
  // Handle opening and closing the customizer
  const toggleCustomizer = () => {
    setShowCustomizer(prev => !prev);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Generate random colors for Mii figures
  const getRandomColor = () => {
    const colours = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
    return colours[Math.floor(Math.random() * colours.length)];
  };
  
  // Generate random positions for Mii figures
  const generateMiiPositions = (count) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 30 - 15;
      const z = Math.random() * 30 - 15;
      positions.push({
        id: i,
        position: [x, 0, z],
        color: getRandomColor()
      });
    }
    return positions;
  };
  
  const miiPositions = generateMiiPositions(30); // 30 Mii figures
  
  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="wii-loader"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Show auth form if no user is logged in */}
      {!user && <AuthForm onAuthSuccess={setUser} />}
      
      {/* Show sign out button and customize button if user is logged in */}
      {user && (
        <div className="user-controls">
          {hasMii && (
            <button className="wii-button customize-button" onClick={toggleCustomizer} style={{ marginRight: '10px' }}>
              Customize Mii
            </button>
          )}
          <button className="wii-button sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}
      
      {/* Show Mii customizer when needed */}
      {user && showCustomizer && (
        <MiiCustomizer 
          user={user} 
          existingMii={userMii}
          onComplete={async () => {
            setShowCustomizer(false);
            
            // Refresh Mii data
            try {
              const { data, error } = await supabase
                .from('mii_characters')
                .select('*')
                .eq('user_id', user.id)
                .single();
                
              if (error) {
                console.error('Error fetching updated Mii:', error);
              } else if (data) {
                setUserMii(data);
                setHasMii(true);
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }} 
        />
      )}
      
      <ControlsInstructions />
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas 
          shadows
          gl={{ 
            powerPreference: "high-performance",
            antialias: true,
            stencil: false,
            depth: true
          }}
        >
      {/* Scene background color - Wii-like blue */}
      <color attach="background" args={['#87CEEB']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Sky sunPosition={[100, 20, 100]} />
      
      {/* Camera setup */}
      <MiiChannelCamera />
      
      {/* Scene content */}
      <Suspense fallback={null}>
        {activeSection === 'miiChannel' && (
          <>
            <Floor />
            {/* User's Mii character if available */}
            {user && userMii && (
              <MiiFigure 
                position={[0, 0, -5]} 
                color="#00aaff"
                skinToneParams={{
                  u: userMii.skin_tone_u,
                  v: userMii.skin_tone_v,
                  w: userMii.skin_tone_w
                }}
                isUserMii={true}
              />
            )}
            
            {/* Random Mii figures walking around */}
            {miiPositions.map((mii) => (
              <MiiFigure 
                key={mii.id} 
                position={mii.position} 
                color={mii.color} 
              />
            ))}
            
            {/* Title text */}
            <Text
              font="/assets/fonts/Nunito-Bold.ttf"
              fontSize={2}
              position={[0, 8, -10]}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Lucas Poirier
            </Text>
            <Text
              font="/assets/fonts/Nunito-Regular.ttf"
              fontSize={1}
              position={[0, 6, -10]}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Portfolio
            </Text>
            
            {/* Navigation Menu */}
            <group position={[0, 2, -18]}>
              <WiiMenu 
                options={[
                  { id: 'about', label: 'About', color: '#ffaa00' },
                  { id: 'projects', label: 'Projects', color: '#00aaff' },
                  { id: 'contact', label: 'Contact', color: '#ff00aa' },
                ]} 
                onSelect={(section) => setActiveSection(section)}
              />
            </group>
          </>
        )}
        
        {/* Other sections can be added here */}
      </Suspense>
      
      {/* Camera controls */}
      <KeyboardControls controlsRef={orbitControlsRef} />
      <OrbitControls 
        ref={orbitControlsRef}
        enableZoom={false}     // Disable zooming with scroll wheel
        enablePan={false}      // Disable panning
        enableRotate={true}    // Allow rotation with mouse
        rotateSpeed={0.5}      // Speed of rotation
        minPolarAngle={Math.PI / 20}    // Limit how far down you can look
        maxPolarAngle={Math.PI / 1.25}  // Limit how far up you can look
        maxDistance={50}       // Maximum zoom out distance
        target={[0, 2, 0]}     // Initial look target
      />
    </Canvas>
      </div>
    </>
  );
}

export default App;

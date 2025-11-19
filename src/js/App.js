import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Sky, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import Floor from './components/Floor';
import Abstra from './components/Abstra';
import GameControls from './components/GameControls';
import PauseMenu from './components/PauseMenu';
import Camera from './components/Camera';
import Menu from './components/Menu';
import ControlsInstructions from './components/ControlsInstructions';
import AuthForm from './components/AuthForm';
import AbstraCustomiser from './components/AbstraCustomiser';
import SpeedIndicator from './components/SpeedIndicator';

// Import Supabase client
import supabase from './utils/supabaseClient';

// Main App component
function App() {
  const [activeSection, setActiveSection] = useState('abstraChannel');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [hasAbstra, setHasAbstra] = useState(false);
  const [userAbstra, setUserAbstra] = useState(null);
  const [allUserAbstras, setAllUserAbstras] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const orbitControlsRef = useRef();
  // Store persistent Abstra properties
  const [abstraProperties, setAbstraProperties] = useState({});

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

  // Check if user has an Abstra character and fetch Abstra data
  useEffect(() => {
    const checkForAbstra = async () => {
      if (!user) {
        setHasAbstra(false);
        setUserAbstra(null);
        return;
      }

      try {
        const { data, error } = await supabase

          .from('abstras')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          console.error('Error checking for Abstra:', error);
        }

        // If data exists, user has an Abstra
        const hasAbstraData = !!data;
        setHasAbstra(hasAbstraData);

        if (hasAbstraData) {
          setUserAbstra(data);
        } else if (!showCustomizer) {
          // If user just logged in and doesn't have an Abstra, show customizer
          setShowCustomizer(true);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    checkForAbstra();
  }, [user, showCustomizer]);

  // Fetch all user abstras from the database
  useEffect(() => {
    const fetchAllAbstras = async () => {
      try {
        // First, fetch all abstras
        const { data: abstrasData, error: abstrasError } = await supabase
          .from('abstras')
          .select('*');

        if (abstrasError) {
          console.error('Error fetching abstras:', abstrasError);
          return;
        }

        if (!abstrasData || abstrasData.length === 0) {
          setAllUserAbstras([]);
          return;
        }

        // Now fetch all profiles to get the email addresses
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Process the abstras data to include username
        const processedData = abstrasData
          .map(abstra => {
            const profile = profilesData.find(p => p.id === abstra.user_id);
            const email = profile ? profile.email : '';
            // Use username from profile, or fallback to email part
            const username = (profile && profile.username) ? profile.username : email.split('@')[0];

            return {
              ...abstra,
              email,
              username
            };
          })
          .filter(abstra => abstra.email !== ''); // Remove abstras with no associated profile

        setAllUserAbstras(processedData);

        // Initialize persistent properties for any new abstras
        setAbstraProperties(prevProps => {
          const newProps = { ...prevProps };
          processedData.forEach(abstra => {
            if (!newProps[abstra.id]) {
              newProps[abstra.id] = {
                position: generateRandomPosition(),
                color: getRandomColor()
              };
            }
          });
          return newProps;
        });
      } catch (error) {
        console.error('Error in fetchAllAbstras:', error);
      }
    };

    fetchAllAbstras();

    // Set up a subscription to listen for changes in the abstras table
    const abstraSubscription = supabase
      .channel('abstras-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'abstras'
      }, () => {
        fetchAllAbstras();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(abstraSubscription);
    };
  }, []);

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

  // Generate random colors for Abstra figures
  const getRandomColor = () => {
    const colours = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
    return colours[Math.floor(Math.random() * colours.length)];
  };

  // Generate random positions for user abstras
  const generateRandomPosition = () => {
    const x = Math.random() * 30 - 15;
    const z = Math.random() * 30 - 15;
    return [x, 0, z];
  };

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Show auth form if no user is logged in */}
      {!user && <AuthForm onAuthSuccess={setUser} />}

      {/* Show Abstra customizer when needed */}
      {user && showCustomizer && (
        <AbstraCustomiser
          user={user}
          existingAbstra={userAbstra}
          onComplete={async () => {
            setShowCustomizer(false);

            // Refresh Abstra data
            try {
              const { data, error } = await supabase

                .from('abstras')
                .select('*')
                .eq('user_id', user.id)
                .single();

              if (error) {
                console.error('Error fetching updated Abstra:', error);
              } else if (data) {
                setUserAbstra(data);
                setHasAbstra(true);
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }}
        />
      )}

      <ControlsInstructions user={user} />
      <SpeedIndicator />
      <PauseMenu
        isPaused={isPaused}
        onClick={() => {
          // The Resume button in PauseMenu will handle unpausing
          // and will only work after the 1-second delay
          setIsPaused(false);
        }}
        user={user}
        hasAbstra={hasAbstra}
        onCustomize={toggleCustomizer}
        onSignOut={handleSignOut}
      />
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas
          shadows
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            stencil: false,
            depth: true
          }}
          onClick={() => {
            // When the canvas is clicked and the game is not paused,
            // try to request pointer lock
            if (!isPaused) {
              try {
                const canvas = document.querySelector('canvas');
                if (canvas && document.pointerLockElement !== canvas) {
                  canvas.requestPointerLock();
                }
              } catch (error) {
                console.warn("Could not request pointer lock:", error);
              }
            }
          }}
        >
          {/* Scene background color - blue */}
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
          <Camera />

          {/* Scene content */}
          <Suspense fallback={null}>
            {activeSection === 'abstraChannel' && (
              <>
                <Floor />
                {/* All user abstras walking around */}
                {allUserAbstras.map((abstra, index) => (
                  abstraProperties[abstra.id] && (
                    <Abstra
                      key={abstra.id}
                      position={abstraProperties[abstra.id].position}
                      color={abstraProperties[abstra.id].color}
                      skinToneParams={{
                        u: abstra.skin_tone_u,
                        v: abstra.skin_tone_v,
                        w: abstra.skin_tone_w
                      }}
                      username={abstra.username}
                      isCurrentUser={user && abstra.user_id === user.id}
                    />
                  )
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
                  <Menu
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

          {/* Camera controls - Using direct camera rotation instead of OrbitControls */}
          <GameControls
            isPaused={isPaused}
            setPaused={setIsPaused}
            controlsRef={orbitControlsRef}
          />
          <OrbitControls
            ref={orbitControlsRef}
            enabled={false}        // Disabled - using direct camera rotation instead
            enableZoom={false}     // Disable zooming with scroll wheel
            enablePan={false}      // Disable panning
            enableRotate={false}   // Disable rotation with mouse
            minPolarAngle={Math.PI / 20}    // Limit how far down you can look
            maxPolarAngle={Math.PI / 1.25}  // Limit how far up you can look
            maxDistance={50}       // Maximum zoom out distance
            target={[0, 2, 0]}     // Initial look target (not used with direct rotation)
          />
        </Canvas>
      </div>
    </>
  );
}

export default App;

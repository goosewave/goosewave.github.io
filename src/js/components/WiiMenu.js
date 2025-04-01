import React from 'react';
import { Float } from '@react-three/drei';
import WiiChannel from './WiiChannel';

// Wii-style navigation menu
function WiiMenu({ options, onSelect }) {
  return (
    <Float floatIntensity={0.5} rotationIntensity={0.2} speed={2}>
      <group>
        {options.map((option, index) => (
          <WiiChannel
            key={index}
            position={[index * 3 - (options.length - 1) * 1.5, 0, 0]}
            color={option.color}
            label={option.label}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </group>
    </Float>
  );
}

export default WiiMenu;

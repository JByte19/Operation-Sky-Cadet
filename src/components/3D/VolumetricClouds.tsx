import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';

const VolumetricClouds = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Slow rotation for ambient cloud movement
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {/* We use Drei's optimized Clouds instance */}
            <Clouds material={THREE.MeshBasicMaterial} limit={400}>
                <Cloud seed={1} position={[0, -5, -20]} speed={0.2} opacity={0.3} segments={40} volume={10} color="#5d8aa8" />
                <Cloud seed={2} position={[-15, 5, -30]} speed={0.15} opacity={0.2} segments={40} volume={15} color="#0a0e17" bounds={[10, 2, 2]} />
                <Cloud seed={3} position={[15, -2, -25]} speed={0.25} opacity={0.25} segments={40} volume={12} color="#1b2a47" bounds={[10, 2, 2]} />
            </Clouds>

            {/* Adding some fog at the scene level for depth */}
            <fog attach="fog" args={['#0a0e17', 10, 40]} />
        </group>
    );
};

export default VolumetricClouds;

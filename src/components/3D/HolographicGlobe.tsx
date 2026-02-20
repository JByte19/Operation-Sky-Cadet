import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HolographicGlobe = ({ active }: { active: boolean }) => {
    const globeRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (active && globeRef.current) {
            globeRef.current.rotation.y += delta * 0.5;
            globeRef.current.rotation.x += delta * 0.2;
        }
    });

    if (!active) return null;

    return (
        <group ref={globeRef} position={[0, 0, 0]}>
            {/* Underlying dark sphere */}
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#050a12" transparent opacity={0.8} />
            </mesh>

            {/* Wireframe Holographic Effect */}
            <mesh>
                <sphereGeometry args={[2.05, 16, 16]} />
                <meshBasicMaterial
                    color="#5d8aa8"
                    wireframe
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Lat/Long Rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#ff9933" transparent opacity={0.6} />
            </mesh>
            <mesh>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#5d8aa8" transparent opacity={0.3} />
            </mesh>

            {/* Center glowing core */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="#ff9933" />
                <pointLight color="#ff9933" distance={5} intensity={2} />
            </mesh>
        </group>
    );
};

export default HolographicGlobe;

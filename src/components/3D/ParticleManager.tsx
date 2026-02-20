import { Stars, Sparkles } from '@react-three/drei';
import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ambient Night Stars
export const NightStars = ({ active }: { active: boolean }) => {
    if (!active) return null;
    return (
        <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
        />
    );
};

// Explosion Effect for Shooter Simulation
export interface ExplosionHandle {
    trigger: (position: THREE.Vector3) => void;
}

export const GoldenExplosion = forwardRef<ExplosionHandle>((_props, ref) => {
    const [active, setActive] = useState(false);
    const [pos, setPos] = useState<THREE.Vector3>(new THREE.Vector3());
    const sparklesRef = useRef<THREE.Group>(null);
    const scaleRef = useRef(0);

    useImperativeHandle(ref, () => ({
        trigger: (position: THREE.Vector3) => {
            setPos(position);
            setActive(true);
            scaleRef.current = 0;
            setTimeout(() => setActive(false), 2000); // Hide after 2s
        }
    }));

    useFrame((_, delta) => {
        if (active && sparklesRef.current) {
            // Expand quickly
            if (scaleRef.current < 1) {
                scaleRef.current += delta * 5;
                sparklesRef.current.scale.setScalar(scaleRef.current);
            }
        }
    });

    if (!active) return null;

    return (
        <group ref={sparklesRef} position={pos}>
            <Sparkles
                count={200}
                scale={4}
                size={6}
                speed={0.4}
                opacity={1}
                color="#ffd700"
            />
            <pointLight color="#ffd700" distance={10} intensity={5} />
        </group>
    );
});

GoldenExplosion.displayName = 'GoldenExplosion';

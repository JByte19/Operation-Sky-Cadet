import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Trail } from '@react-three/drei';

interface JetSilhouetteProps {
    activeSection: number;
    onJetClick?: () => void;
}

const JetSilhouette = ({ activeSection, onJetClick }: JetSilhouetteProps) => {
    const jetRef = useRef<THREE.Group>(null);
    const canardLeftRef = useRef<THREE.Mesh>(null);
    const canardRightRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    const [sonicBoom, setSonicBoom] = useState(false);
    const sonicRingRef = useRef<THREE.Mesh>(null);
    const speedBoost = useRef(0);

    // Visible in Sky (1), Shooter (3), and Finale (4) sections
    const visible = activeSection === 1 || activeSection === 3 || activeSection === 4;

    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (activeSection !== 1) return; // Only interactive in sky section
        setSonicBoom(true);
        speedBoost.current = 3;
        onJetClick?.();
        setTimeout(() => setSonicBoom(false), 1500);
    }, [activeSection, onJetClick]);

    useFrame((state) => {
        if (!jetRef.current || !visible) return;

        const t = state.clock.elapsedTime;

        // Mouse parallax effect
        const mouseX = (state.pointer.x * viewport.width) / 2;
        const mouseY = (state.pointer.y * viewport.height) / 2;
        const boost = speedBoost.current > 0 ? speedBoost.current : 1;

        const targetX = mouseX * 0.4;
        const targetY = mouseY * 0.3;

        jetRef.current.position.x = THREE.MathUtils.lerp(jetRef.current.position.x, targetX, 0.05 * boost);
        jetRef.current.position.y = THREE.MathUtils.lerp(jetRef.current.position.y, targetY - 1, 0.05 * boost);

        // Banking and pitching
        const targetRotationZ = -state.pointer.x * 0.5;
        const targetRotationX = state.pointer.y * 0.2;
        jetRef.current.rotation.z = THREE.MathUtils.lerp(jetRef.current.rotation.z, targetRotationZ, 0.05);
        jetRef.current.rotation.x = THREE.MathUtils.lerp(jetRef.current.rotation.x, targetRotationX, 0.05);

        // Subtle bobbing
        jetRef.current.position.y += Math.sin(t * 2) * 0.005;

        // Wing control surface animation (ailerons oscillating)
        if (canardLeftRef.current) {
            canardLeftRef.current.rotation.x = Math.sin(t * 3) * 0.1;
        }
        if (canardRightRef.current) {
            canardRightRef.current.rotation.x = Math.sin(t * 3 + Math.PI) * 0.1;
        }

        // Afterburner flicker
        if (trailRef.current) {
            const flicker = 0.7 + Math.random() * 0.3;
            trailRef.current.scale.set(flicker, 1 + Math.random() * 0.5, flicker);
        }

        // Decay speed boost
        if (speedBoost.current > 0) {
            speedBoost.current *= 0.98;
            if (speedBoost.current < 0.05) speedBoost.current = 0;
        }

        // Sonic boom ring expansion
        if (sonicRingRef.current) {
            if (sonicBoom) {
                sonicRingRef.current.visible = true;
                sonicRingRef.current.scale.x += 0.15;
                sonicRingRef.current.scale.y += 0.15;
                sonicRingRef.current.scale.z += 0.15;
                const mat = sonicRingRef.current.material as THREE.MeshBasicMaterial;
                mat.opacity *= 0.96;
            } else {
                sonicRingRef.current.visible = false;
                sonicRingRef.current.scale.set(0.1, 0.1, 0.1);
                const mat = sonicRingRef.current.material as THREE.MeshBasicMaterial;
                mat.opacity = 0.7;
            }
        }
    });

    if (!visible) return null;

    return (
        <group ref={jetRef} position={[0, -1, -3]}>
            {/* Procedural Jet — HAL Tejas inspired delta wing */}
            <group
                rotation={[Math.PI / 2, 0, 0]}
                onClick={handleClick}
                onPointerOver={() => {
                    if (activeSection === 1) document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                {/* Fuselage */}
                <mesh>
                    <cylinderGeometry args={[0.15, 0.35, 2.8, 16]} />
                    <meshStandardMaterial color="#6b8dad" roughness={0.25} metalness={0.9} envMapIntensity={1.5} />
                </mesh>

                {/* Nose cone */}
                <mesh position={[0, 1.6, 0]}>
                    <coneGeometry args={[0.15, 1.4, 16]} />
                    <meshStandardMaterial color="#7a9cb8" roughness={0.2} metalness={0.95} />
                </mesh>

                {/* Radome tip */}
                <mesh position={[0, 2.35, 0]}>
                    <coneGeometry args={[0.06, 0.3, 8]} />
                    <meshStandardMaterial color="#ffaa33" roughness={0.4} metalness={0.5} emissive="#ff8800" emissiveIntensity={0.3} />
                </mesh>

                {/* Delta Wings (main) */}
                <Trail
                    width={0.3}
                    length={6}
                    color={new THREE.Color('#ff993388')}
                    attenuation={(w) => w * w}
                >
                    <mesh position={[0, -0.3, -0.05]}>
                        <boxGeometry args={[4.5, 1.8, 0.04]} />
                        <meshStandardMaterial color="#5a7d9a" roughness={0.3} metalness={0.85} side={THREE.DoubleSide} />
                    </mesh>
                </Trail>

                {/* Wing tips (saffron) */}
                <mesh position={[2.1, -0.5, -0.05]}>
                    <boxGeometry args={[0.4, 0.8, 0.04]} />
                    <meshStandardMaterial color="#ff9933" roughness={0.3} metalness={0.7} emissive="#ff6600" emissiveIntensity={0.2} />
                </mesh>
                <mesh position={[-2.1, -0.5, -0.05]}>
                    <boxGeometry args={[0.4, 0.8, 0.04]} />
                    <meshStandardMaterial color="#ff9933" roughness={0.3} metalness={0.7} emissive="#ff6600" emissiveIntensity={0.2} />
                </mesh>

                {/* Canards (animated control surfaces) */}
                <mesh ref={canardLeftRef} position={[0.7, 1.0, 0]}>
                    <boxGeometry args={[1.0, 0.4, 0.03]} />
                    <meshStandardMaterial color="#5a7d9a" roughness={0.3} metalness={0.85} side={THREE.DoubleSide} />
                </mesh>
                <mesh ref={canardRightRef} position={[-0.7, 1.0, 0]}>
                    <boxGeometry args={[1.0, 0.4, 0.03]} />
                    <meshStandardMaterial color="#5a7d9a" roughness={0.3} metalness={0.85} side={THREE.DoubleSide} />
                </mesh>

                {/* Vertical Tail Fin */}
                <mesh position={[0, -1.0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                    <boxGeometry args={[0.06, 1.2, 0.9]} />
                    <meshStandardMaterial color="#5a7d9a" roughness={0.3} metalness={0.85} />
                </mesh>

                {/* Engine Intake sides */}
                <mesh position={[0.4, 0.2, -0.1]}>
                    <boxGeometry args={[0.3, 1.0, 0.25]} />
                    <meshStandardMaterial color="#4a6b8a" roughness={0.35} metalness={0.8} />
                </mesh>
                <mesh position={[-0.4, 0.2, -0.1]}>
                    <boxGeometry args={[0.3, 1.0, 0.25]} />
                    <meshStandardMaterial color="#4a6b8a" roughness={0.35} metalness={0.8} />
                </mesh>

                {/* Afterburner nozzle */}
                <mesh position={[0, -1.6, 0]}>
                    <cylinderGeometry args={[0.18, 0.22, 0.4, 16]} />
                    <meshStandardMaterial color="#333" roughness={0.5} metalness={0.9} />
                </mesh>

                {/* Afterburner glow */}
                <mesh ref={trailRef} position={[0, -2.0, 0]}>
                    <coneGeometry args={[0.18, 1.2, 8]} />
                    <meshBasicMaterial color="#ff9933" transparent opacity={0.7} />
                </mesh>
                <mesh position={[0, -2.0, 0]}>
                    <coneGeometry args={[0.1, 0.8, 8]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                </mesh>

                {/* Engine glow light */}
                <pointLight position={[0, -2.2, 0]} color="#ff9933" intensity={4} distance={6} />
            </group>

            {/* Sonic Boom Ring */}
            <mesh ref={sonicRingRef} visible={false} rotation={[0, 0, 0]}>
                <torusGeometry args={[1, 0.05, 8, 64]} />
                <meshBasicMaterial color="#88ccff" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

export default JetSilhouette;

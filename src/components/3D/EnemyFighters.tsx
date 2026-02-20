import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

/* ─── Types ─── */
type EnemyType = 'scout' | 'bomber' | 'ace';

interface Enemy {
    id: string;
    type: EnemyType;
    position: THREE.Vector3;
    destroyed: boolean;
}

interface EnemyFightersProps {
    active: boolean;
    wave: number;
    ammo: number;
    reloading: boolean;
    missileType: 'standard' | 'heatseker' | 'emp';
    onEnemyHit: (id: string, type: EnemyType) => void;
    onFireMissile: () => void; // consume ammo
}

/* ─── Enemy Jet Mesh ─── */
const EnemyJetMesh = ({
    type,
    destroyed,
    onClick,
}: {
    type: EnemyType;
    destroyed: boolean;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
}) => {
    const colors: Record<EnemyType, { body: string; accent: string }> = {
        scout: { body: '#888899', accent: '#ccccdd' },
        bomber: { body: '#8b2020', accent: '#cc4444' },
        ace: { body: '#1a1a2e', accent: '#ff2244' },
    };
    const c = colors[type];
    const scale = type === 'bomber' ? 1.4 : type === 'ace' ? 1.0 : 0.8;

    if (destroyed) return null;

    return (
        <group
            scale={[scale, scale, scale]}
            onPointerDown={(e) => {
                e.stopPropagation(); // Prevent clicks going through to sky
                if (onClick) onClick(e);
            }}
            onPointerOver={() => {
                document.body.style.cursor = 'crosshair';
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'auto';
            }}
        >
            {/* Invisible spherical hitbox for reliable clicking */}
            <mesh visible={false}>
                <sphereGeometry args={[2.5]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Fuselage */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.3, 2.2, 12]} />
                <meshStandardMaterial color={c.body} roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Nose */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.4]}>
                <coneGeometry args={[0.12, 0.8, 12]} />
                <meshStandardMaterial color={c.body} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Wings */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
                <boxGeometry args={[3.2, 1.2, 0.03]} />
                <meshStandardMaterial
                    color={c.body}
                    roughness={0.3}
                    metalness={0.7}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Accent stripes */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.25]}>
                <boxGeometry args={[3.2, 0.15, 0.04]} />
                <meshStandardMaterial
                    color={c.accent}
                    emissive={c.accent}
                    emissiveIntensity={0.4}
                    roughness={0.3}
                    metalness={0.5}
                />
            </mesh>
            {/* Tail */}
            <mesh position={[0, 0.5, 1.0]}>
                <boxGeometry args={[0.04, 0.8, 0.5]} />
                <meshStandardMaterial color={c.body} roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Engine glow */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.3]}>
                <coneGeometry args={[0.14, 0.6, 8]} />
                <meshBasicMaterial color={c.accent} transparent opacity={0.6} />
            </mesh>
            <pointLight position={[0, 0, 1.5]} color={c.accent} intensity={2} distance={4} />
        </group>
    );
};

/* ─── Missile Projectile ─── */
const MissileProjectile = ({
    targetRef,
    onImpact,
    type,
}: {
    targetRef: React.RefObject<THREE.Group | null>;
    onImpact: () => void;
    type: 'standard' | 'heatseker' | 'emp';
}) => {
    const ref = useRef<THREE.Group>(null);
    const startPos = useMemo(() => new THREE.Vector3(0, -3, 6), []);
    const progressRef = useRef(0);
    const impactedRef = useRef(false);
    const targetSnapshot = useRef(new THREE.Vector3(0, 0, -8));

    const isHeat = type === 'heatseker';
    const isEmp = type === 'emp';
    const color = isEmp ? '#00ffff' : isHeat ? '#ff3300' : '#ffd700';
    const speed = isEmp ? 2 : isHeat ? 4 : 3;

    // Capture initial target position
    useEffect(() => {
        if (targetRef.current) {
            targetSnapshot.current.copy(targetRef.current.position);
        }
    }, [targetRef]);

    useFrame((_, delta) => {
        if (!ref.current || impactedRef.current) return;

        // Track the live position of the enemy for homing
        if (targetRef.current) {
            targetSnapshot.current.lerp(targetRef.current.position, 0.1);
        }

        progressRef.current += delta * speed;
        if (progressRef.current >= 1) {
            impactedRef.current = true;
            onImpact();
            return;
        }
        const p = progressRef.current;
        ref.current.position.lerpVectors(startPos, targetSnapshot.current, p);
        ref.current.lookAt(targetSnapshot.current);
    });

    return (
        <group ref={ref} position={startPos}>
            {/* Missile body */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 0.5, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Trail glow */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                <coneGeometry args={[0.08, 0.4, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
            <pointLight color={color} intensity={4} distance={4} />
        </group>
    );
};

/* ─── Explosion ─── */
const Explosion = ({ position, color = '#ff9933' }: { position: THREE.Vector3, color?: string }) => {
    const ref = useRef<THREE.Group>(null);
    const scaleRef = useRef(0.1);

    useFrame((_, delta) => {
        if (!ref.current) return;
        scaleRef.current += delta * 6;
        ref.current.scale.setScalar(Math.min(scaleRef.current, 3));
        const mat = ref.current.children[0] as THREE.Mesh;
        if (mat?.material && 'opacity' in (mat.material as THREE.Material)) {
            (mat.material as THREE.MeshBasicMaterial).opacity = Math.max(
                0,
                1 - scaleRef.current / 3
            );
        }
    });

    return (
        <group ref={ref} position={position}>
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
            </mesh>
            <Sparkles count={60} scale={2} size={4} speed={2} color={color === '#00ffff' ? '#00ccff' : '#ffd700'} />
            <pointLight color={color} intensity={8} distance={10} />
        </group>
    );
};

/* ─── Main EnemyFighters Component ─── */
const EnemyFighters = ({
    active,
    wave,
    ammo,
    reloading,
    missileType,
    onEnemyHit,
    onFireMissile,
}: EnemyFightersProps) => {
    const explosionIdRef = useRef(0);
    const [explosions, setExplosions] = useState<Array<{ id: number; pos: THREE.Vector3, type: 'standard' | 'heatseker' | 'emp' }>>([]);
    const [activeMissiles, setActiveMissiles] = useState<
        Array<{ enemyId: string; key: number; type: 'standard' | 'heatseker' | 'emp' }>
    >([]);
    const missileKeyRef = useRef(0);

    // Generate enemies per wave
    const enemies = useMemo<Enemy[]>(() => {
        if (!active) return [];
        const list: Enemy[] = [];
        if (wave >= 1) {
            list.push({
                id: `scout-${wave}`,
                type: 'scout',
                position: new THREE.Vector3(0, 0, -8),
                destroyed: false,
            });
        }
        if (wave >= 2) {
            list.push({
                id: `bomber-${wave}`,
                type: 'bomber',
                position: new THREE.Vector3(0, 0, -8),
                destroyed: false,
            });
        }
        if (wave >= 3) {
            list.push({
                id: `ace-${wave}`,
                type: 'ace',
                position: new THREE.Vector3(0, 0, -8),
                destroyed: false,
            });
        }
        return list;
    }, [active, wave]);

    const [destroyed, setDestroyed] = useState<Set<string>>(new Set());

    // Reset on wave change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDestroyed(new Set());
        setActiveMissiles([]);
    }, [wave]);

    // Store refs per enemy for missile homing
    const enemyRefs = useRef<Map<string, THREE.Group | null>>(new Map());

    const handleEnemyClick = useCallback(
        (enemy: Enemy, e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (destroyed.has(enemy.id)) return;
            if (ammo <= 0 || reloading) return;
            // Check if a missile is already targeting this enemy
            if (activeMissiles.some((m) => m.enemyId === enemy.id)) return;

            // Fire! Consume ammo and launch missile at this enemy
            onFireMissile();
            missileKeyRef.current += 1;
            setActiveMissiles((prev) => [
                ...prev,
                { enemyId: enemy.id, key: missileKeyRef.current, type: missileType },
            ]);
        },
        [destroyed, ammo, reloading, activeMissiles, onFireMissile, missileType]
    );

    const handleMissileImpact = useCallback(
        (enemyId: string, enemyType: EnemyType, mType: 'standard' | 'heatseker' | 'emp') => {
            const enemyRef = enemyRefs.current.get(enemyId);
            const pos = enemyRef
                ? enemyRef.position.clone()
                : new THREE.Vector3(0, 0, -8);
            setDestroyed((prev) => new Set(prev).add(enemyId));
            const expId = ++explosionIdRef.current;
            setExplosions((prev) => [...prev, { id: expId, pos, type: mType }]);
            setActiveMissiles((prev) => prev.filter((m) => m.enemyId !== enemyId));
            onEnemyHit(enemyId, enemyType);
            setTimeout(() => {
                setExplosions((prev) => prev.filter(e => e.id !== expId));
            }, 2000);
        },
        [onEnemyHit]
    );

    if (!active) return null;

    return (
        <group>
            {enemies.map((enemy) => (
                <EnemyUnit
                    key={enemy.id}
                    enemy={enemy}
                    destroyed={destroyed.has(enemy.id)}
                    onClick={(e) => handleEnemyClick(enemy, e)}
                    onMissileImpact={(mType) => handleMissileImpact(enemy.id, enemy.type, mType)}
                    hasMissile={activeMissiles.some((m) => m.enemyId === enemy.id)}
                    missileKey={
                        activeMissiles.find((m) => m.enemyId === enemy.id)?.key ?? 0
                    }
                    missileType={
                        activeMissiles.find((m) => m.enemyId === enemy.id)?.type ?? 'standard'
                    }
                    registerRef={(ref) => {
                        enemyRefs.current.set(enemy.id, ref);
                    }}
                />
            ))}
            {explosions.map((exp) => {
                const color = exp.type === 'emp' ? '#00ffff' : exp.type === 'heatseker' ? '#ff4400' : '#ff9933';
                return <Explosion key={`exp-${exp.id}`} position={exp.pos} color={color} />;
            })}
        </group>
    );
};

/* ─── Individual Enemy Unit with flight pattern ─── */
const EnemyUnit = ({
    enemy,
    destroyed,
    onClick,
    onMissileImpact,
    hasMissile,
    missileKey,
    missileType,
    registerRef,
}: {
    enemy: Enemy;
    destroyed: boolean;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
    onMissileImpact: (type: 'standard' | 'heatseker' | 'emp') => void;
    hasMissile: boolean;
    missileKey: number;
    missileType: 'standard' | 'heatseker' | 'emp';
    registerRef: (ref: THREE.Group | null) => void;
}) => {
    const ref = useRef<THREE.Group>(null);

    // Register ref on mount
    useEffect(() => {
        registerRef(ref.current);
        return () => registerRef(null);
    }, [registerRef]);

    // Flight patterns
    useFrame((state) => {
        if (!ref.current || destroyed) return;
        const t = state.clock.elapsedTime;

        switch (enemy.type) {
            case 'scout':
                ref.current.position.x = Math.sin(t * 3) * 4;
                ref.current.position.y = Math.cos(t * 2) * 1.5 + 1;
                ref.current.position.z = -8;
                ref.current.rotation.z = -Math.cos(t * 3) * 0.3;
                break;
            case 'bomber':
                ref.current.position.x = Math.sin(t * 1.2) * 3;
                ref.current.position.y = Math.sin(t * 0.8) * 0.8 - 0.5;
                ref.current.position.z = -10;
                ref.current.rotation.z = -Math.cos(t * 1.2) * 0.15;
                break;
            case 'ace':
                ref.current.position.x =
                    Math.sin(t * 4) * 3 + Math.cos(t * 2.5) * 1.5;
                ref.current.position.y = Math.cos(t * 3) * 2;
                ref.current.position.z = -7;
                ref.current.rotation.z = -Math.cos(t * 4) * 0.4;
                break;
        }
    });

    return (
        <>
            <group ref={ref} position={[0, 0, -8]}>
                <EnemyJetMesh type={enemy.type} destroyed={destroyed} onClick={onClick} />
            </group>
            {hasMissile && !destroyed && (
                <MissileProjectile
                    key={missileKey}
                    targetRef={ref}
                    onImpact={() => onMissileImpact(missileType)}
                    type={missileType}
                />
            )}
        </>
    );
};

export default EnemyFighters;
export type { EnemyType };

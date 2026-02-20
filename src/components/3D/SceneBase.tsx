import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import VolumetricClouds from './VolumetricClouds';
import JetSilhouette from './JetSilhouette';
import HolographicGlobe from './HolographicGlobe';
import EnemyFighters from './EnemyFighters';
import { NightStars } from './ParticleManager';

interface SceneBaseProps {
    activeSection: number;
    onJetClick: () => void;
    shooterWave: number;
    ammo: number;
    reloading: boolean;
    missileType: 'standard' | 'heatseker' | 'emp';
    onEnemyHit: (id: string, type: string) => void;
    onFireMissile: () => void;
}

const SceneBase = ({
    activeSection,
    onJetClick,
    shooterWave,
    ammo,
    reloading,
    missileType,
    onEnemyHit,
    onFireMissile,
}: SceneBaseProps) => {
    return (
        <Canvas className="w-full h-full" gl={{ antialias: true, alpha: false }}>
            <color attach="background" args={['#0a0e17']} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />

            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 20, 10]} intensity={1.8} color="#ff9933" />
            <directionalLight position={[-10, -10, -10]} intensity={0.6} color="#5d8aa8" />
            <directionalLight position={[0, 5, 5]} intensity={0.4} color="#ffffff" />

            <Suspense fallback={null}>
                <Environment preset="night" />
                <VolumetricClouds />
                <JetSilhouette activeSection={activeSection} onJetClick={onJetClick} />
                <HolographicGlobe active={activeSection === 0} />
                <EnemyFighters
                    active={activeSection === 3}
                    wave={shooterWave}
                    ammo={ammo}
                    reloading={reloading}
                    missileType={missileType}
                    onEnemyHit={onEnemyHit}
                    onFireMissile={onFireMissile}
                />
                <NightStars active={activeSection >= 3} />
            </Suspense>
        </Canvas>
    );
};

export default SceneBase;

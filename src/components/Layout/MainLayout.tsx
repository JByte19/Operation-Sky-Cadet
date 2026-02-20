import type { ReactNode } from 'react';
import SceneBase from '../3D/SceneBase';

interface MainLayoutProps {
    children?: ReactNode;
    activeSection: number;
    onJetClick: () => void;
    shooterWave: number;
    ammo: number;
    reloading: boolean;
    missileType: 'standard' | 'heatseker' | 'emp';
    onEnemyHit: (id: string, type: string) => void;
    onFireMissile: () => void;
}

const MainLayout = ({
    children,
    activeSection,
    onJetClick,
    shooterWave,
    ammo,
    reloading,
    missileType,
    onEnemyHit,
    onFireMissile,
}: MainLayoutProps) => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-navy">
            <div className="absolute inset-0 z-0">
                <SceneBase
                    activeSection={activeSection}
                    onJetClick={onJetClick}
                    shooterWave={shooterWave}
                    ammo={ammo}
                    reloading={reloading}
                    missileType={missileType}
                    onEnemyHit={onEnemyHit}
                    onFireMissile={onFireMissile}
                />
            </div>
            <div className="relative z-10 w-full h-full pointer-events-none">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;

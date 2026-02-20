import { useState, useCallback, useEffect, useRef } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Crosshair from './components/UI/Crosshair';
import Preloader from './components/Sections/Preloader';
import SkySection from './components/Sections/SkySection';
import NCCSection from './components/Sections/NCCSection';
import ShooterSection from './components/Sections/ShooterSection';
import FinaleSection from './components/Sections/FinaleSection';

/*
  Section flow:
  0 = Preloader
  1 = Sky (interactive jet)
  2 = NCC
  3 = Shooter Simulation
  4 = Finale (birthday)
*/

function App() {
  const [activeSection, setActiveSection] = useState(0);

  // ─── Jet interaction ───
  const [jetClicked, setJetClicked] = useState(false);
  const handleJetClick = useCallback(() => setJetClicked(true), []);

  // ─── Shooter game state ───
  const TOTAL_WAVES = 3;
  const MAX_AMMO = 3;
  const RELOAD_TIME = 3000;

  const [shooterWave, setShooterWave] = useState(1);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [ammo, setAmmo] = useState(MAX_AMMO);
  const [reloading, setReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [waveCleared, setWaveCleared] = useState(false);
  const [allCleared, setAllCleared] = useState(false);
  const [missileType, setMissileType] = useState<'standard' | 'heatseker' | 'emp'>('standard');

  const waveKillsRef = useRef(0);
  const consecutiveHitsRef = useRef(0);

  const enemiesPerWave = (w: number) => Math.min(w, 3);

  // Called when an enemy is hit by missile impact
  const handleEnemyHit = useCallback(
    (_id: string, type: string) => {
      const points: Record<string, number> = {
        scout: 100,
        bomber: 200,
        ace: 500,
      };
      consecutiveHitsRef.current += 1;
      const m = Math.min(consecutiveHitsRef.current, 5);
      setMultiplier(m);
      setScore((prev) => prev + (points[type] || 100) * m);
      setKills((prev) => prev + 1);
      waveKillsRef.current += 1;

      const needed = enemiesPerWave(shooterWave);
      if (waveKillsRef.current >= needed) {
        if (shooterWave >= TOTAL_WAVES) {
          setTimeout(() => setAllCleared(true), 1500);
        } else {
          setWaveCleared(true);
          setTimeout(() => {
            setWaveCleared(false);
            waveKillsRef.current = 0;
            setShooterWave((prev) => prev + 1);
          }, 2000);
        }
      }
    },
    [shooterWave]
  );

  // Called by EnemyFighters when player clicks an enemy (consumes 1 ammo)
  const handleFireMissile = useCallback(() => {
    if (ammo <= 0 || reloading) return;
    setAmmo((prev) => prev - 1);
  }, [ammo, reloading]);

  // Auto-reload when ammo runs out
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (ammo <= 0 && !reloading && activeSection === 3) {
      setReloading(true);
      setReloadProgress(0);
      const start = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / RELOAD_TIME, 1);
        setReloadProgress(progress);
        if (progress >= 1) {
          clearInterval(interval);
          setReloading(false);
          setAmmo(MAX_AMMO);
          setReloadProgress(0);
        }
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ammo, activeSection]);

  // Reset on entering shooter section
  useEffect(() => {
    if (activeSection === 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScore(0);
      setKills(0);
      setMultiplier(1);
      setAmmo(MAX_AMMO);
      setReloading(false);
      setShooterWave(1);
      setWaveCleared(false);
      setAllCleared(false);
      setMissileType('standard');
      waveKillsRef.current = 0;
      consecutiveHitsRef.current = 0;
    }
  }, [activeSection]);

  return (
    <>
      <Crosshair />
      <MainLayout
        activeSection={activeSection}
        onJetClick={handleJetClick}
        shooterWave={shooterWave}
        ammo={ammo}
        reloading={reloading}
        missileType={missileType}
        onEnemyHit={handleEnemyHit}
        onFireMissile={handleFireMissile}
      >
        <Preloader
          active={activeSection === 0}
          onComplete={() => setActiveSection(1)}
        />
        <SkySection
          active={activeSection === 1}
          onNext={() => setActiveSection(2)}
          jetClicked={jetClicked}
        />
        <NCCSection
          active={activeSection === 2}
          onNext={() => setActiveSection(3)}
        />
        <ShooterSection
          active={activeSection === 3}
          onNext={() => setActiveSection(4)}
          score={score}
          kills={kills}
          wave={shooterWave}
          totalWaves={TOTAL_WAVES}
          ammo={ammo}
          maxAmmo={MAX_AMMO}
          reloading={reloading}
          reloadProgress={reloadProgress}
          multiplier={multiplier}
          missileType={missileType}
          onSwitchMissile={setMissileType}
          onSkip={() => setActiveSection(4)}
          waveCleared={waveCleared}
          allCleared={allCleared}
        />
        <FinaleSection active={activeSection === 4} />
      </MainLayout>
    </>
  );
}

export default App;

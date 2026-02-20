import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ShooterSectionProps {
    active: boolean;
    onNext: () => void;
    score: number;
    kills: number;
    wave: number;
    totalWaves: number;
    ammo: number;
    maxAmmo: number;
    reloading: boolean;
    reloadProgress: number;
    multiplier: number;
    missileType: 'standard' | 'heatseker' | 'emp';
    onSwitchMissile: (type: 'standard' | 'heatseker' | 'emp') => void;
    onSkip: () => void;
    waveCleared: boolean;
    allCleared: boolean;
}

const ShooterSection = ({
    active,
    onNext,
    score,
    kills,
    wave,
    totalWaves,
    ammo,
    maxAmmo,
    reloading,
    reloadProgress,
    multiplier,
    missileType,
    onSwitchMissile,
    onSkip,
    waveCleared,
    allCleared,
}: ShooterSectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hudRef = useRef<HTMLDivElement>(null);
    const successTextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!active) return;
            if (e.key === '1') onSwitchMissile('standard');
            if (e.key === '2') onSwitchMissile('heatseker');
            if (e.key === '3') onSwitchMissile('emp');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [active, onSwitchMissile]);

    const missileNames: Record<string, string> = {
        standard: 'STANDARD',
        heatseker: 'HEAT SEEKER',
        emp: 'EMP',
    };

    useEffect(() => {
        if (active && !allCleared) {
            gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.5 });
            gsap.fromTo(
                hudRef.current,
                { scale: 1.2, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' }
            );
        } else if (active && allCleared) {
            const tl = gsap.timeline();
            tl.to(hudRef.current, { autoAlpha: 0, duration: 0.3 })
                .fromTo(
                    successTextRef.current,
                    { scale: 0.5, opacity: 0, rotationX: 90 },
                    {
                        scale: 1,
                        opacity: 1,
                        rotationX: 0,
                        duration: 0.8,
                        ease: 'back.out(1.5)',
                    }
                )
                .to(successTextRef.current, {
                    scale: 1.1,
                    opacity: 0,
                    duration: 0.5,
                    delay: 2,
                    onComplete: onNext,
                });
        } else {
            gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.5 });
        }
    }, [active, allCleared, onNext]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-20 flex items-center justify-center opacity-0 invisible pointer-events-none"
        >
            {/* Tactical HUD Overlay */}
            <div
                ref={hudRef}
                className="absolute inset-4 md:inset-8 border-2 border-af-blue/30 rounded-3xl pointer-events-none"
            >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-saffron rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-saffron rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-saffron rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-saffron rounded-br-3xl" />

                {/* Top bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 font-orbitron text-saffron tracking-widest text-sm bg-navy/80 px-4 py-1">
                    WEAPON SYSTEMS ONLINE — WAVE {wave}/{totalWaves}
                </div>

                {/* Score panel (top-right) */}
                <div className="absolute top-8 right-8 text-right space-y-1">
                    <div className="font-orbitron text-gold text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                        {score.toLocaleString()}
                    </div>
                    <div className="font-montserrat text-af-blue text-xs tracking-widest uppercase">
                        Score
                    </div>
                    {multiplier > 1 && (
                        <div className="font-orbitron text-saffron text-sm animate-pulse">
                            ×{multiplier} COMBO
                        </div>
                    )}
                    <div className="font-montserrat text-white/60 text-xs">
                        Kills: {kills}
                    </div>
                </div>

                {/* Ammo panel (bottom-left) */}
                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <div className="flex gap-2">
                        {Array.from({ length: maxAmmo }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-8 rounded-sm transition-colors ${i < ammo
                                    ? 'bg-gold shadow-[0_0_6px_rgba(255,215,0,0.6)]'
                                    : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                    {reloading && (
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-saffron rounded-full transition-all"
                                    style={{ width: `${reloadProgress * 100}%` }}
                                />
                            </div>
                            <span className="font-orbitron text-saffron text-xs animate-pulse">
                                RELOADING
                            </span>
                        </div>
                    )}
                </div>

                {/* Missile type selector (bottom-right) */}
                <div className="absolute bottom-8 right-8 flex gap-2 pointer-events-auto">
                    {(['standard', 'heatseker', 'emp'] as const).map((t, i) => (
                        <button
                            key={t}
                            onClick={() => onSwitchMissile(t)}
                            className={`px-3 py-1.5 font-orbitron text-xs tracking-wider border rounded transition-all ${missileType === t
                                ? 'border-gold text-navy bg-gold shadow-[0_0_10px_rgba(255,215,0,0.4)]'
                                : 'border-white/20 text-white/50 hover:border-white/40'
                                }`}
                        >
                            <span className="block text-[10px] text-white/40 mb-0.5">
                                [{i + 1}]
                            </span>
                            {missileNames[t]}
                        </button>
                    ))}
                </div>

                {/* Click-to-fire instruction (bottom-center) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-orbitron text-af-blue/50 text-xs tracking-widest text-center">
                    {ammo > 0 && !reloading ? (
                        <span className="text-af-blue/40">🎯 CLICK ENEMY TO FIRE<br /><span className="text-[10px] text-white/30">Keys 1-3 to switch ammo</span></span>
                    ) : (
                        <span className="text-saffron/50">STAND BY — RELOADING...</span>
                    )}
                </div>

                {/* Skip Button (top-left) */}
                <button
                    onClick={onSkip}
                    className="absolute top-8 left-8 px-4 py-2 font-orbitron text-xs tracking-widest text-white/50 border border-white/20 rounded hover:bg-white/10 hover:text-white transition-colors pointer-events-auto"
                >
                    SKIP SIMULATION ⏭
                </button>

                {/* Wave cleared indicator */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${waveCleared && !allCleared ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <div className="font-orbitron text-gold text-3xl drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] tracking-widest animate-pulse text-center">
                        WAVE {Math.max(1, wave - (waveCleared ? 0 : 1))} CLEARED<br />
                        <span className="text-xl text-saffron mt-2 block opacity-80">INCOMING HOSTILES</span>
                    </div>
                </div>
            </div>

            {/* Final success text */}
            <div ref={successTextRef} className="opacity-0 flex flex-col items-center">
                <span className="text-5xl md:text-8xl font-orbitron text-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] tracking-widest uppercase">
                    Airspace Secured
                </span>
                <span className="mt-4 text-white font-montserrat tracking-[0.5em] uppercase text-sm">
                    All hostile targets eliminated
                </span>
            </div>
        </div>
    );
};

export default ShooterSection;

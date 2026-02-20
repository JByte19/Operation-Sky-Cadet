import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface FinaleSectionProps {
    active: boolean;
}

/* ── Tejas SVG — nose points DOWN (for top→bottom flyby) ── */
const JetSVG = ({ className = '' }: { className?: string }) => (
    <svg
        viewBox="0 0 120 40"
        className={`drop-shadow-[0_0_20px_rgba(255,153,51,0.9)] ${className}`}
        style={{ transform: 'rotate(180deg)' }}
    >
        <polygon
            points="60,2 10,30 25,32 30,38 50,32 70,32 90,38 95,32 110,30"
            fill="#5a7d9a"
            stroke="#ff9933"
            strokeWidth="1"
        />
        <polygon points="55,12 45,30 75,30 65,12" fill="#4a6b8a" />
        <circle cx="60" cy="20" r="3" fill="#ff9933" opacity="0.8" />
        <ellipse cx="60" cy="36" rx="8" ry="4" fill="#ff9933" opacity="0.6" />
    </svg>
);

const FinaleSection = ({ active }: FinaleSectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const jetFlybyRef = useRef<HTMLDivElement>(null);
    const jet2Ref = useRef<HTMLDivElement>(null);
    const jet3Ref = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (active) {
            // Phase 1: Sunrise gradient fades in
            gsap.to(containerRef.current, {
                autoAlpha: 1,
                duration: 2,
                ease: 'power2.inOut',
            });

            /* ─── Phase 2: V-Formation Flyby — TOP → BOTTOM ─── */
            // Lead jet: center, flies straight down
            // Jet 2: left-wing, offset to the left & slightly behind
            // Jet 3: right-wing, offset to the right & slightly behind
            const jetConfigs = [
                { ref: jetFlybyRef.current, xPos: '50%', xOffset: -40, delay: 0.8, size: 'lead' },   // Lead
                { ref: jet2Ref.current, xPos: '35%', xOffset: -28, delay: 1.2, size: 'wing' },        // Left wing
                { ref: jet3Ref.current, xPos: '65%', xOffset: -28, delay: 1.2, size: 'wing' },        // Right wing
            ];

            jetConfigs.forEach(({ ref, delay }) => {
                if (!ref) return;
                gsap.fromTo(
                    ref,
                    {
                        y: '-150%',   // Start above viewport
                        opacity: 0,
                        scale: 0.5,
                    },
                    {
                        y: '120vh',   // Fly past the bottom
                        opacity: 1,
                        scale: 1.3,
                        duration: 5,  // 5 second flyby — slow enough to appreciate
                        delay,
                        ease: 'power1.in',
                    }
                );
            });

            // Phase 3: Glow pulse behind text — starts as jets reach the middle
            if (glowRef.current) {
                gsap.fromTo(
                    glowRef.current,
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1.5,
                        opacity: 0.8,
                        duration: 2.5,
                        delay: 3,
                        ease: 'power2.out',
                    }
                );
                gsap.to(glowRef.current, {
                    scale: 2,
                    opacity: 0.3,
                    duration: 3.5,
                    delay: 5.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            }

            // Phase 4: 3D Text reveal — word-by-word as jets pass center
            const words = textRef.current?.querySelectorAll('.word');
            if (words) {
                gsap.fromTo(
                    words,
                    { opacity: 0, y: 80, z: -300, rotationX: 90, scale: 0.3 },
                    {
                        opacity: 1,
                        y: 0,
                        z: 0,
                        rotationX: 0,
                        scale: 1,
                        duration: 1.2,
                        stagger: 0.35,
                        delay: 3.2,
                        ease: 'back.out(1.4)',
                    }
                );
            }

            // Phase 4b: Subtitle letter-spacing animation
            gsap.fromTo(
                subtitleRef.current,
                { opacity: 0, y: 40, letterSpacing: '-0.3em' },
                {
                    opacity: 1,
                    y: 0,
                    letterSpacing: '0.8em',
                    duration: 3,
                    delay: 6,
                    ease: 'power3.out',
                }
            );

            // Phase 5: Tricolor fireworks (20 seconds)
            const duration = 20 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
            };
            const randomInRange = (min: number, max: number) =>
                Math.random() * (max - min) + min;

            const interval: ReturnType<typeof setInterval> = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                // Saffron burst
                confetti({
                    ...defaults,
                    particleCount: particleCount * 0.4,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#ff9933', '#ffaa44'],
                });
                // White burst
                confetti({
                    ...defaults,
                    particleCount: particleCount * 0.3,
                    origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 },
                    colors: ['#ffffff', '#eeeeee'],
                });
                // Green burst
                confetti({
                    ...defaults,
                    particleCount: particleCount * 0.3,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#138808', '#22aa22'],
                });
            }, 300);

            return () => clearInterval(interval);
        } else {
            gsap.to(containerRef.current, { autoAlpha: 0, duration: 1 });
        }
    }, [active]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none opacity-0 invisible overflow-hidden"
        >
            {/* Sunrise Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-saffron/40 via-gold/10 to-transparent mix-blend-screen pointer-events-none" />

            {/* Pulsating Golden Glow behind text */}
            <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255,215,0,0.45) 0%, rgba(255,153,51,0.15) 35%, transparent 65%)',
                }}
            />

            {/* ─── V-Formation Flyby: TOP → BOTTOM ─── */}
            {/* LEAD JET — center top */}
            <div
                ref={jetFlybyRef}
                className="absolute left-1/2 -translate-x-1/2 opacity-0 pointer-events-none z-10"
                style={{ top: '-150px' }}
            >
                <JetSVG className="w-56 md:w-72 h-auto" />
                {/* Vapor trail going UP (behind the jet) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[4px] h-[600px] bg-gradient-to-t from-white/70 via-white/25 to-transparent blur-[2px]" />
                <div className="absolute bottom-full left-[42%] w-[2px] h-[400px] bg-gradient-to-t from-white/40 to-transparent blur-[1px]" />
                <div className="absolute bottom-full left-[58%] w-[2px] h-[400px] bg-gradient-to-t from-white/40 to-transparent blur-[1px]" />
            </div>

            {/* LEFT WING — offset to the left and slightly behind */}
            <div
                ref={jet2Ref}
                className="absolute opacity-0 pointer-events-none z-10"
                style={{ top: '-120px', left: '35%', transform: 'translateX(-50%)' }}
            >
                <JetSVG className="w-40 md:w-52 h-auto opacity-85" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[3px] h-[450px] bg-gradient-to-t from-white/60 via-white/20 to-transparent blur-[1px]" />
            </div>

            {/* RIGHT WING — offset to the right and slightly behind */}
            <div
                ref={jet3Ref}
                className="absolute opacity-0 pointer-events-none z-10"
                style={{ top: '-120px', left: '65%', transform: 'translateX(-50%)' }}
            >
                <JetSVG className="w-40 md:w-52 h-auto opacity-85" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[3px] h-[450px] bg-gradient-to-t from-white/60 via-white/20 to-transparent blur-[1px]" />
            </div>

            {/* ─── Main Text — Cinematic 3D Reveal ─── */}
            <div className="relative z-20 flex flex-col items-center text-center px-4">
                <h1
                    ref={textRef}
                    className="text-4xl md:text-7xl lg:text-8xl font-orbitron drop-shadow-[0_0_30px_rgba(255,215,0,0.7)] tracking-widest leading-tight"
                    style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                >
                    <span className="word inline-block mx-1 text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-saffron">HAPPY</span>
                    <span className="word inline-block mx-1 text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-saffron">BIRTHDAY</span>
                    <br />
                    <span className="word inline-block mx-1 text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-saffron">COMMANDER</span>
                    <span className="word inline-block mx-1 ml-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-saffron">N I S</span>
                    <span className="word inline-block text-5xl md:text-7xl mx-1">🫡</span>
                </h1>

                <p
                    ref={subtitleRef}
                    className="mt-8 text-lg md:text-xl font-montserrat text-white tracking-[0.5em] uppercase font-light drop-shadow-md opacity-0"
                >
                    Salute to another glorious year
                </p>
            </div>
        </div>
    );
};

export default FinaleSection;

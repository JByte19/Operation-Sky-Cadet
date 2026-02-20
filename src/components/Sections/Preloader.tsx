import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ShieldAlert, Crosshair } from 'lucide-react';

interface PreloaderProps {
    onComplete: () => void;
    active: boolean;
}

/* ─── Canvas-based Radar ─── */
const RadarCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef(0);
    const blipsRef = useRef<Array<{ x: number; y: number; life: number; maxLife: number }>>([]);

    const spawnBlip = useCallback(
        (cx: number, cy: number, radius: number) => {
            const r = Math.random() * radius * 0.85;
            const a = Math.random() * Math.PI * 2;
            blipsRef.current.push({
                x: cx + Math.cos(a) * r,
                y: cy + Math.sin(a) * r,
                life: 1,
                maxLife: 1,
            });
        },
        []
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = 380;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 10;
        let rafId: number;

        const draw = () => {
            ctx.clearRect(0, 0, size, size);

            // Outer circle
            ctx.strokeStyle = 'rgba(0, 255, 80, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Range rings
            for (let i = 1; i <= 3; i++) {
                ctx.strokeStyle = `rgba(0, 255, 80, ${0.12 + i * 0.03})`;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.arc(cx, cy, (radius * i) / 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Cross-hairs
            ctx.strokeStyle = 'rgba(0, 255, 80, 0.15)';
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius);
            ctx.lineTo(cx, cy + radius);
            ctx.moveTo(cx - radius, cy);
            ctx.lineTo(cx + radius, cy);
            ctx.stroke();

            // Cardinal markers
            ctx.fillStyle = 'rgba(0, 255, 80, 0.5)';
            ctx.font = '10px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('N', cx, cy - radius + 14);
            ctx.fillText('S', cx, cy + radius - 6);
            ctx.fillText('E', cx + radius - 10, cy + 4);
            ctx.fillText('W', cx - radius + 10, cy + 4);

            // Sweep line with glow trail
            const angle = angleRef.current;

            // Fade trail (arc from angle-45deg to angle)
            for (let i = 0; i < 30; i++) {
                const a = angle - (i * Math.PI) / 40;
                const opacity = (1 - i / 30) * 0.25;
                ctx.strokeStyle = `rgba(0, 255, 80, ${opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
                ctx.stroke();
            }

            // Main sweep line
            ctx.strokeStyle = 'rgba(0, 255, 80, 0.9)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#00ff50';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Center dot
            ctx.fillStyle = '#00ff50';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();

            // Spawn blips near sweep line
            if (Math.random() < 0.04) {
                spawnBlip(cx, cy, radius);
            }

            // Draw & decay blips
            blipsRef.current = blipsRef.current.filter((b) => {
                b.life -= 0.008;
                if (b.life <= 0) return false;
                const alpha = b.life;
                ctx.fillStyle = `rgba(0, 255, 80, ${alpha})`;
                ctx.shadowColor = '#00ff50';
                ctx.shadowBlur = 6 * alpha;
                ctx.beginPath();
                ctx.arc(b.x, b.y, 2.5 + (1 - alpha) * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                return true;
            });

            angleRef.current += 0.025;
            rafId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(rafId);
    }, [spawnBlip]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60"
        />
    );
};

/* ─── Preloader ─── */
const Preloader = ({ onComplete, active }: PreloaderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const [text, setText] = useState('');

    const fullText =
        'INITIALIZING CLASSIFIED PROTOCOL... \nACCESSING SECURE SERVER... \nDECRYPTING FILE: N_I_S \nSTANDBY...';

    useEffect(() => {
        if (!active) return;

        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            setText(fullText.slice(0, currentIndex));
            currentIndex++;
            if (currentIndex > fullText.length) {
                clearInterval(typingInterval);
                if (btnRef.current) {
                    gsap.to(btnRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                    });
                }
            }
        }, 50);

        return () => clearInterval(typingInterval);
    }, [active]);

    const handleAccess = () => {
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                scale: 1.1,
                duration: 1.5,
                ease: 'power2.inOut',
                onComplete: onComplete,
            });
        }
    };

    if (!active && !containerRef.current) return null;

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-1000 ${!active ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {/* Canvas Radar */}
            <RadarCanvas />

            <div className="relative z-10 flex flex-col items-center max-w-2xl px-6">
                <ShieldAlert className="w-16 h-16 text-saffron mb-8 animate-pulse" />

                <div
                    ref={textRef}
                    className="font-orbitron text-af-blue text-sm md:text-base text-center min-h-[100px] whitespace-pre-line leading-relaxed tracking-widest"
                >
                    {text}
                    <span className="animate-pulse inline-block w-2 bg-af-blue h-4 ml-1 align-middle"></span>
                </div>

                <button
                    ref={btnRef}
                    onClick={handleAccess}
                    className="mt-12 opacity-0 translate-y-8 flex items-center gap-3 px-8 py-4 bg-navy border border-gold/50 text-gold font-orbitron tracking-[0.2em] uppercase hover:bg-gold hover:text-navy transition-all duration-300 group"
                >
                    <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    Access File
                </button>
            </div>
        </div>
    );
};

export default Preloader;

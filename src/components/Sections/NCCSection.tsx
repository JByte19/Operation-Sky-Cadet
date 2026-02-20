import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Medal, Target, Star, Flame, ChevronRight, Crosshair } from 'lucide-react';

interface NCCSectionProps {
    active: boolean;
    onNext: () => void;
}

// Custom SVG for NCC Air Wing Badge
const AirWingBadge = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.6))' }}>
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.3" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#FFD700" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

        {/* Eagle Wings */}
        <path d="M 50 45 Q 25 20 10 35 Q 30 50 45 45 Z" fill="#FFD700" />
        <path d="M 50 45 Q 75 20 90 35 Q 70 50 55 45 Z" fill="#FFD700" />

        {/* Eagle Body */}
        <polygon points="45,45 55,45 50,70" fill="#FFD700" />

        {/* Eagle Head */}
        <circle cx="50" cy="35" r="5" fill="#FFD700" />

        {/* Text inside */}
        <text x="50" y="25" fontSize="10" fill="#FFD700" textAnchor="middle" fontWeight="bold" letterSpacing="1" fontFamily="Orbitron">NCC</text>
        <text x="50" y="85" fontSize="8" fill="#FFD700" textAnchor="middle" fontWeight="bold" letterSpacing="1" fontFamily="Orbitron">AIR WING</text>
    </svg>
);

const achievements = [
    {
        title: "NCC CADET",
        desc: "Trained with discipline, marched with pride. A true soldier in spirit.",
        Icon: Medal,
        color: "text-red-400"
    },
    {
        title: "SHARPSHOOTER",
        desc: "Precision beyond measure. Hits the bullseye when it matters most.",
        Icon: Target,
        color: "text-red-500"
    },
    {
        title: "LEADERSHIP",
        desc: "Commands respect, inspires action. Born to lead from the front.",
        Icon: Star,
        color: "text-gold"
    },
    {
        title: "ENDURANCE",
        desc: "Unbreakable spirit. Pushes through every challenge without flinching.",
        Icon: Flame,
        color: "text-orange-500"
    }
];

const NCCSection = ({ active, onNext }: NCCSectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const badgeContainerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const bottomBarRef = useRef<HTMLDivElement>(null);
    const continueBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (active) {
            const tl = gsap.timeline();

            tl.to(containerRef.current, { autoAlpha: 1, duration: 0.8, ease: "power2.out" })
                // Animate rotating badge entering
                .fromTo(badgeContainerRef.current,
                    { scale: 0.5, opacity: 0, rotationY: -180 },
                    { scale: 1, opacity: 1, rotationY: 0, duration: 1.5, ease: "elastic.out(1, 0.7)" },
                    "-=0.5"
                )
                // Stagger cards in
                .fromTo(cardsRef.current,
                    { x: 50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
                    "-=1"
                )
                // Bottom bar
                .fromTo(bottomBarRef.current,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
                    "-=0.5"
                )
                // Continue button
                .fromTo(continueBtnRef.current,
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" },
                    "-=0.3"
                );

            // Continuous rotation for the badge container
            gsap.to(badgeContainerRef.current, {
                rotationY: 360,
                duration: 10,
                repeat: -1,
                ease: "linear",
            });

        } else {
            gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.5 });
            gsap.killTweensOf(badgeContainerRef.current);
        }
    }, [active]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm opacity-0 invisible pointer-events-none p-4 md:p-12 font-orbitron"
            style={{
                backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)' // Subtle dark glow on left
            }}
        >
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center pointer-events-auto h-full max-h-[800px] relative">

                {/* Left Side: Rotating Air Wing Badge */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center pt-10">
                    <div className="relative group perspective-1000 mb-6">
                        {/* Circular glow rings backing */}
                        <div className="absolute inset-0 rounded-full border border-green-700/50 scale-110"></div>
                        <div className="absolute inset-0 rounded-full border border-saffron/50 scale-105"></div>
                        <div className="absolute inset-0 rounded-full border border-white/20 scale-100"></div>

                        {/* Particles around badge */}
                        <div className="absolute inset-0 -m-8 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" style={{ maskImage: 'radial-gradient(circle at center, black 30%, transparent 60%)' }}></div>

                        {/* Badge Container (Rotating CSS 3D) */}
                        <div
                            ref={badgeContainerRef}
                            className="relative w-56 h-56 md:w-72 md:h-72 rounded-full border border-gold/30 flex items-center justify-center bg-navy/40 overflow-hidden transform-style-3d shadow-[0_0_30px_rgba(255,215,0,0.1)]"
                        >
                            <AirWingBadge className="w-40 h-40 md:w-56 md:h-56 transform translate-z-10" />
                        </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-gold tracking-[0.2em] uppercase text-center mt-4">
                        MEDAL OF HONOR
                    </h2>
                    <p className="text-xs md:text-sm text-af-blue uppercase tracking-[0.3em] font-montserrat mt-2 opacity-60">
                        Awarded for Excellence
                    </p>
                </div>

                {/* Right Side: Achievement Cards List */}
                <div className="lg:col-span-7 flex flex-col gap-4 relative">
                    {/* Decorative crosshair */}
                    <div className="absolute -left-6 bottom-4 w-12 h-12 pointer-events-none opacity-60 hidden lg:block">
                        <Crosshair className="w-full h-full text-gold stroke-1" />
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gold" />
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gold" />
                    </div>

                    {achievements.map((item, i) => (
                        <div
                            key={i}
                            ref={el => { if (el) cardsRef.current[i] = el; }}
                            className="flex items-start gap-5 bg-black/40 border border-white/10 p-5 md:p-6 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:border-gold/40 hover:bg-black/60 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:border-gold/50 transition-colors">
                                <item.Icon className={`w-6 h-6 ${item.color} filter drop-shadow-[0_0_5px_currentColor]`} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-gold tracking-[0.1em] text-sm md:text-base font-bold uppercase">
                                    {item.title}
                                </h3>
                                <p className="font-montserrat text-white/70 text-xs md:text-sm leading-relaxed max-w-lg">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar Details */}
                <div
                    ref={bottomBarRef}
                    className="lg:col-span-12 w-full mt-4 bg-navy/90 border border-af-blue/30 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_20px_rgba(93,138,168,0.1)] relative overflow-hidden"
                >
                    {/* Background scanlines for bottom bar */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

                    <div className="flex w-full justify-around items-center text-center">
                        <div className="flex flex-col gap-2">
                            <span className="text-af-blue text-[10px] md:text-xs tracking-[0.3em] opacity-60">RANK</span>
                            <span className="text-gold font-bold tracking-[0.1em] text-sm md:text-xl">CADET</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-af-blue text-[10px] md:text-xs tracking-[0.3em] opacity-60">UNIT</span>
                            <span className="text-gold font-bold tracking-[0.1em] text-sm md:text-xl">AIR WING</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-af-blue text-[10px] md:text-xs tracking-[0.3em] opacity-60">STATUS</span>
                            <span className="text-gold font-bold tracking-[0.1em] text-sm md:text-xl">ELITE</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-af-blue text-[10px] md:text-xs tracking-[0.3em] opacity-60">CERT</span>
                            <span className="text-gold font-bold tracking-[0.1em] text-sm md:text-xl">A++</span>
                        </div>
                    </div>

                    {/* Proceed/Access Range Button placed in the bottom bar */}
                    <button
                        ref={continueBtnRef}
                        onClick={onNext}
                        className="px-6 py-3 bg-gold text-navy font-bold uppercase tracking-[0.2em] text-xs md:text-sm hover:bg-white transition-colors duration-300 flex items-center gap-2 group md:ml-auto whitespace-nowrap"
                    >
                        Access Range
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NCCSection;

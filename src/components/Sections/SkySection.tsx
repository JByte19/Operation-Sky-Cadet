import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Plane } from 'lucide-react';

interface SkySectionProps {
    active: boolean;
    onNext: () => void;
    jetClicked: boolean;
}

const SkySection = ({ active, onNext, jetClicked }: SkySectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const text1Ref = useRef<HTMLHeadingElement>(null);
    const text2Ref = useRef<HTMLHeadingElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);
    const boomTextRef = useRef<HTMLDivElement>(null);
    const [showBoom, setShowBoom] = useState(false);

    useEffect(() => {
        if (active) {
            const tl = gsap.timeline();

            tl.fromTo(
                containerRef.current,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 1 }
            )
                .fromTo(
                    text1Ref.current,
                    { y: 50, opacity: 0, filter: 'blur(10px)' },
                    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }
                )
                .fromTo(
                    text2Ref.current,
                    { y: 50, opacity: 0, filter: 'blur(10px)' },
                    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' },
                    '-=1'
                )
                .fromTo(
                    hintRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 1, ease: 'power2.out' },
                    '-=0.5'
                )
                .fromTo(
                    btnRef.current,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' },
                    '-=0.5'
                );
        } else {
            gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.5 });
        }
    }, [active]);

    // Sonic boom effect
    useEffect(() => {
        if (jetClicked && active) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowBoom(true);
            if (boomTextRef.current) {
                gsap.fromTo(
                    boomTextRef.current,
                    { scale: 0.5, opacity: 0 },
                    { scale: 1.2, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
                );
                gsap.to(boomTextRef.current, {
                    scale: 1,
                    opacity: 0,
                    duration: 1,
                    delay: 1.5,
                    onComplete: () => setShowBoom(false),
                });
            }
        }
    }, [jetClicked, active]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none opacity-0 invisible z-20"
        >
            <div className="flex flex-col items-center mt-32 text-center max-w-4xl">
                <h1
                    ref={text1Ref}
                    className="text-4xl md:text-7xl font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white to-af-blue uppercase tracking-[0.1em] drop-shadow-[0_0_15px_rgba(93,138,168,0.5)]"
                >
                    Commander N I S
                </h1>
                <h2
                    ref={text2Ref}
                    className="text-xl md:text-3xl mt-4 font-montserrat font-light tracking-[0.3em] text-saffron uppercase"
                >
                    Defender of the Skies
                </h2>

                {/* Jet interaction hint */}
                <div
                    ref={hintRef}
                    className="mt-8 flex items-center gap-2 text-af-blue/60 font-montserrat text-xs tracking-widest animate-pulse pointer-events-none"
                >
                    <Plane className="w-4 h-4" />
                    <span>CLICK THE FIGHTER JET FOR SONIC BOOM</span>
                    <Plane className="w-4 h-4 -scale-x-100" />
                </div>

                {/* Sonic boom text */}
                {showBoom && (
                    <div
                        ref={boomTextRef}
                        className="mt-6 font-orbitron text-3xl text-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] tracking-[0.5em]"
                    >
                        💥 SONIC BOOM 💥
                    </div>
                )}

                <button
                    ref={btnRef}
                    onClick={onNext}
                    className="mt-16 pointer-events-auto group px-8 py-3 border border-af-blue/50 text-af-blue font-orbitron text-sm uppercase tracking-widest hover:bg-af-blue/10 transition-colors flex items-center gap-3"
                >
                    <Plane className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Proceed to Base
                </button>
            </div>
        </div>
    );
};

export default SkySection;

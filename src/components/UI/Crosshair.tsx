import { useEffect, useState } from 'react';

const Crosshair = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updatePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden mix-blend-difference"
        >
            <div
                className={`absolute w-12 h-12 border-2 border-gold rounded-full transition-transform duration-100 ease-out flex items-center justify-center opacity-80 ${isClicking ? 'scale-75' : 'scale-100'}`}
                style={{
                    transform: `translate(${position.x - 24}px, ${position.y - 24}px)`
                }}
            >
                <div className="w-1.5 h-1.5 bg-saffron rounded-full"></div>
                {/* Crosshair ticks */}
                <div className="absolute top-0 w-0.5 h-2 bg-gold"></div>
                <div className="absolute bottom-0 w-0.5 h-2 bg-gold"></div>
                <div className="absolute left-0 w-2 h-0.5 bg-gold"></div>
                <div className="absolute right-0 w-2 h-0.5 bg-gold"></div>
            </div>
        </div>
    );
};

export default Crosshair;

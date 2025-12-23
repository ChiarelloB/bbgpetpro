import React, { useEffect, useState } from 'react';

const InteractiveCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hide default cursor
        // Default cursor visible
        // document.body.style.cursor = 'none'; // Removed per user request

        const updateCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);

            // Update global CSS variables for spotlight effect
            document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.body.style.setProperty('--mouse-y', `${e.clientY}px`);

            // Check for hover state
            const target = e.target as HTMLElement;
            const isClickable = window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button');

            setIsHovering(!!isClickable);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', updateCursor);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', updateCursor);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.body.style.cursor = 'auto'; // Restore cursor on unmount
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="fixed pointer-events-none z-[9999] will-change-transform flex items-center justify-center mix-blend-difference"
            style={{
                left: 0,
                top: 0,
                transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`
            }}
        >
            {/* Black Hole Core (Small & Elegant) */}
            <div
                className={`rounded-full transition-transform duration-300 ease-out ${isHovering ? 'scale-[2.5]' : 'scale-100'}`}
                style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#000',
                    boxShadow: '0 0 10px 2px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)', // Purple glow
                    zIndex: 10
                }}
            ></div>

            {/* Event Horizon Ring */}
            <div
                className={`absolute rounded-full border border-primary transition-transform duration-300 ease-out ${isHovering ? 'scale-[1.5] opacity-50 border-2' : 'scale-100 opacity-80 border'}`}
                style={{
                    width: '32px',
                    height: '32px',
                    boxShadow: '0 0 15px 1px rgba(124, 58, 237, 0.4), inset 0 0 10px rgba(124, 58, 237, 0.2)'
                }}
            ></div>
        </div>
    );
};

export default InteractiveCursor;

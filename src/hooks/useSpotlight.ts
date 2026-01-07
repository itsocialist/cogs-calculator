import { useState, useCallback, useRef } from 'react';

interface SpotlightStyle {
    background: string;
}

interface SpotlightProps {
    /** Size of the spotlight gradient in pixels */
    size?: number;
    /** Color of the spotlight (CSS color) */
    color?: string;
    /** Opacity of the spotlight (0-1) */
    opacity?: number;
}

/**
 * Hook to create a mouse-tracking spotlight effect on cards.
 * Returns props to spread on the container element and a style for the spotlight layer.
 */
export const useSpotlight = ({
    size = 300,
    color = '255, 255, 255',
    opacity = 0.08
}: SpotlightProps = {}) => {
    const [spotlightStyle, setSpotlightStyle] = useState<SpotlightStyle>({
        background: 'transparent'
    });
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e?: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || !e) return; // Ensure e is defined before accessing its properties

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSpotlightStyle({
            background: `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(${color}, ${opacity}), transparent 60%)`
        });
    }, [size, color, opacity]);

    const handleMouseEnter = useCallback((_e?: React.MouseEvent<HTMLDivElement>) => {
        setIsHovering(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        setSpotlightStyle({ background: 'transparent' });
    }, []);

    return {
        containerRef,
        containerProps: {
            ref: containerRef,
            onMouseMove: handleMouseMove,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        },
        spotlightStyle: isHovering ? spotlightStyle : { background: 'transparent' },
        isHovering
    };
};

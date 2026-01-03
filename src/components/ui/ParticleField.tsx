import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number; // 35 = amber, 145 = emerald
}

interface ParticleFieldProps {
    particleCount?: number;
    connectionDistance?: number;
}

export const ParticleField = ({
    particleCount = 50,
    connectionDistance = 120
}: ParticleFieldProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialize particles
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5, // Slow, organic movement
                    vy: (Math.random() - 0.5) * 0.3 - 0.1, // Slight upward drift (like pollen)
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.5 + 0.2,
                    hue: Math.random() > 0.6 ? 35 : 145, // Amber or Emerald
                });
            }
        };
        initParticles();

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;

            // Draw connections first (behind particles)
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.15;
                        // Gradient line between the two particle colors
                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        gradient.addColorStop(0, `hsla(${particles[i].hue}, 80%, 60%, ${opacity})`);
                        gradient.addColorStop(1, `hsla(${particles[j].hue}, 80%, 60%, ${opacity})`);

                        ctx.beginPath();
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and update particles
            for (const particle of particles) {
                // Draw particle with glow
                ctx.beginPath();
                const glow = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                );
                glow.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${particle.opacity})`);
                glow.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, ${particle.opacity * 0.3})`);
                glow.addColorStop(1, `hsla(${particle.hue}, 80%, 50%, 0)`);

                ctx.fillStyle = glow;
                ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Draw core
                ctx.beginPath();
                ctx.fillStyle = `hsla(${particle.hue}, 80%, 80%, ${particle.opacity})`;
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();

                // Update position with organic wobble
                particle.x += particle.vx + Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 0.2;
                particle.y += particle.vy + Math.cos(Date.now() * 0.001 + particle.x * 0.01) * 0.1;

                // Wrap around edges
                if (particle.x < -20) particle.x = canvas.width + 20;
                if (particle.x > canvas.width + 20) particle.x = -20;
                if (particle.y < -20) particle.y = canvas.height + 20;
                if (particle.y > canvas.height + 20) particle.y = -20;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [particleCount, connectionDistance]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 5 }}
        />
    );
};

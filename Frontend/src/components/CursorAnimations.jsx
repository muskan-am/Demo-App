import { useRef, useEffect, useCallback } from 'react';

function parseColor(color) {
    const fallback = { r: 129, g: 140, b: 248 };
    if (!color) return fallback;
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length === 8) {
            hex = hex.slice(0, 6);
        }
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
        }
    }
    const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
        return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
    }
    return fallback;
}

const CursorAnimations = ({
    trailStyle = 'comet',
    trailColor = '#818cf8',
    particleSize = 8,
    trailIntensity = 8,
    fadeSpeed = 0.55,
    flowSpeed = 0.6,
    zIndex = 99999
}) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const trailPointsRef = useRef([]);
    const cometSparksRef = useRef([]);
    const bubblesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100, active: false });
    const reducedMotionRef = useRef(false);

    const rgbRef = useRef(parseColor(trailColor));
    const trailColorRef = useRef(trailColor);
    const trailStyleRef = useRef(trailStyle);

    useEffect(() => {
        const isLight = document.body.classList.contains('light-theme');
        const activeColor = isLight ? '#4f46e5' : trailColor;
        rgbRef.current = parseColor(activeColor);
        trailColorRef.current = activeColor;
    }, [trailColor]);

    useEffect(() => {
        trailStyleRef.current = trailStyle;
        particlesRef.current = [];
        trailPointsRef.current = [];
        cometSparksRef.current = [];
        bubblesRef.current = [];
    }, [trailStyle]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionRef.current = mediaQuery.matches;
        const handleChange = (e) => { reducedMotionRef.current = e.matches; };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const spawnParticles = useCallback((x, y, vx, vy) => {
        const now = performance.now();
        const count = Math.min(trailIntensity, 10);
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 2 * i / count + Math.random() * 0.2;
            const spread = particleSize * 0.3;
            particlesRef.current.push({
                x: x + Math.cos(angle) * spread * Math.random(),
                y: y + Math.sin(angle) * spread * Math.random(),
                size: particleSize * (0.8 + Math.random() * 0.6),
                opacity: 1,
                birth: now,
                vx: vx * flowSpeed * 0.1 + (Math.random() - 0.5) * 8,
                vy: vy * flowSpeed * 0.1 + (Math.random() - 0.5) * 8
            });
        }
        if (particlesRef.current.length > 120) {
            particlesRef.current = particlesRef.current.slice(-120);
        }
    }, [flowSpeed, particleSize, trailIntensity]);

    useEffect(() => {
        if (reducedMotionRef.current) return;
        let lastTime = performance.now();

        const handlePointerInput = (e) => {
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            if (clientX === undefined || clientY === undefined) return;

            const x = clientX;
            const y = clientY;
            const now = performance.now();
            const dt = Math.max((now - lastTime) / 1000, 0.001);
            lastTime = now;

            const lastX = mouseRef.current.lastX === -100 ? x : mouseRef.current.lastX;
            const lastY = mouseRef.current.lastY === -100 ? y : mouseRef.current.lastY;

            const vx = (x - lastX) / dt;
            const vy = (y - lastY) / dt;
            mouseRef.current = { x, y, lastX: x, lastY: y, active: true };

            // Always spawn sparkles on movement or tap
            const sparkCount = Math.max(Math.floor(trailIntensity * 0.8), 4);
            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.random() * Math.PI * 2);
                const speedVal = Math.random() * 2.8 + 0.6;
                cometSparksRef.current.push({
                    x: x + (Math.random() - 0.5) * 12,
                    y: y + (Math.random() - 0.5) * 12,
                    size: particleSize * (0.5 + Math.random() * 0.8),
                    opacity: 0.9 + Math.random() * 0.1,
                    birth: now,
                    vx: Math.cos(angle) * speedVal + vx * 0.02,
                    vy: Math.sin(angle) * speedVal + vy * 0.02,
                    rotation: Math.random() * Math.PI * 2,
                    spinSpeed: (Math.random() - 0.5) * 0.1
                });
            }
            if (cometSparksRef.current.length > 160) {
                cometSparksRef.current = cometSparksRef.current.slice(-160);
            }

            if (trailStyleRef.current === 'constellation') {
                spawnParticles(x, y, vx, vy);
            } else if (trailStyleRef.current === 'ribbon') {
                trailPointsRef.current.push({ x, y, time: now });
                if (trailPointsRef.current.length > 25) {
                    trailPointsRef.current = trailPointsRef.current.slice(-25);
                }
            } else if (trailStyleRef.current === 'bubbles') {
                bubblesRef.current.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    size: particleSize * (0.6 + Math.random() * 1.2),
                    opacity: 0.6,
                    birth: now,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 2 - 0.5,
                    wobble: Math.random() * Math.PI * 2,
                    wobbleSpeed: 0.04
                });
                if (bubblesRef.current.length > 80) {
                    bubblesRef.current = bubblesRef.current.slice(-80);
                }
            }
        };

        window.addEventListener('mousemove', handlePointerInput, { passive: true });
        window.addEventListener('pointermove', handlePointerInput, { passive: true });
        window.addEventListener('touchstart', handlePointerInput, { passive: true });
        window.addEventListener('touchmove', handlePointerInput, { passive: true });
        window.addEventListener('pointerdown', handlePointerInput, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handlePointerInput);
            window.removeEventListener('pointermove', handlePointerInput);
            window.removeEventListener('touchstart', handlePointerInput);
            window.removeEventListener('touchmove', handlePointerInput);
            window.removeEventListener('pointerdown', handlePointerInput);
        };
    }, [spawnParticles, trailIntensity, particleSize]);

    // Helper: Draw 4-pointed glowing sparkle star
    const drawSparkleStar = useCallback((ctx, x, y, size, rotation, alpha, rgb) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // 1. Glowing outer halo
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.95})`;
        ctx.shadowBlur = size * 2.2;

        // 2. Outer 4-Point Star Fill (Theme Indigo/Violet)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? size : size * 0.18; // Sharp 4-point sparkle star ratio
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // 3. Bright White Inner 4-Point Sparkle Core
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha * 1.25, 1)})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? size * 0.45 : size * 0.08;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxAge = fadeSpeed * 1000;

        const drawCometSparks = (now) => {
            const rgb = rgbRef.current;
            const newSparks = [];

            for (const s of cometSparksRef.current) {
                const age = now - s.birth;
                if (age > maxAge) continue;

                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.94;
                s.vy *= 0.94;
                s.rotation += s.spinSpeed || 0.05;

                const progress = age / maxAge;
                const alpha = (1 - progress) * s.opacity;
                const size = s.size * (1 - progress * 0.4);

                if (size > 0.5 && alpha > 0.05) {
                    drawSparkleStar(ctx, s.x, s.y, size, s.rotation, alpha, rgb);
                }

                newSparks.push(s);
            }
            cometSparksRef.current = newSparks;
        };

        const drawActiveCursorStar = (now) => {
            if (!mouseRef.current.active || mouseRef.current.x < 0) return;
            const rgb = rgbRef.current;
            const pulse = 1 + Math.sin(now * 0.008) * 0.2;
            const rot = (now * 0.003) % (Math.PI * 2);

            // Draw glowing head sparkle star directly at pointer coordinates
            drawSparkleStar(ctx, mouseRef.current.x, mouseRef.current.y, particleSize * 1.3 * pulse, rot, 0.95, rgb);
        };

        const animate = () => {
            if (reducedMotionRef.current) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            const now = performance.now();
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Render live sparkle star particles
            drawCometSparks(now);

            // Render glowing cursor star at current pointer position
            drawActiveCursorStar(now);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [fadeSpeed, particleSize, drawSparkleStar]);

    return (
        <div
            ref={containerRef}
            className="cursor-animations-container"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                pointerEvents: 'none',
                touchAction: 'none',
                zIndex: zIndex,
                background: 'transparent'
            }}
            aria-hidden="true"
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    touchAction: 'none'
                }}
            />
        </div>
    );
};

export default CursorAnimations;

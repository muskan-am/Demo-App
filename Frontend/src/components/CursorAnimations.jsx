
import React, { useRef, useEffect, useCallback } from 'react';

function parseColor(color) {
    const fallback = { r: 99, g: 102, b: 241 };
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
    particleSize = 6,
    trailIntensity = 6,
    fadeSpeed = 0.45,
    flowSpeed = 0.6,
    zIndex = 9999
}) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const trailPointsRef = useRef([]);
    const cometSparksRef = useRef([]);
    const bubblesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100 });
    const reducedMotionRef = useRef(false);

    const rgbRef = useRef(parseColor(trailColor));
    const trailColorRef = useRef(trailColor);
    const trailStyleRef = useRef(trailStyle);

    useEffect(() => {
        const isLight = document.body.classList.contains('light-theme');
        const activeColor = isLight ? '#6366f1' : trailColor;
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
        const count = Math.min(trailIntensity, 8);
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 2 * i / count + Math.random() * 0.2;
            const spread = particleSize * 0.2;
            particlesRef.current.push({
                x: x + Math.cos(angle) * spread * Math.random(),
                y: y + Math.sin(angle) * spread * Math.random(),
                size: particleSize * (0.8 + Math.random() * 0.4),
                opacity: 1,
                birth: now,
                vx: vx * flowSpeed * 0.1 + (Math.random() - 0.5) * 8,
                vy: vy * flowSpeed * 0.1 + (Math.random() - 0.5) * 8
            });
        }
        if (particlesRef.current.length > 100) {
            particlesRef.current = particlesRef.current.slice(-100);
        }
    }, [flowSpeed, particleSize, trailIntensity]);

    useEffect(() => {
        if (reducedMotionRef.current) return;
        let lastTime = performance.now();

        const handleMouseMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const now = performance.now();
            const dt = Math.max((now - lastTime) / 1000, 0.001);
            lastTime = now;

            const vx = (x - mouseRef.current.lastX) / dt;
            const vy = (y - mouseRef.current.lastY) / dt;
            mouseRef.current = { x, y, lastX: x, lastY: y };

            const dist = Math.sqrt(vx * vx + vy * vy) * dt;
            if (dist > 1.5) {
                if (trailStyleRef.current === 'constellation') {
                    spawnParticles(x, y, vx, vy);
                } else if (trailStyleRef.current === 'ribbon') {
                    trailPointsRef.current.push({ x, y, time: now });
                    const maxPoints = Math.floor(trailIntensity * 15);
                    if (trailPointsRef.current.length > maxPoints) {
                        trailPointsRef.current = trailPointsRef.current.slice(-maxPoints);
                    }
                } else if (trailStyleRef.current === 'comet') {
                    const sparkCount = Math.floor(trailIntensity * 0.6);
                    for (let i = 0; i < sparkCount; i++) {
                        const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
                        const speedVal = Math.random() * 2 + 0.5;
                        cometSparksRef.current.push({
                            x: x + (Math.random() - 0.5) * 6,
                            y: y + (Math.random() - 0.5) * 6,
                            size: particleSize * (0.3 + Math.random() * 0.6),
                            opacity: 0.8 + Math.random() * 0.2,
                            birth: now,
                            vx: Math.cos(angle) * speedVal,
                            vy: Math.sin(angle) * speedVal,
                            rotation: Math.random() * Math.PI * 2,
                            twinkle: Math.random() * Math.PI * 2
                        });
                    }
                    if (cometSparksRef.current.length > 120) {
                        cometSparksRef.current = cometSparksRef.current.slice(-120);
                    }
                } else if (trailStyleRef.current === 'bubbles') {
                    const bubbleCount = Math.floor(trailIntensity * 0.4);
                    for (let i = 0; i < bubbleCount; i++) {
                        bubblesRef.current.push({
                            x: x + (Math.random() - 0.5) * 20,
                            y: y + (Math.random() - 0.5) * 20,
                            size: particleSize * (0.6 + Math.random() * 1.2),
                            opacity: 0.5 + Math.random() * 0.3,
                            birth: now,
                            vx: (Math.random() - 0.5) * 2,
                            vy: -Math.random() * 2 - 0.5,
                            wobble: Math.random() * Math.PI * 2,
                            wobbleSpeed: 0.03 + Math.random() * 0.04
                        });
                    }
                    if (bubblesRef.current.length > 80) {
                        bubblesRef.current = bubblesRef.current.slice(-80);
                    }
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches[0]) handleMouseMove(e.touches[0]);
        }, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [spawnParticles, trailIntensity, particleSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxAge = fadeSpeed * 1000;

        const drawRibbon = (points, now) => {
            if (points.length < 2) return;
            const rgb = rgbRef.current;
            const baseWidth = particleSize * 2;
            const activePoints = points.filter((p) => now - p.time < maxAge);
            trailPointsRef.current = activePoints;
            if (activePoints.length < 2) return;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 1; i < activePoints.length; i++) {
                const p0 = activePoints[i - 1];
                const p1 = activePoints[i];
                const age0 = (now - p0.time) / maxAge;
                const age1 = (now - p1.time) / maxAge;
                const opacity = Math.pow(1 - age1, 2) * 0.85;
                const width = baseWidth * (1 - age1 * 0.7);
                if (width < 0.5) continue;

                const gradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
                const opacity0 = Math.pow(1 - age0, 2) * 0.85;
                gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity0})`);
                gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = width;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);

                if (i < activePoints.length - 1) {
                    const p2 = activePoints[i + 1];
                    const endX = (p1.x + p2.x) / 2;
                    const endY = (p1.y + p2.y) / 2;
                    ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
                } else {
                    ctx.lineTo(p1.x, p1.y);
                }
                ctx.stroke();
            }

            if (activePoints.length > 0) {
                const tip = activePoints[activePoints.length - 1];
                const tipGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, baseWidth * 1.5);
                tipGlow.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
                tipGlow.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
                tipGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                ctx.beginPath();
                ctx.arc(tip.x, tip.y, baseWidth * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = tipGlow;
                ctx.fill();
            }
        };

        const drawComet = (now) => {
            const rgb = rgbRef.current;
            const newSparks = [];

            for (const spark of cometSparksRef.current) {
                const age = now - spark.birth;
                if (age > maxAge) continue;

                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.vx *= 0.98;
                spark.vy *= 0.98;
                spark.twinkle += 0.15;

                const normalizedAge = age / maxAge;
                const baseFade = Math.pow(1 - normalizedAge, 2);
                const twinkleFactor = 0.7 + 0.3 * Math.sin(spark.twinkle);
                spark.opacity = baseFade * twinkleFactor;
                const size = spark.size * (1 - normalizedAge * 0.5);
                if (size < 0.5) continue;

                ctx.save();
                ctx.translate(spark.x, spark.y);
                ctx.rotate(spark.rotation + normalizedAge * 2);

                const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
                innerGlow.addColorStop(0, `rgba(255, 255, 255, ${spark.opacity * 0.95})`);
                innerGlow.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${spark.opacity * 0.75})`);
                innerGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = innerGlow;
                ctx.fill();

                ctx.strokeStyle = `rgba(255, 255, 255, ${spark.opacity * 0.7})`;
                ctx.lineWidth = size * 0.35;
                ctx.lineCap = 'round';

                ctx.beginPath(); ctx.moveTo(-size * 1.2, 0); ctx.lineTo(size * 1.2, 0); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, -size * 1.2); ctx.lineTo(0, size * 1.2); ctx.stroke();

                ctx.restore();
                newSparks.push(spark);
            }
            cometSparksRef.current = newSparks;

            const headX = mouseRef.current.x;
            const headY = mouseRef.current.y;
            if (headX < 0 || headY < 0) return;

            const headSize = particleSize * 1.2;

            const outerGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 3);
            outerGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`);
            outerGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
            outerGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            ctx.beginPath(); ctx.arc(headX, headY, headSize * 3, 0, Math.PI * 2); ctx.fillStyle = outerGlow; ctx.fill();

            const midGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 1.5);
            midGlow.addColorStop(0, `rgba(255, 255, 255, 0.95)`);
            midGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            midGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            ctx.beginPath(); ctx.arc(headX, headY, headSize * 1.5, 0, Math.PI * 2); ctx.fillStyle = midGlow; ctx.fill();

            const coreGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 0.7);
            coreGlow.addColorStop(0, `rgba(255, 255, 255, 1)`);
            coreGlow.addColorStop(0.6, `rgba(255, 255, 255, 0.85)`);
            coreGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
            ctx.beginPath(); ctx.arc(headX, headY, headSize * 0.7, 0, Math.PI * 2); ctx.fillStyle = coreGlow; ctx.fill();
        };

        const drawBubbles = (now) => {
            const rgb = rgbRef.current;
            const newBubbles = [];
            for (const bubble of bubblesRef.current) {
                const age = now - bubble.birth;
                if (age > maxAge * 1.5) continue;

                bubble.wobble += bubble.wobbleSpeed;
                bubble.x += bubble.vx + Math.sin(bubble.wobble) * 0.5;
                bubble.y += bubble.vy;
                bubble.vy *= 0.995;
                bubble.vx *= 0.98;

                const normalizedAge = age / (maxAge * 1.5);
                const fadeOut = normalizedAge > 0.7 ? 1 - (normalizedAge - 0.7) / 0.3 : 1;
                bubble.opacity = bubble.opacity * fadeOut;
                const size = bubble.size * (1 + normalizedAge * 0.3);
                if (bubble.opacity < 0.05) continue;

                ctx.save();
                ctx.beginPath(); ctx.arc(bubble.x, bubble.y, size, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                const bubbleGradient = ctx.createRadialGradient(bubble.x - size * 0.3, bubble.y - size * 0.3, 0, bubble.x, bubble.y, size);
                bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.35})`);
                bubbleGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.2})`);
                bubbleGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.05})`);
                ctx.beginPath(); ctx.arc(bubble.x, bubble.y, size, 0, Math.PI * 2); ctx.fillStyle = bubbleGradient; ctx.fill();

                const highlightSize = size * 0.35;
                const highlightX = bubble.x - size * 0.35;
                const highlightY = bubble.y - size * 0.35;
                const highlight = ctx.createRadialGradient(highlightX, highlightY, 0, highlightX, highlightY, highlightSize);
                highlight.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.75})`);
                highlight.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.beginPath(); ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2); ctx.fillStyle = highlight; ctx.fill();

                ctx.restore();
                newBubbles.push(bubble);
            }
            bubblesRef.current = newBubbles;
        };

        const drawConstellation = (now) => {
            const newParticles = [];
            const rgb = rgbRef.current;

            for (const particle of particlesRef.current) {
                const age = now - particle.birth;
                if (age > maxAge) continue;

                particle.vx *= 0.96;
                particle.vy *= 0.96;
                particle.x += particle.vx * 0.016;
                particle.y += particle.vy * 0.016;

                const normalizedAge = age / maxAge;
                particle.opacity = Math.pow(1 - normalizedAge, 1.5);
                const size = particle.size * (1 - normalizedAge * 0.2);

                const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size);
                gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`);
                gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity * 0.6})`);
                gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                ctx.beginPath(); ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();

                newParticles.push(particle);
            }

            const connectLimit = Math.min(newParticles.length, 40);
            ctx.lineWidth = 1;
            for (let i = 0; i < connectLimit; i++) {
                const p1 = newParticles[i];
                for (let j = i + 1; j < Math.min(i + 5, connectLimit); j++) {
                    const p2 = newParticles[j];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < particleSize * 5) {
                        const opacity = (1 - dist / (particleSize * 5)) * p1.opacity * p2.opacity * 0.5;
                        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                    }
                }
            }
            particlesRef.current = newParticles;
        };

        const animate = () => {
            if (reducedMotionRef.current) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            const now = performance.now();
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            if (trailStyleRef.current === 'ribbon') {
                drawRibbon(trailPointsRef.current, now);
            } else if (trailStyleRef.current === 'comet') {
                drawComet(now);
            } else if (trailStyleRef.current === 'bubbles') {
                drawBubbles(now);
            } else {
                drawConstellation(now);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [fadeSpeed, particleSize]);

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
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default CursorAnimations;

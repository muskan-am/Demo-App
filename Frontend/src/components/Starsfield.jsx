// ============================================================
// Starsfield.jsx — Framer Ambient Particle Starfield Component
// ============================================================
// Features:
//   - HTML5 Canvas high-performance 2D/3D perspective starfield
//   - Dual Light & Dark theme vibrant color palettes
//   - Radial gradient outer glow halos + bright core star particles
//   - Continuous animation loop with ResizeObserver container tracking
//   - Global pointer move cursor drift tracking
// ============================================================

import React, { useEffect, useRef, useCallback } from 'react';

const Z_NEAR = 0.12;
const Z_FAR = 0.98;
const OFFSCREEN_MARGIN = 50;

function saturate(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
function smooth01(t) { return t * t * (3 - 2 * t); }

const DARK_STAR_COLORS = [
    { r: 168, g: 85,  b: 247 }, // #a855f7
    { r: 99,  g: 102, b: 241 }, // #6366f1
    { r: 236, g: 72,  b: 153 }, // #ec4899
    { r: 59,  g: 130, b: 246 }, // #3b82f6
    { r: 52,  g: 211, b: 153 }, // #34d399
    { r: 56,  g: 189, b: 248 }  // #38bdf8
];

const LIGHT_STAR_COLORS = [
    { r: 79,  g: 70,  b: 229 }, // #4f46e5
    { r: 124, g: 58,  b: 237 }, // #7c3aed
    { r: 219, g: 39,  b: 119 }, // #db2777
    { r: 2,   g: 132, b: 199 }, // #0284c7
    { r: 5,   g: 150, b: 105 }  // #059669
];

const Starsfield = ({
    starCount = 220,
    speed = 0.08,
    spread = 2.2,
    focal = 0.75,
    twinkle = 0.5,
    starSize = 2.2,
    followCursor = true
}) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const starsRef = useRef([]);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(performance.now());

    const followTargetRef = useRef({ x: 0, y: 0 });
    const followRef = useRef({ x: 0, y: 0 });

    const getColors = () => {
        const isLight = document.body.classList.contains('light-theme');
        return isLight ? LIGHT_STAR_COLORS : DARK_STAR_COLORS;
    };

    const respawnStar = (s, w, h, f, spreadVal, baseSize) => {
        const z = Z_FAR;
        const halfW = w / 2;
        const halfH = h / 2;
        const sx = (Math.random() * 2 - 1) * (halfW * spreadVal + OFFSCREEN_MARGIN);
        const sy = (Math.random() * 2 - 1) * (halfH * spreadVal + OFFSCREEN_MARGIN);
        s.z = z;
        s.x = sx * z / f;
        s.y = sy * z / f;
        s.phase = Math.random() * Math.PI * 2;
        s.twinkle = 0.5 + Math.random() * 1.5;
        s.size = baseSize * (0.8 + Math.random() * 1.2);
        s.colorIndex = Math.floor(Math.random() * 6);
    };

    const initStars = useCallback((w, h) => {
        const f = Math.min(w, h) * focal;
        const arr = new Array(starCount).fill(0).map(() => {
            const z = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
            const worldW = w * z / f;
            const worldH = h * z / f;
            return {
                x: (Math.random() - 0.5) * worldW * spread,
                y: (Math.random() - 0.5) * worldH * spread,
                z,
                phase: Math.random() * Math.PI * 2,
                twinkle: 0.5 + Math.random() * 1.5,
                size: starSize * (0.8 + Math.random() * 1.2),
                colorIndex: Math.floor(Math.random() * 6)
            };
        });
        starsRef.current = arr;
    }, [focal, spread, starCount, starSize]);

    const resizeAndInit = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const w = Math.max(100, parent.clientWidth);
        const h = Math.max(100, parent.clientHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        initStars(w, h);
    }, [initStars]);

    const drawFrame = useCallback((ctx, canvas, now, dt) => {
        const w = canvas.clientWidth || 800;
        const h = canvas.clientHeight || 600;
        const baseCx = w / 2;
        const baseCy = h / 2;

        ctx.clearRect(0, 0, w, h);

        let camX = baseCx;
        let camY = baseCy;
        if (followCursor) {
            const follow = followRef.current;
            const target = followTargetRef.current;
            const k = dt > 0 ? Math.min(1, dt * 5) : 0;
            follow.x += (target.x - follow.x) * k;
            follow.y += (target.y - follow.y) * k;
            camX = baseCx - follow.x * w * 0.12;
            camY = baseCy - follow.y * h * 0.12;
        }

        const f = Math.min(w, h) * focal;
        const speedFactor = dt * speed * -0.7;
        const twinkleSpeed = now * 0.0018;
        const depthSpan = Z_FAR - Z_NEAR;
        const invRange = 1 / Math.max(0.05, depthSpan);

        const palette = getColors();
        const stars = starsRef.current;

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.z += speedFactor;
            if (s.z <= Z_NEAR) {
                respawnStar(s, w, h, f, spread, starSize);
                continue;
            }

            const invz = 1 / s.z;
            const x2d = s.x * f * invz + camX;
            const y2d = s.y * f * invz + camY;

            if (x2d < -OFFSCREEN_MARGIN || x2d > w + OFFSCREEN_MARGIN || y2d < -OFFSCREEN_MARGIN || y2d > h + OFFSCREEN_MARGIN) {
                respawnStar(s, w, h, f, spread, starSize);
                continue;
            }

            const twk = Math.max(0, Math.min(1, 0.6 + twinkle * 0.4 * Math.sin(s.phase + twinkleSpeed * s.twinkle)));
            const tFar = (Z_FAR - s.z) * invRange;
            const tNear = (s.z - Z_NEAR) * invRange;
            const appear = smooth01(saturate(tFar)) * smooth01(saturate(tNear));
            const size = s.size * invz * appear;
            const alpha = Math.min(1, (0.35 + twk * 0.65)) * appear;

            if (size < 0.2 || alpha < 0.02) continue;

            const c = palette[s.colorIndex % palette.length];

            // Outer glow halo
            const grad = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, Math.max(1, size * 2.5));
            grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`);
            grad.addColorStop(0.4, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x2d, y2d, Math.max(1, size * 2.5), 0, Math.PI * 2);
            ctx.fill();

            // Bright core dot
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(x2d, y2d, Math.max(0.6, size * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
    }, [followCursor, focal, speed, spread, starSize, twinkle]);

    useEffect(() => {
        resizeAndInit();

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        lastTimeRef.current = performance.now();
        const loop = () => {
            const now = performance.now();
            const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
            lastTimeRef.current = now;
            drawFrame(ctx, canvas, now, dt);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        const onResize = () => {
            resizeAndInit();
        };

        window.addEventListener('resize', onResize);
        
        let ro = null;
        if (containerRef.current && window.ResizeObserver) {
            ro = new ResizeObserver(() => {
                resizeAndInit();
            });
            ro.observe(containerRef.current);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            window.removeEventListener('resize', onResize);
            if (ro) ro.disconnect();
        };
    }, [resizeAndInit, drawFrame]);

    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!followCursor) return;
            followTargetRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            followTargetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [followCursor]);

    return (
        <div
            ref={containerRef}
            className="starsfield-container"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1
            }}
            aria-hidden="true"
        >
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
};

export default Starsfield;

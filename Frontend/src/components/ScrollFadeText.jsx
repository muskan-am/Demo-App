// ============================================================
// ScrollFadeText.jsx — Framer 3D Scroll Image Scatter Component
// ============================================================
// Features:
//   - 8 High-definition UI showcase image cards that scatter 360° outward on scroll
//   - Center headline "Engineered for Perfection" positioned below floating Navbar
//   - Glassmorphism image frames with drop shadows & badge labels
//   - Complete fade-out to 0 opacity before Video Reveal section
// ============================================================

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import scatterCardImg from '../assets/scatter_card.png';

const SCATTER_CARDS = [
    {
        id: 1,
        title: 'Bcrypt Passwords',
        icon: '🔒',
        image: scatterCardImg,
        start: { x: -320, y: -140, scale: 0.85, rotate: -6 },
        end:   { x: -540, y: -270, scale: 0.55, rotate: -15 }
    },
    {
        id: 2,
        title: 'JWT Auth Tokens',
        icon: '🪙',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        start: { x: 320, y: -140, scale: 0.85, rotate: 6 },
        end:   { x: 540, y: -270, scale: 0.55, rotate: 15 }
    },
    {
        id: 3,
        title: 'RBAC Control',
        icon: '🛡️',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        start: { x: -390, y: 10,  scale: 0.8, rotate: -4 },
        end:   { x: -620, y: 10,  scale: 0.5, rotate: -10 }
    },
    {
        id: 4,
        title: 'High Speed Vite',
        icon: '⚡',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
        start: { x: 390, y: 10,  scale: 0.8, rotate: 4 },
        end:   { x: 620, y: 10,  scale: 0.5, rotate: 10 }
    },
    {
        id: 5,
        title: 'Glassmorphism UX',
        icon: '🎨',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        start: { x: -300, y: 150, scale: 0.85, rotate: -5 },
        end:   { x: -500, y: 270, scale: 0.55, rotate: -12 }
    },
    {
        id: 6,
        title: 'RESTful API',
        icon: '🌐',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        start: { x: 300, y: 150, scale: 0.85, rotate: 5 },
        end:   { x: 500, y: 270, scale: 0.55, rotate: 12 }
    },
    {
        id: 7,
        title: 'Admin Control',
        icon: '⚙️',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        start: { x: 0, y: -190, scale: 0.9, rotate: -2 },
        end:   { x: 0, y: -330, scale: 0.6, rotate: -6 }
    },
    {
        id: 8,
        title: 'Framer Motion',
        icon: '✨',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        start: { x: 0, y: 190,  scale: 0.9, rotate: 2 },
        end:   { x: 0, y: 330,  scale: 0.6, rotate: 6 }
    }
];

const ScrollFadeText = () => {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const rawTitleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.55, 0.82], [0.8, 1, 1, 0]);
    const rawTitleScale   = useTransform(scrollYProgress, [0, 0.5, 0.82], [1, 1, 0.92]);
    const titleOpacity = useSpring(rawTitleOpacity, { stiffness: 120, damping: 25 });
    const titleScale   = useSpring(rawTitleScale,   { stiffness: 120, damping: 25 });

    return (
        <section
            ref={containerRef}
            className="scroll-scatter-section"
            style={{
                position: 'relative',
                width: '100%',
                height: '110vh',
                zIndex: 2,
                margin: 0
            }}
        >
            <div
                style={{
                    position: 'sticky',
                    top: '120px',
                    height: 'calc(100vh - 160px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                {/* Center Headline */}
                <motion.div
                    style={{
                        textAlign: 'center',
                        zIndex: 2,
                        padding: '0 20px',
                        maxWidth: '720px',
                        opacity: titleOpacity,
                        scale: titleScale,
                        willChange: 'transform, opacity'
                    }}
                >
                    <span className="section-eyebrow" style={{ letterSpacing: '3px', fontWeight: 800 }}>
                        EXCELLENCE & PERFORMANCE
                    </span>
                    <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', margin: '12px 0', lineHeight: 1.15 }}>
                        Engineered for Perfection
                    </h2>
                    <p className="section-subtitle" style={{ maxWidth: '540px', margin: '0 auto' }}>
                        Scroll down to explore how our application architecture scales seamlessly.
                    </p>
                </motion.div>

                {/* Floating Scattering Image Cards */}
                {SCATTER_CARDS.map((card) => {
                    const x       = useTransform(scrollYProgress, [0.05, 0.75], [card.start.x, card.end.x]);
                    const y       = useTransform(scrollYProgress, [0.05, 0.75], [card.start.y, card.end.y]);
                    const scale   = useTransform(scrollYProgress, [0.05, 0.75], [card.start.scale, card.end.scale]);
                    const rotate  = useTransform(scrollYProgress, [0.05, 0.75], [card.start.rotate, card.end.rotate]);
                    const opacity = useTransform(scrollYProgress, [0.05, 0.25, 0.6, 0.82], [0.7, 1, 1, 0]);

                    return (
                        <motion.div
                            key={card.title}
                            className="scatter-image-card"
                            style={{
                                position: 'absolute',
                                x,
                                y,
                                scale,
                                rotate,
                                opacity,
                                width: '180px',
                                height: '115px',
                                borderRadius: '18px',
                                overflow: 'hidden',
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                                pointerEvents: 'none',
                                zIndex: 1,
                                willChange: 'transform, opacity'
                            }}
                        >
                            <img
                                src={card.image}
                                alt={card.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: 'brightness(0.9) contrast(1.05)'
                                }}
                            />
                            {/* Glass Badge Label Overlay */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px',
                                    right: '8px',
                                    padding: '5px 8px',
                                    borderRadius: '10px',
                                    background: 'rgba(15, 12, 41, 0.82)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span style={{ fontSize: '0.85rem' }}>{card.icon}</span>
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        color: '#ffffff',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {card.title}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default ScrollFadeText;

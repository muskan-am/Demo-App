// ============================================================
// Header.jsx — Hero Section with Framer CreativeLab Magnetic & Glow Effects
// ============================================================
// Features:
//   - Framer CreativeLab Magnetic Interactive Typography (MagneticLetter)
//   - Framer CreativeLab Cursor Follower Glow Light (blobX, blobY with spring physics)
//   - Ambient Floating Bubbles background animation
//   - Full Auth navigation logic ("Get Started" -> /login or /dashboard)
// ============================================================

import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import useAuth from '../hooks/useAuth';
import FloatingBubbles from './FloatingBubbles';

// Magnetic Letter Component from Framer CreativeLab
const MagneticLetter = ({ char, containerRef, mouseX, mouseY, magneticStrength = 35, hoverRadius = 130, isHighlight = false }) => {
    const letterRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateLetterPosition = () => {
            if (!letterRef.current || !containerRef.current) return;
            const letterRect = letterRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const letterCenterX = letterRect.left - containerRect.left + letterRect.width / 2;
            const letterCenterY = letterRect.top - containerRect.top + letterRect.height / 2;
            const curMouseX = mouseX.get();
            const curMouseY = mouseY.get();
            const dx = curMouseX - letterCenterX;
            const dy = curMouseY - letterCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < hoverRadius && curMouseX > -500) {
                const angle = Math.atan2(dy, dx);
                const force = (1 - distance / hoverRadius) * magneticStrength;
                x.set(-Math.cos(angle) * force);
                y.set(-Math.sin(angle) * force);
            } else {
                x.set(0);
                y.set(0);
            }
        };

        const unsubscribeX = mouseX.on('change', updateLetterPosition);
        const unsubscribeY = mouseY.on('change', updateLetterPosition);
        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [containerRef, hoverRadius, magneticStrength, mouseX, mouseY, x, y]);

    return (
        <motion.span
            ref={letterRef}
            className={isHighlight ? 'hero__title-highlight' : 'hero__title-char'}
            style={{
                x: springX,
                y: springY,
                display: 'inline-block',
                userSelect: 'none',
                whiteSpace: 'pre',
                cursor: 'default',
                willChange: 'transform'
            }}
            whileHover={{ scale: 1.18, transition: { duration: 0.1 } }}
        >
            {char}
        </motion.span>
    );
};

const Header = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Mouse Follower Spring Physics for CreativeLab Glow Light
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);
    const blobX = useSpring(mouseX, { stiffness: 60, damping: 25 });
    const blobY = useSpring(mouseY, { stiffness: 60, damping: 25 });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleMouseMove = (event) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseX.set(event.clientX - rect.left);
            mouseY.set(event.clientY - rect.top);
        };

        const handleMouseLeave = () => {
            mouseX.set(-1000);
            mouseY.set(-1000);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [mouseX, mouseY]);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
        } else {
            navigate('/login');
        }
    };

    const titleLine1 = "Welcome to";
    const titleLine2 = "Our Website";

    return (
        <section id="home" ref={containerRef} className="hero" aria-label="Hero section">
            {/* Ambient Background Floating Bubbles */}
            <FloatingBubbles variant="header" />

            {/* CreativeLab Interactive Mouse Follower Glow Light */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: -225,
                    top: -225,
                    width: 450,
                    height: 450,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 100%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 1,
                    x: blobX,
                    y: blobY,
                    opacity: 0.75
                }}
            />

            {/* Decorative gradient background blobs */}
            <div className="hero__blob hero__blob--1" aria-hidden="true" />
            <div className="hero__blob hero__blob--2" aria-hidden="true" />

            <div className="hero__content">
                {/* Eyebrow badge */}
                {/* <motion.span 
                    className="hero__badge" 
                    aria-hidden="true"
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    ✦ MERN Stack Application
                </motion.span> */}

                {/* CreativeLab Magnetic Interactive Title */}
                <motion.h1 
                    className="hero__title"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div style={{ display: 'inline-block' }}>
                        {Array.from(titleLine1).map((char, idx) => (
                            <MagneticLetter
                                key={`l1-${idx}`}
                                char={char}
                                containerRef={containerRef}
                                mouseX={mouseX}
                                mouseY={mouseY}
                            />
                        ))}
                    </div>
                    <br />
                    <span style={{ display: 'inline-block' }}>
                        {Array.from(titleLine2).map((char, idx) => (
                            <MagneticLetter
                                key={`l2-${idx}`}
                                char={char}
                                containerRef={containerRef}
                                mouseX={mouseX}
                                mouseY={mouseY}
                                isHighlight={true}
                            />
                        ))}
                    </span>
                </motion.h1>

                <motion.p 
                    className="hero__subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    A simple, secure and modern web application built using the MERN Stack.
                    Featuring JWT authentication and role-based access control.
                </motion.p>

                <motion.div 
                    className="hero__actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <motion.button
                        type="button"
                        className="hero__cta"
                        onClick={handleGetStarted}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                        <span className="hero__cta-arrow" aria-hidden="true">→</span>
                    </motion.button>

                    <motion.a 
                        href="#about" 
                        className="hero__link"
                        whileHover={{ x: 3 }}
                    >
                        Learn More
                        <span aria-hidden="true">↓</span>
                    </motion.a>
                </motion.div>

                {/* Trust indicators */}
                <motion.div 
                    className="hero__trust" 
                    aria-label="Key features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <span className="hero__trust-item">
                        <span aria-hidden="true">🔒</span> Secure Auth
                    </span>
                    <span className="hero__trust-sep" aria-hidden="true">·</span>
                    <span className="hero__trust-item">
                        <span aria-hidden="true">🪙</span> JWT Tokens
                    </span>
                    <span className="hero__trust-sep" aria-hidden="true">·</span>
                    <span className="hero__trust-item">
                        <span aria-hidden="true">🛡️</span> RBAC
                    </span>
                </motion.div>
            </div>
        </section>
    );
};

export default Header;

// ============================================================
// ScrollZoomReveal.jsx — Framer 3D Scroll Video Zoom Component
// ============================================================
// Features:
//   - Tight scroll-driven 3D spring zoom (starts small ~20vw, expands to 92vw on scroll)
//   - Zero dead vertical whitespace gaps (compact 85vh section height)
//   - Plays src/assets/video.mp4 inline (autoplay, loop, muted, playsInline)
//   - Responsive left & right typography ("OUR" / "PASSION")
//   - Smooth Spring physics using Motion (useScroll, useTransform, useSpring)
// ============================================================

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import sampleVideo from '../assets/video.mp4';

const RESPONSIVE = {
    desktop: { leftFont: '44px', rightFont: '44px', textWidth: '200px', gap: '20px', startWidth: '20vw', startHeight: '14vh' },
    tablet:  { leftFont: '32px', rightFont: '34px', textWidth: '140px', gap: '16px', startWidth: '24vw', startHeight: '16vh' },
    mobile:  { leftFont: '18px', rightFont: '18px', textWidth: '80px',  gap: '10px', startWidth: '30vw', startHeight: '18vh' }
};

const ScrollZoomReveal = ({
    leftText = 'OUR',
    rightText = 'PASSION',
    videoSrc = sampleVideo,
    autoPlay = true,
    loop = true,
    muted = true
}) => {
    const sectionRef = useRef(null);
    const videoRef   = useRef(null);
    const [screen, setScreen] = useState('desktop');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) setScreen('mobile');
            else if (window.innerWidth <= 1024) setScreen('tablet');
            else setScreen('desktop');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const current = RESPONSIVE[screen];

    // Track scroll progress as section enters and moves through viewport
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 85%', 'end 85%']
    });

    const rawWidth    = useTransform(scrollYProgress, [0, 0.9], [current.startWidth, '92vw']);
    const rawHeight   = useTransform(scrollYProgress, [0, 0.9], [current.startHeight, '72vh']);
    const rawRadius   = useTransform(scrollYProgress, [0, 0.9], [36, 16]);

    const width        = useSpring(rawWidth,  { stiffness: 140, damping: 30 });
    const height       = useSpring(rawHeight, { stiffness: 140, damping: 30 });
    const borderRadius = useSpring(rawRadius, { stiffness: 140, damping: 30 });

    return (
        <section
            ref={sectionRef}
            className="scroll-zoom-section"
            style={{
                height: '100vh',
                position: 'relative',
                width: '100%',
                zIndex: 2,
                margin: '0'
            }}
        >
            <div
                style={{
                    position: 'sticky',
                    top: '110px',
                    height: 'calc(100vh - 140px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: current.gap,
                    padding: '0 20px',
                    overflow: 'hidden'
                }}
            >
                {/* Left Text */}
                <div
                    className="scroll-zoom__left-text"
                    style={{
                        whiteSpace: 'nowrap',
                        width: current.textWidth,
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: current.leftFont,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)'
                    }}
                >
                    {leftText}
                </div>

                {/* Animated Video Frame */}
                <motion.div
                    style={{
                        width,
                        height,
                        borderRadius,
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                >
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        autoPlay={autoPlay}
                        loop={loop}
                        muted={muted}
                        playsInline
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </motion.div>

                {/* Right Text */}
                <div
                    className="scroll-zoom__right-text"
                    style={{
                        whiteSpace: 'nowrap',
                        width: current.textWidth,
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: current.rightFont,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)'
                    }}
                >
                    {rightText}
                </div>
            </div>
        </section>
    );
};

export default ScrollZoomReveal;

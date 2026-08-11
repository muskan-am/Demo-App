import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import scatterCardImg from '../assets/scatter_card.png';

/**
 * ScrollFadeText Component
 *
 * Elegant floating scatter card showcase with generous vertical spacing & smooth scroll fade.
 * Responsive across Desktop, Tablet (iPad), and Mobile (iPhone).
 */

const SCATTER_CARDS_DATA = [
    {
        id: 1,
        title: 'Bcrypt Passwords',
        mobileTitle: 'Bcrypt',
        icon: '🔒',
        image: scatterCardImg,
        coords: {
            desktop: { start: { x: -340, y: -160, scale: 0.65, rotate: -6 }, end: { x: -520, y: -240, scale: 0.85, rotate: -14 } },
            tablet:  { start: { x: -210, y: -110, scale: 0.62, rotate: -5 }, end: { x: -290, y: -170, scale: 0.75, rotate: -10 } },
            mobile:  { start: { x: -100, y: -100, scale: 0.65, rotate: -4 }, end: { x: -130, y: -145, scale: 0.75, rotate: -8 } }
        }
    },
    {
        id: 2,
        title: 'JWT Auth Tokens',
        mobileTitle: 'JWT Auth',
        icon: '🪙',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: 340, y: -160, scale: 0.65, rotate: 6 }, end: { x: 520, y: -240, scale: 0.85, rotate: 14 } },
            tablet:  { start: { x: 210, y: -110, scale: 0.62, rotate: 5 }, end: { x: 290, y: -170, scale: 0.75, rotate: 10 } },
            mobile:  { start: { x: 100, y: -100, scale: 0.65, rotate: 4 }, end: { x: 130, y: -145, scale: 0.75, rotate: 8 } }
        }
    },
    {
        id: 3,
        title: 'RBAC Control',
        mobileTitle: 'RBAC',
        icon: '🛡️',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: -420, y: 0, scale: 0.65, rotate: -4 }, end: { x: -610, y: 0, scale: 0.85, rotate: -10 } },
            tablet:  { start: { x: -250, y: 0, scale: 0.62, rotate: -4 }, end: { x: -320, y: 0, scale: 0.75, rotate: -8 } },
            mobile:  { start: { x: -110, y: 0, scale: 0.65, rotate: -3 }, end: { x: -140, y: 0, scale: 0.75, rotate: -6 } }
        }
    },
    {
        id: 4,
        title: 'High Speed Vite',
        mobileTitle: 'Vite',
        icon: '⚡',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: 420, y: 0, scale: 0.65, rotate: 4 }, end: { x: 610, y: 0, scale: 0.85, rotate: 10 } },
            tablet:  { start: { x: 250, y: 0, scale: 0.62, rotate: 4 }, end: { x: 320, y: 0, scale: 0.75, rotate: 8 } },
            mobile:  { start: { x: 110, y: 0, scale: 0.65, rotate: 3 }, end: { x: 140, y: 0, scale: 0.75, rotate: 6 } }
        }
    },
    {
        id: 5,
        title: 'Glassmorphism UX',
        mobileTitle: 'Glass UX',
        icon: '🎨',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: -340, y: 160, scale: 0.65, rotate: -5 }, end: { x: -520, y: 240, scale: 0.85, rotate: -12 } },
            tablet:  { start: { x: -210, y: 110, scale: 0.62, rotate: -4 }, end: { x: -290, y: 170, scale: 0.75, rotate: -8 } },
            mobile:  { start: { x: -100, y: 100, scale: 0.65, rotate: -4 }, end: { x: -130, y: 145, scale: 0.75, rotate: -8 } }
        }
    },
    {
        id: 6,
        title: 'RESTful API',
        mobileTitle: 'REST API',
        icon: '🌐',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: 340, y: 160, scale: 0.65, rotate: 5 }, end: { x: 520, y: 240, scale: 0.85, rotate: 12 } },
            tablet:  { start: { x: 210, y: 110, scale: 0.62, rotate: 4 }, end: { x: 290, y: 170, scale: 0.75, rotate: 8 } },
            mobile:  { start: { x: 100, y: 100, scale: 0.65, rotate: 4 }, end: { x: 130, y: 145, scale: 0.75, rotate: 8 } }
        }
    },
    {
        id: 7,
        title: 'Admin Control',
        mobileTitle: 'Admin',
        icon: '⚙️',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: 0, y: -210, scale: 0.65, rotate: -2 }, end: { x: 0, y: -290, scale: 0.85, rotate: -6 } },
            tablet:  { start: { x: 0, y: -130, scale: 0.62, rotate: -2 }, end: { x: 0, y: -190, scale: 0.75, rotate: -4 } },
            mobile:  { start: { x: 0, y: -115, scale: 0.65, rotate: 0 }, end: { x: 0, y: -155, scale: 0.75, rotate: 0 } }
        }
    },
    {
        id: 8,
        title: 'Framer Motion',
        mobileTitle: 'Motion',
        icon: '✨',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        coords: {
            desktop: { start: { x: 0, y: 210, scale: 0.65, rotate: 2 }, end: { x: 0, y: 290, scale: 0.85, rotate: 6 } },
            tablet:  { start: { x: 0, y: 130, scale: 0.62, rotate: 2 }, end: { x: 0, y: 190, scale: 0.75, rotate: 4 } },
            mobile:  { start: { x: 0, y: 115, scale: 0.65, rotate: 0 }, end: { x: 0, y: 155, scale: 0.75, rotate: 0 } }
        }
    }
];

const ScrollFadeText = () => {
    const containerRef = useRef(null);
    const [device, setDevice] = useState('desktop');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width <= 640) setDevice('mobile');
            else if (width <= 1024) setDevice('tablet');
            else setDevice('desktop');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track scroll position naturally through section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 80%', 'end 20%']
    });

    // Device-tailored card dimensions
    const cardDims = {
        desktop: { width: '180px', height: '115px', font: '0.72rem', pad: '5px 8px' },
        tablet:  { width: '120px', height: '76px',  font: '0.62rem', pad: '4px 6px' },
        mobile:  { width: '96px',  height: '60px',  font: '0.55rem', pad: '3px 5px' }
    }[device];

    // Smooth title entrance & exit opacity and scale
    const rawTitleOpacity = useTransform(scrollYProgress, [0.05, 0.25, 0.78, 0.95], [0.3, 1, 1, 0]);
    const rawTitleScale   = useTransform(scrollYProgress, [0.05, 0.35, 0.95], [0.94, 1, 0.96]);
    const titleOpacity = useSpring(rawTitleOpacity, { stiffness: 120, damping: 25 });
    const titleScale   = useSpring(rawTitleScale,   { stiffness: 120, damping: 25 });

    // Dynamic responsive title font size
    const titleFontSize = {
        desktop: 'clamp(2.2rem, 4.5vw, 3.4rem)',
        tablet:  'clamp(1.5rem, 3.4vw, 2.2rem)',
        mobile:  'clamp(1.3rem, 5vw, 1.8rem)'
    }[device];

    const titleMaxWidth = {
        desktop: '720px',
        tablet:  '380px',
        mobile:  '300px'
    }[device];

    // Balanced Section Height per device (Generous Vertical Spacing & Fade Room!)
    const sectionHeight = {
        desktop: '750px',
        tablet:  '620px',
        mobile:  '520px'
    }[device];

    const sectionPadding = {
        desktop: '90px 0 110px',
        tablet:  '70px 0 90px',
        mobile:  '55px 0 70px'
    }[device];

    return (
        <section
            ref={containerRef}
            className="scroll-scatter-section"
            style={{
                position: 'relative',
                width: '100%',
                height: sectionHeight,
                minHeight: sectionHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 2,
                padding: sectionPadding,
                margin: '0'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1280px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Center Headline (On mobile: ONLY EXCELLENCE & PERFORMANCE is rendered) */}
                <motion.div
                    style={{
                        textAlign: 'center',
                        zIndex: 10,
                        padding: '0 16px',
                        maxWidth: titleMaxWidth,
                        opacity: titleOpacity,
                        scale: titleScale,
                        willChange: 'transform, opacity'
                    }}
                >
                    <span
                        className="section-eyebrow"
                        style={{
                            letterSpacing: '2px',
                            fontWeight: 800,
                            fontSize: device === 'mobile' ? '0.95rem' : device === 'tablet' ? '0.85rem' : undefined
                        }}
                    >
                        EXCELLENCE & PERFORMANCE
                    </span>
                    {device !== 'mobile' && (
                        <>
                            <h2
                                className="section-title"
                                style={{
                                    fontSize: titleFontSize,
                                    margin: '8px 0',
                                    lineHeight: 1.15
                                }}
                            >
                                Engineered for Perfection
                            </h2>
                            <p
                                className="section-subtitle"
                                style={{
                                    maxWidth: '480px',
                                    margin: '0 auto',
                                    fontSize: device === 'tablet' ? '0.88rem' : '1rem'
                                }}
                            >
                                Scroll down to explore how our application architecture scales seamlessly.
                            </p>
                        </>
                    )}
                </motion.div>

                {/* Responsive Scattering Image Cards with Smooth Scroll Fade */}
                {SCATTER_CARDS_DATA.map((card) => {
                    const c = card.coords[device];
                    const x       = useTransform(scrollYProgress, [0.05, 0.75], [c.start.x, c.end.x]);
                    const y       = useTransform(scrollYProgress, [0.05, 0.75], [c.start.y, c.end.y]);
                    const scale   = useTransform(scrollYProgress, [0.05, 0.75], [c.start.scale, c.end.scale]);
                    const rotate  = useTransform(scrollYProgress, [0.05, 0.75], [c.start.rotate, c.end.rotate]);
                    const opacity = useTransform(scrollYProgress, [0.05, 0.25, 0.78, 0.95], [0.2, 1, 1, 0]);

                    return (
                        <motion.div
                            key={card.id}
                            className="scatter-image-card"
                            style={{
                                position: 'absolute',
                                x,
                                y,
                                scale,
                                rotate,
                                opacity,
                                width: cardDims.width,
                                height: cardDims.height,
                                borderRadius: device === 'mobile' ? '10px' : '14px',
                                overflow: 'hidden',
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
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
                                    bottom: '4px',
                                    left: '4px',
                                    right: '4px',
                                    padding: cardDims.pad,
                                    borderRadius: '7px',
                                    background: 'rgba(15, 12, 41, 0.85)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: device === 'mobile' ? '0.65rem' : '0.78rem' }}>{card.icon}</span>
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: cardDims.font,
                                        color: '#ffffff',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {device === 'desktop' ? card.title : card.mobileTitle}
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

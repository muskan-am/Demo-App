import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

/**
 * ExpandedCard (ServiceCarousel3D) Component
 * Inspired by Framer Service_section (https://framer.com/m/Service-section-a2j24v.js@aAfooHiaMhCLAPzZAS79)
 *
 * 3D rotating octagonal cylinder carousel presenting key project technical highlights.
 * Includes spring physics rotation, responsive mobile stack, and theme-adaptive text contrast.
 */

const PROJECT_CARDS = [
    {
        id: 'secure-auth',
        title: 'Secure JWT Authentication',
        description: 'Bcrypt hashed passwords, HttpOnly cookies & automated token refresh mechanism.',
        tag: 'Security',
        ctaText: 'Explore Auth →',
        ctaUrl: '/login',
        accentColor: '#6366f1',
        icon: '🔒'
    },
    {
        id: 'rbac',
        title: 'Role-Based Access Control',
        description: 'Granular permissions separating Admin management & User dashboards.',
        tag: 'RBAC',
        ctaText: 'View Roles →',
        ctaUrl: '/#about',
        accentColor: '#8b5cf6',
        icon: '🛡️'
    },
    {
        id: 'mern-stack',
        title: 'MERN Full Stack',
        description: 'High-performance Node.js, Express REST API, MongoDB & React architecture.',
        tag: 'Architecture',
        ctaText: 'Learn Stack →',
        ctaUrl: '/#about',
        accentColor: '#3b82f6',
        icon: '⚡'
    },
    {
        id: 'webgl-shaders',
        title: 'WebGL & Shader FX',
        description: 'Real-time GLSL liquid canvas background and Three.js aura physics.',
        tag: '3D FX',
        ctaText: 'View Shaders →',
        ctaUrl: '/#home',
        accentColor: '#ec4899',
        icon: '🔮'
    },
    {
        id: 'framer-motion',
        title: 'Framer Motion & Micro FX',
        description: 'Fluid 60fps page transitions, cursor trails & 3D tilt perspective.',
        tag: 'Animation',
        ctaText: 'See Motion →',
        ctaUrl: '/#about',
        accentColor: '#f59e0b',
        icon: '✨'
    },
    {
        id: 'dual-theme',
        title: 'Adaptive Dual Theme',
        description: 'Seamless Dark Mode & Light Mode switching with dynamic CSS tokens.',
        tag: 'UI System',
        ctaText: 'Toggle Theme →',
        ctaUrl: '/#about',
        accentColor: '#10b981',
        icon: '🌗'
    },
    {
        id: 'axios-services',
        title: 'Axios API Services',
        description: 'Decoupled service-layer API calls with automatic interceptors & error handling.',
        tag: 'Backend API',
        ctaText: 'API Layer →',
        ctaUrl: '/#about',
        accentColor: '#14b8a6',
        icon: '🔌'
    },
    {
        id: 'interactive-3d',
        title: 'Interactive 3D Location',
        description: 'Interactive location node with mouse-parallax 3D tilt perspective.',
        tag: 'Interactive',
        ctaText: 'Get in Touch →',
        ctaUrl: '/#contact',
        accentColor: '#f43f5e',
        icon: '🌐'
    }
];

// Single Card Component for Desktop 3D Cylinder
const ServiceCard = ({ card }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="service-3d-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                style: hovered ? { borderColor: card.accentColor } : {}
            }}
        >
            {/* Top Icon Badge & Accent Banner */}
            <div className="service-3d-card__banner">
                <div
                    className="service-3d-card__icon-wrapper"
                    style={{
                        background: `${card.accentColor}25`,
                        border: `1px solid ${card.accentColor}40`,
                        color: card.accentColor
                    }}
                >
                    <span className="service-3d-card__icon">{card.icon}</span>
                </div>

                {card.tag && (
                    <span
                        className="service-3d-card__tag"
                        style={{ background: card.accentColor }}
                    >
                        {card.tag}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="service-3d-card__body">
                <h3 className="service-3d-card__title">{card.title}</h3>
                <p className="service-3d-card__desc">{card.description}</p>
                <a
                    href={card.ctaUrl}
                    className="service-3d-card__cta"
                    style={{ color: card.accentColor }}
                >
                    {card.ctaText}
                </a>
            </div>
        </div>
    );
};

// Mobile Card Component
const MobileCard = ({ card }) => {
    return (
        <div className="service-3d-mobile-card">
            <div className="service-3d-card__banner">
                <div
                    className="service-3d-card__icon-wrapper"
                    style={{
                        background: `${card.accentColor}25`,
                        border: `1px solid ${card.accentColor}40`,
                        color: card.accentColor
                    }}
                >
                    <span>{card.icon}</span>
                </div>
                {card.tag && (
                    <span className="service-3d-card__tag" style={{ background: card.accentColor }}>
                        {card.tag}
                    </span>
                )}
            </div>
            <div className="service-3d-card__body">
                <h3 className="service-3d-card__title">{card.title}</h3>
                <p className="service-3d-card__desc">{card.description}</p>
                <a href={card.ctaUrl} className="service-3d-card__cta" style={{ color: card.accentColor }}>
                    {card.ctaText}
                </a>
            </div>
        </div>
    );
};

// Nav Arrow Button
const NavArrow = ({ direction, onClick }) => {
    return (
        <button
            type="button"
            className={`service-3d-arrow service-3d-arrow--${direction}`}
            onClick={onClick}
            aria-label={direction === 'left' ? 'Previous Card' : 'Next Card'}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
            </svg>
        </button>
    );
};

const ExpandedCard = ({ cards = PROJECT_CARDS, cardDepth = 400, autoPlaySpeed = 4000 }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [cumulativeRotation, setCumulativeRotation] = useState(0);

    const totalCards = Math.min(cards.length, 8);
    const anglePerCard = 360 / totalCards;

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Auto-play interval
    useEffect(() => {
        if (isPaused || autoPlaySpeed <= 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % totalCards;
                setCumulativeRotation((r) => r - anglePerCard);
                return next;
            });
        }, autoPlaySpeed);
        return () => clearInterval(timer);
    }, [isPaused, autoPlaySpeed, totalCards, anglePerCard]);

    const goTo = (targetIndex) => {
        setActiveIndex((prev) => {
            let diff = targetIndex - prev;
            if (diff > totalCards / 2) diff -= totalCards;
            if (diff < -totalCards / 2) diff += totalCards;
            setCumulativeRotation((r) => r - diff * anglePerCard);
            return targetIndex;
        });
    };

    const goPrev = () => {
        setActiveIndex((prev) => {
            setCumulativeRotation((r) => r + anglePerCard);
            return (prev - 1 + totalCards) % totalCards;
        });
    };

    const goNext = () => {
        setActiveIndex((prev) => {
            setCumulativeRotation((r) => r - anglePerCard);
            return (prev + 1) % totalCards;
        });
    };

    const faceAngles = Array.from({ length: totalCards }, (_, i) => i * anglePerCard);

    return (
        <div
            className="service-3d-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {isMobile ? (
                /* Mobile Stack View */
                <div className="service-3d-mobile-grid">
                    {cards.slice(0, totalCards).map((card) => (
                        <MobileCard key={card.id} card={card} />
                    ))}
                </div>
            ) : (
                /* Desktop 3D Cylinder Carousel View */
                <div className="service-3d-container">
                    <div className="service-3d-viewport">
                        <motion.div
                            className="service-3d-cylinder"
                            animate={{ rotateY: cumulativeRotation }}
                            transition={{ type: 'spring', stiffness: 45, damping: 16, mass: 1.2 }}
                        >
                            {cards.slice(0, totalCards).map((card, i) => (
                                <div
                                    key={card.id}
                                    className="service-3d-face"
                                    style={{
                                        transform: `rotateY(${faceAngles[i]}deg) translateZ(${cardDepth}px)`
                                    }}
                                >
                                    <ServiceCard card={card} />
                                </div>
                            ))}
                        </motion.div>

                        <NavArrow direction="left" onClick={goPrev} />
                        <NavArrow direction="right" onClick={goNext} />
                    </div>

                    {/* Pagination Dots */}
                    <div className="service-3d-dots">
                        {Array.from({ length: totalCards }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                className={`service-3d-dot${i === activeIndex ? ' service-3d-dot--active' : ''}`}
                                style={{
                                    background: i === activeIndex ? (cards[i]?.accentColor || '#6366f1') : undefined
                                }}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpandedCard;

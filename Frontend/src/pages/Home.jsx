// ============================================================
// Home.jsx — Landing Page
// ============================================================
// Composed of: Navbar, Header (Hero), ScrollFadeText, ScrollZoomReveal Video, Main Body (About, StatsCounter, Contact with Starsfield), CursorAnimations, Footer.
// ============================================================

import Navbar           from '../components/Navbar';
import Header           from '../components/Header';
import Footer           from '../components/Footer';
import ExpandedCard     from '../components/ExpandedCard';
import StatsCounter     from '../components/StatsCounter';
import Starsfield       from '../components/Starsfield';
import CursorAnimations from '../components/CursorAnimations';
import ScrollZoomReveal from '../components/ScrollZoomReveal';
import ScrollFadeText   from '../components/ScrollFadeText';
import { motion }       from 'motion/react';

// ---- Expanded Feature card data ----
const FEATURES = [
    {
        id: 'secure-auth',
        icon: '🔒',
        badge: 'Security First',
        title: 'Secure Authentication',
        shortDesc: 'Hashed passwords with bcrypt & end-to-end safety.',
        desc: 'Passwords are cryptographically hashed using bcrypt with salt rounds before storage. Credentials never travel in plain text, keeping your account safe at every step.',
        highlights: [
            'Bcrypt salt rounds password hashing',
            'Protection against credentials exposure',
            'Encrypted transit over secure connections'
        ],
        footerTag: '🔒 End-to-End Encrypted'
    },
    {
        id: 'jwt-auth',
        icon: '🪙',
        badge: 'Stateless Sessions',
        title: 'JWT Authentication',
        shortDesc: 'Stateless JSON Web Tokens powering secure sessions.',
        desc: 'Stateless JSON Web Tokens power every session. Each token is signed and verified server-side, providing tamper-proof identity without server session storage.',
        highlights: [
            'Signed bearer tokens for verification',
            'Automatic expiration & token security',
            'Zero server session storage overhead'
        ],
        footerTag: '⚡ High Performance'
    },
    {
        id: 'rbac',
        icon: '🛡️',
        badge: 'Access Control',
        title: 'Role Based Control',
        shortDesc: 'Granular admin vs user privileges & route guarding.',
        desc: 'Granular RBAC ensures users only see what they\'re allowed to. Admins get elevated privileges; regular users stay in their dedicated dashboard.',
        highlights: [
            'Admin and standard User role separation',
            'Client-side & backend route protection',
            'Scalable role permission architecture'
        ],
        footerTag: '🛡️ Enterprise Ready'
    },
    {
        id: 'responsive-ui',
        icon: '📱',
        badge: 'Modern UX',
        title: 'Modern Responsive UI',
        shortDesc: 'Glassmorphism interface optimized for all screens.',
        desc: 'Built with a mobile-first mindset. Glassmorphism design with smooth Framer Motion animations looks stunning on phones, tablets, and desktops alike.',
        highlights: [
            'Glassmorphic dark purple backdrop-filter style',
            'Fluid GPU layout animations using Motion',
            'Adaptive responsive layout across devices'
        ],
        footerTag: '✨ Premium Motion'
    }
];

// ---- Contact info ----
const CONTACT = [
    { icon: '✉',  label: 'Email',    value: 'support@example.com',   href: 'mailto:support@example.com'  },
    { icon: '📞', label: 'Phone',    value: '+91 9876543210',         href: 'tel:+919876543210'           },
    { icon: '📍', label: 'Location', value: 'Noida, India',          href: null                          }
];

const Home = () => {
    return (
        <div className="home-page">
            {/* Framer Interactive Custom Cursor Animation Trail */}
            <CursorAnimations 
                trailStyle="comet"
                trailColor="#818cf8"
                particleSize={6}
                trailIntensity={6}
                fadeSpeed={0.45}
            />

            <Navbar />

            {/* Hero Section */}
            <Header />

            {/* ============================================================
                MAIN BODY WRAPPER WITH FRAMER STARSFIELD CANVAS ANIMATION
            ============================================================ */}
            <div className="main-body-container" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                {/* Framer Starsfield Background Particle System */}
                <Starsfield 
                    starCount={240}
                    speed={0.08}
                    spread={2.2}
                    focal={0.75}
                    twinkle={0.5}
                    starSize={2.4}
                    followCursor={true}
                />

                {/* ============================================================
                    FRAMER SCROLL FADE SCATTER TEXT (DIRECTLY BELOW HEADER)
                ============================================================ */}
                <ScrollFadeText />

                {/* ============================================================
                    FRAMER SCROLL ZOOM REVEAL (VIDEO FROM ASSETS)
                ============================================================ */}
                <ScrollZoomReveal 
                    leftText="OUR"
                    rightText="PASSION"
                />

                {/* ============================================================
                    ABOUT SECTION (WITH EXPANDED CARD INTERACTION)
                ============================================================ */}
                <section id="about" className="about-section" aria-labelledby="about-title" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="section-container">

                        <motion.div 
                            className="section-header"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-eyebrow">About the Project</span>
                            <h2 id="about-title" className="section-title">
                                What We&apos;ve Built
                            </h2>
                            <p className="section-subtitle">
                                Hover over or click any feature card to expand and discover key technical highlights.
                            </p>
                        </motion.div>

                        <ExpandedCard features={FEATURES} />

                    </div>
                </section>

                {/* ============================================================
                    STATS COUNTER PRO SECTION (FRAMER COMPONENT)
                ============================================================ */}
                <StatsCounter />

                {/* ============================================================
                    CONTACT SECTION
                ============================================================ */}
                <section id="contact" className="contact-section" aria-labelledby="contact-title" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="section-container">

                        <motion.div 
                            className="section-header"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-eyebrow">Get In Touch</span>
                            <h2 id="contact-title" className="section-title">Contact Us</h2>
                            <p className="section-subtitle">
                                Have a question or just want to say hi? Reach out — we&apos;d love to hear from you.
                            </p>
                        </motion.div>

                        <div className="contact-grid">
                            {CONTACT.map((c, index) => (
                                <motion.div 
                                    key={c.label} 
                                    className="contact-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.12 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                >
                                    <div className="contact-card__icon" aria-hidden="true">{c.icon}</div>
                                    <div className="contact-card__body">
                                        <span className="contact-card__label">{c.label}</span>
                                        {c.href ? (
                                            <a href={c.href} className="contact-card__value">
                                                {c.value}
                                            </a>
                                        ) : (
                                            <span className="contact-card__value">{c.value}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Home;

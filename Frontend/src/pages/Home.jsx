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
import ThreeDContactSection from '../components/ThreeDContactSection';
import { motion }       from 'motion/react';

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
                                Explore our 8-card 3D rotating technical carousel. Use arrows or dots to navigate features.
                            </p>
                        </motion.div>

                        <ExpandedCard />

                    </div>
                </section>

                {/* ============================================================
                    STATS COUNTER PRO SECTION (FRAMER COMPONENT)
                ============================================================ */}
                <StatsCounter />

                {/* ============================================================
                    3D LUXURY CONTACT SECTION (Let's Start a Conversation)
                ============================================================ */}
                <ThreeDContactSection />
            </div>

            <Footer />
        </div>
    );
};

export default Home;

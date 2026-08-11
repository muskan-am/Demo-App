import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';

const ThreeDContactSection = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // 3D Motion Tilt Values for the Right Form Card
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ fullName: '', email: '', phone: '', message: '' });
            setTimeout(() => setSubmitted(false), 4000);
        }, 1200);
    };

    return (
        <section id="contact" className="threed-contact-section" aria-labelledby="threed-contact-title">
            <div className="threed-contact-container">
                
                {/* Header Section */}
                <motion.div
                    className="threed-contact-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="threed-eyebrow">GET IN TOUCH</span>
                    <h2 id="threed-contact-title" className="threed-title">
                        Let&apos;s Start a <span className="threed-title-serif">Conversation</span>
                    </h2>
                </motion.div>

                {/* Main 2-Column Grid */}
                <div className="threed-contact-grid">

                    {/* LEFT COLUMN: Info & Map Card */}
                    <motion.div
                        className="threed-info-column"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Info List */}
                        <div className="threed-info-list">
                            
                            {/* Item 1: Office */}
                            <div className="threed-info-item">
                                <div className="threed-icon-badge threed-icon-badge--pin">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <div className="threed-info-content">
                                    <span className="threed-info-label">Our Office</span>
                                    <h4 className="threed-info-value">New Delhi, India — 110001</h4>
                                    <p className="threed-info-subtext">Also serving Mumbai, London, Dubai</p>
                                </div>
                            </div>

                            {/* Item 2: Email */}
                            <div className="threed-info-item">
                                <div className="threed-icon-badge threed-icon-badge--mail">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                </div>
                                <div className="threed-info-content">
                                    <span className="threed-info-label">Email Address</span>
                                    <a href="mailto:info@Casaglamoracorp.com" className="threed-info-value threed-link">
                                        info@Casaglamoracorp.com
                                    </a>
                                </div>
                            </div>

                            {/* Item 3: Phone */}
                            <div className="threed-info-item">
                                <div className="threed-icon-badge threed-icon-badge--phone">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                </div>
                                <div className="threed-info-content">
                                    <span className="threed-info-label">Phone Number</span>
                                    <a href="tel:+919582786995" className="threed-info-value threed-link">
                                        +91 9582786995
                                    </a>
                                </div>
                            </div>

                            {/* Item 4: Business Hours */}
                            <div className="threed-info-item">
                                <div className="threed-icon-badge threed-icon-badge--clock">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div className="threed-info-content">
                                    <span className="threed-info-label">Business Hours</span>
                                    <h4 className="threed-info-value">Mon – Sat: 10:00 – 18:00</h4>
                                </div>
                            </div>

                        </div>

                        {/* Interactive 3D World Map Card */}
                        <motion.div
                            className="threed-map-card"
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="threed-map-graphic">
                                <svg width="90" height="45" viewBox="0 0 200 100" fill="currentColor">
                                    {/* Stylized 3D Metallic World Map Silhouette */}
                                    <path d="M30 20 Q 40 10, 60 25 T 90 20 T 110 35 T 140 20 T 170 30 T 190 25 T 180 55 T 150 70 T 120 60 T 90 75 T 50 65 T 20 40 Z" opacity="0.25"/>
                                    <circle cx="130" cy="40" r="5" fill="#818cf8" className="threed-beacon-pulse" />
                                    <circle cx="130" cy="40" r="1.5" fill="#ffffff" />
                                    <path d="M 130 45 L 130 55 M 125 50 L 135 50" stroke="#818cf8" strokeWidth="1" opacity="0.6"/>
                                </svg>
                            </div>
                            <span className="threed-map-title">New Delhi, India</span>
                            <span className="threed-map-subtext">Interactive Location Node</span>
                        </motion.div>

                    </motion.div>

                    {/* RIGHT COLUMN: 3D Form Card with Mouse Tilt */}
                    <motion.div
                        className="threed-form-wrapper"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            ref={cardRef}
                            className="threed-form-card"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <form onSubmit={handleSubmit} className="threed-form">
                                
                                {/* Full Name Field */}
                                <div className="threed-form-group">
                                    <label htmlFor="fullName" className="threed-form-label">
                                        FULL NAME *
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        required
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="threed-input"
                                    />
                                </div>

                                {/* Email Address Field */}
                                <div className="threed-form-group">
                                    <label htmlFor="email" className="threed-form-label">
                                        EMAIL ADDRESS *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        placeholder="john@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="threed-input"
                                    />
                                </div>

                                {/* Phone Number Field */}
                                <div className="threed-form-group">
                                    <label htmlFor="phone" className="threed-form-label">
                                        PHONE NUMBER
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="threed-input"
                                    />
                                </div>

                                {/* Message Field */}
                                <div className="threed-form-group">
                                    <label htmlFor="message" className="threed-form-label">
                                        MESSAGE *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        placeholder="Tell us about your branding goals..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="threed-textarea"
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="threed-submit-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSubmitting ? (
                                        <span className="threed-btn-loading">Sending…</span>
                                    ) : submitted ? (
                                        <span className="threed-btn-success">Message Sent! ✓</span>
                                    ) : (
                                        <span>Send Message →</span>
                                    )}
                                </motion.button>

                            </form>
                        </motion.div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
};

export default ThreeDContactSection;

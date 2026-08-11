import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * SocialLinksButton Component
 * Inspired by Framer Social Links Button (https://framer.com/m/Social-Links-Button-bJAemC.js@7b7hjgo7lXcsSR4KVyCb)
 *
 * Interactive dropdown button that expands a floating menu of social links & contact channels
 */

const SOCIAL_ITEMS = [
    {
        id: 'email',
        name: 'Email us',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
        ),
        href: 'mailto:info@Casaglamoracorp.com',
        color: '#6366f1'
    },
    {
        id: 'phone',
        name: 'Call us',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
        ),
        href: 'tel:+919582786995',
        color: '#10b981'
    },
    {
        id: 'form',
        name: 'Contact Form',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        ),
        href: '#contact',
        isScroll: true,
        color: '#f59e0b'
    },
    {
        id: 'x',
        name: 'X / Twitter',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        ),
        href: 'https://twitter.com',
        target: '_blank',
        color: '#38bdf8'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
        ),
        href: 'https://instagram.com',
        target: '_blank',
        color: '#ec4899'
    }
];

const SocialLinksButton = ({ buttonText = 'Social Links', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (e, item) => {
        setIsOpen(false);
        if (item.isScroll) {
            e.preventDefault();
            const element = document.getElementById('contact');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    const input = document.getElementById('fullName');
                    if (input) input.focus();
                }, 500);
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={`social-links-dropdown ${className}`}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            {/* Main Trigger Pill */}
            <motion.button
                type="button"
                className="social-links-pill"
                onClick={() => setIsOpen((prev) => !prev)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="social-links-pill__text">{buttonText}</span>
                <motion.span
                    className="social-links-pill__chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    aria-hidden="true"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </motion.span>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="social-links-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <div className="social-links-menu__inner">
                            {SOCIAL_ITEMS.map((item, idx) => (
                                <motion.a
                                    key={item.id}
                                    href={item.href}
                                    target={item.target || '_self'}
                                    rel="noopener noreferrer"
                                    className="social-links-item"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                                    whileHover={{ x: 3 }}
                                    onClick={(e) => handleItemClick(e, item)}
                                >
                                    <span className="social-links-item__icon" style={{ color: item.color }}>
                                        {item.icon}
                                    </span>
                                    <span className="social-links-item__name">{item.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialLinksButton;

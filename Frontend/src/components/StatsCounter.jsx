import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';

const STATS_DATA = [
    {
        value: 100,
        prefix: '',
        suffix: '%',
        label: 'End-to-End Security',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        trend: '+100%'
    },
    {
        value: 10,
        prefix: '',
        suffix: 'K+',
        label: 'Active Users',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        trend: '+24%'
    },
    {
        value: 99.9,
        prefix: '',
        suffix: '%',
        label: 'Uptime & Speed',
        decimals: 1,
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        trend: '+99.9%'
    },
    {
        value: 24,
        prefix: '',
        suffix: '/7',
        label: 'RBAC Access Guard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        trend: 'Live'
    }
];

function StatCard({ stat, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 2000;
        const startTime = performance.now();

        const animateCount = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = stat.value * eased;
            setCount(val);

            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                setCount(stat.value);
            }
        };

        requestAnimationFrame(animateCount);
    }, [isInView, stat.value]);

    const formatted = stat.decimals
        ? count.toFixed(stat.decimals)
        : Math.floor(count).toLocaleString();

    return (
        <motion.div
            ref={ref}
            className="stats-card"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
        >
            <div className="stats-card__icon">
                {stat.icon}
            </div>

            <div className="stats-card__number-wrap">
                {stat.prefix && <span className="stats-card__affix">{stat.prefix}</span>}
                <span className="stats-card__number">{formatted}</span>
                {stat.suffix && <span className="stats-card__affix">{stat.suffix}</span>}
            </div>

            <span className="stats-card__label">{stat.label}</span>

            {stat.trend && (
                <div className="stats-card__trend">
                    <span className="stats-card__trend-arrow">▲</span>
                    <span>{stat.trend}</span>
                </div>
            )}
        </motion.div>
    );
}

const StatsCounter = () => {
    return (
        <section className="stats-section" aria-label="System Metrics" style={{ position: 'relative', zIndex: 2 }}>
            <div className="section-container">
                <div className="stats-grid">
                    {STATS_DATA.map((stat, idx) => (
                        <StatCard key={stat.label} stat={stat} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;

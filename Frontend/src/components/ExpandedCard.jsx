import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const ExpandedCard = ({ features }) => {
    // Default to the first feature as expanded, or null
    const [activeId, setActiveId] = useState(features[0]?.id || null);

    const handleToggle = (id) => {
        setActiveId(prev => (prev === id ? id : id));
    };

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle(id);
        }
    };

    return (
        <div className="expanded-cards-wrapper" role="region" aria-label="Feature cards display">
            <motion.div className="expanded-cards-container" layout>
                {features.map((feature) => {
                    const isExpanded = activeId === feature.id;

                    return (
                        <motion.article
                            key={feature.id}
                            layout
                            className={`expanded-card ${isExpanded ? 'expanded-card--active' : 'expanded-card--compact'}`}
                            onClick={() => handleToggle(feature.id)}
                            onMouseEnter={() => setActiveId(feature.id)}
                            onFocus={() => setActiveId(feature.id)}
                            onKeyDown={(e) => handleKeyDown(e, feature.id)}
                            tabIndex={0}
                            role="button"
                            aria-expanded={isExpanded}
                            aria-controls={`expanded-content-${feature.id}`}
                            aria-label={`${feature.title} - ${isExpanded ? 'Expanded' : 'Hover or click to expand'}`}
                            transition={{
                                layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                            }}
                        >
                            {/* Accent indicator bar */}
                            <motion.div 
                                className="expanded-card__accent" 
                                layout
                                style={{ opacity: isExpanded ? 1 : 0.3 }} 
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            />

                            {/* Top Bar: Chevron on top right */}
                            <div className="expanded-card__top-bar">
                                {isExpanded ? (
                                    <div className="expanded-card__icon-wrapper">
                                        <span className="expanded-card__icon" aria-hidden="true">
                                            {feature.icon}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="expanded-card__top-spacer" />
                                )}

                                <span className="expanded-card__chevron" aria-hidden="true">
                                    {isExpanded ? '−' : '+'}
                                </span>
                            </div>

                            {/* Center Hero Icon for Compact Cards */}
                            {!isExpanded && (
                                <div className="expanded-card__center-icon">
                                    <span className="expanded-card__icon" aria-hidden="true">
                                        {feature.icon}
                                    </span>
                                </div>
                            )}

                            {/* Header Info: Badge & Title */}
                            <div className="expanded-card__header-info">
                                {feature.badge && (
                                    <span className="expanded-card__badge">
                                        {feature.badge}
                                    </span>
                                )}
                                <h3 className="expanded-card__title">
                                    {feature.title}
                                </h3>
                            </div>

                            {/* Content Body Section */}
                            <div className="expanded-card__body">
                                <AnimatePresence mode="wait">
                                    {!isExpanded ? (
                                        <motion.p 
                                            key="compact"
                                            className="expanded-card__short-desc"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        >
                                            {feature.shortDesc || feature.desc}
                                        </motion.p>
                                    ) : (
                                        <motion.div
                                            key="expanded"
                                            id={`expanded-content-${feature.id}`}
                                            className="expanded-card__details"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                                        >
                                            <p className="expanded-card__full-desc">
                                                {feature.desc}
                                            </p>

                                            {feature.highlights && feature.highlights.length > 0 && (
                                                <ul className="expanded-card__highlights-list" role="list">
                                                    {feature.highlights.map((item, idx) => (
                                                        <li key={idx} className="expanded-card__highlight-item">
                                                            <span className="expanded-card__check-icon" aria-hidden="true">✓</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {feature.footerTag && (
                                                <div className="expanded-card__footer">
                                                    <span className="expanded-card__footer-tag">
                                                        {feature.footerTag}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.article>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default ExpandedCard;

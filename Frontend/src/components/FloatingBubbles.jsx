import { motion, useReducedMotion } from 'motion/react';
const HEADER_BUBBLES = [
    { id: 'h1',  size: 24, top: '8%',   left: '6%',   background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.7))',  shadow: 'rgba(99, 102, 241, 0.45)',  x: [0, 18, -12, 0],  y: [0, -35, 18, 0],  scale: [1, 1.25, 0.9, 1], opacity: [0.7, 0.95, 0.7, 0.7], duration: 5.5 },
    { id: 'h2',  size: 38, top: '16%',  left: '84%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(168, 85, 247, 0.7))', shadow: 'rgba(168, 85, 247, 0.45)', x: [0, -22, 16, 0], y: [0, -45, 22, 0],  scale: [1, 0.85, 1.15, 1], opacity: [0.65, 0.9, 0.65, 0.65], duration: 7.5 },
    { id: 'h3',  size: 18, top: '35%',  left: '12%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(59, 130, 246, 0.7))',  shadow: 'rgba(59, 130, 246, 0.45)',  x: [0, 20, -15, 0],  y: [0, -28, 15, 0],  scale: [1, 1.3, 0.8, 1],  opacity: [0.75, 1, 0.75, 0.75], duration: 4.5 },
    { id: 'h4',  size: 32, top: '55%',  left: '88%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(236, 72, 153, 0.7))', shadow: 'rgba(236, 72, 153, 0.45)', x: [0, -18, 18, 0], y: [0, -38, 18, 0],  scale: [1, 1.1, 0.9, 1],  opacity: [0.7, 0.95, 0.7, 0.7], duration: 6 },
    { id: 'h5',  size: 16, top: '72%',  left: '8%',   background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(52, 211, 153, 0.7))', shadow: 'rgba(52, 211, 153, 0.45)', x: [0, 16, -16, 0],  y: [0, -25, 20, 0],  scale: [1, 1.25, 0.85, 1], opacity: [0.7, 0.95, 0.7, 0.7], duration: 5 },
    { id: 'h6',  size: 28, top: '26%',  left: '46%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(139, 92, 246, 0.7))', shadow: 'rgba(139, 92, 246, 0.45)', x: [0, -18, 18, 0], y: [0, -30, 18, 0],  scale: [1, 1.2, 0.85, 1], opacity: [0.65, 0.9, 0.65, 0.65], duration: 6.5 },
    { id: 'h7',  size: 22, top: '78%',  left: '68%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.7))',  shadow: 'rgba(99, 102, 241, 0.45)',  x: [0, 16, -16, 0],  y: [0, -25, 16, 0],  scale: [1, 1.3, 0.9, 1],  opacity: [0.75, 1, 0.75, 0.75], duration: 4 },
    { id: 'h8',  size: 14, top: '12%',  left: '32%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(56, 189, 248, 0.75))',shadow: 'rgba(56, 189, 248, 0.45)',x: [0, -12, 12, 0], y: [0, -20, 12, 0],  scale: [1, 1.35, 0.75, 1], opacity: [0.8, 1, 0.8, 0.8], duration: 3.5 },
    { id: 'h9',  size: 40, top: '48%',  left: '22%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.65))', shadow: 'rgba(99, 102, 241, 0.45)', x: [0, 20, -20, 0],  y: [0, -40, 25, 0],  scale: [1, 1.15, 0.9, 1], opacity: [0.65, 0.9, 0.65, 0.65], duration: 7 },
    { id: 'h10', size: 20, top: '85%',  left: '40%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(168, 85, 247, 0.7))', shadow: 'rgba(168, 85, 247, 0.45)', x: [0, -14, 16, 0], y: [0, -25, 12, 0],  scale: [1, 1.2, 0.8, 1],  opacity: [0.75, 0.95, 0.75, 0.75], duration: 4.5 },
    { id: 'h11', size: 26, top: '18%',  left: '60%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(236, 72, 153, 0.7))', shadow: 'rgba(236, 72, 153, 0.45)', x: [0, 16, -16, 0],  y: [0, -32, 16, 0],  scale: [1, 1.2, 0.85, 1], opacity: [0.7, 0.95, 0.7, 0.7], duration: 5.8 },
    { id: 'h12', size: 15, top: '64%',  left: '52%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(52, 211, 153, 0.75))',shadow: 'rgba(52, 211, 153, 0.45)',x: [0, -14, 14, 0], y: [0, -22, 14, 0],  scale: [1, 1.3, 0.8, 1],  opacity: [0.8, 1, 0.8, 0.8], duration: 3.8 },
    { id: 'h13', size: 34, top: '38%',  left: '75%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.7))',  shadow: 'rgba(99, 102, 241, 0.45)',  x: [0, -20, 18, 0], y: [0, -36, 20, 0],  scale: [1, 1.15, 0.9, 1], opacity: [0.65, 0.9, 0.65, 0.65], duration: 6.8 },
    { id: 'h14', size: 19, top: '90%',  left: '18%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(59, 130, 246, 0.75))', shadow: 'rgba(59, 130, 246, 0.45)', x: [0, 15, -15, 0],  y: [0, -24, 15, 0],  scale: [1, 1.25, 0.85, 1], opacity: [0.75, 1, 0.75, 0.75], duration: 4.2 },
    { id: 'h15', size: 28, top: '62%',  left: '32%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(168, 85, 247, 0.7))', shadow: 'rgba(168, 85, 247, 0.45)', x: [0, -18, 18, 0], y: [0, -32, 18, 0],  scale: [1, 1.2, 0.85, 1], opacity: [0.7, 0.95, 0.7, 0.7], duration: 5.5 },
    { id: 'h16', size: 16, top: '42%',  left: '94%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(56, 189, 248, 0.75))',shadow: 'rgba(56, 189, 248, 0.45)',x: [0, 14, -14, 0],  y: [0, -20, 14, 0],  scale: [1, 1.3, 0.8, 1],  opacity: [0.8, 1, 0.8, 0.8], duration: 3.6 },
    { id: 'h17', size: 42, top: '82%',  left: '80%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.65))', shadow: 'rgba(99, 102, 241, 0.45)', x: [0, -22, 20, 0], y: [0, -42, 24, 0],  scale: [1, 1.1, 0.9, 1],  opacity: [0.65, 0.9, 0.65, 0.65], duration: 7.2 },
    { id: 'h18', size: 21, top: '6%',   left: '48%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(236, 72, 153, 0.75))', shadow: 'rgba(236, 72, 153, 0.45)', x: [0, 15, -15, 0],  y: [0, -22, 15, 0],  scale: [1, 1.25, 0.85, 1], opacity: [0.75, 1, 0.75, 0.75], duration: 4.8 },
    { id: 'h19', size: 17, top: '76%',  left: '92%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(52, 211, 153, 0.75))', shadow: 'rgba(52, 211, 153, 0.45)', x: [0, -14, 14, 0], y: [0, -20, 14, 0],  scale: [1, 1.3, 0.8, 1],  opacity: [0.8, 1, 0.8, 0.8], duration: 3.9 },
    { id: 'h20', size: 30, top: '30%',  left: '30%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(59, 130, 246, 0.7))',  shadow: 'rgba(59, 130, 246, 0.45)',  x: [0, 18, -18, 0],  y: [0, -32, 18, 0],  scale: [1, 1.2, 0.85, 1], opacity: [0.7, 0.95, 0.7, 0.7], duration: 5.9 },
    { id: 'h21', size: 14, top: '50%',  left: '3%',   background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(168, 85, 247, 0.75))', shadow: 'rgba(168, 85, 247, 0.45)', x: [0, -12, 12, 0], y: [0, -18, 12, 0],  scale: [1, 1.35, 0.75, 1], opacity: [0.8, 1, 0.8, 0.8], duration: 3.4 },
    { id: 'h22', size: 25, top: '88%',  left: '58%',  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(99, 102, 241, 0.7))',  shadow: 'rgba(99, 102, 241, 0.45)',  x: [0, 16, -16, 0],  y: [0, -28, 16, 0],  scale: [1, 1.2, 0.85, 1], opacity: [0.75, 0.95, 0.75, 0.75], duration: 5.1 }
];

const FloatingBubbles = () => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div 
            className="floating-bubbles-container"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1
            }}
            aria-hidden="true"
        >
            {HEADER_BUBBLES.map((bubble) => (
                <motion.div
                    key={bubble.id}
                    className="floating-bubble"
                    style={{
                        position: 'absolute',
                        top: bubble.top,
                        left: bubble.left,
                        width: bubble.size,
                        height: bubble.size,
                        borderRadius: '50%',
                        background: bubble.background,
                        backdropFilter: 'blur(3px)',
                        WebkitBackdropFilter: 'blur(3px)',
                        boxShadow: `0 4px 16px 0 ${bubble.shadow}`,
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        pointerEvents: 'none',
                        willChange: 'transform, opacity'
                    }}
                    animate={
                        shouldReduceMotion
                            ? { opacity: bubble.opacity[0] }
                            : {
                                  x: bubble.x,
                                  y: bubble.y,
                                  scale: bubble.scale,
                                  opacity: bubble.opacity,
                                  rotate: [0, 30, -30, 0]
                              }
                    }
                    transition={
                        shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                  duration: bubble.duration,
                                  repeat: Infinity,
                                  repeatType: 'mirror',
                                  ease: 'easeInOut'
                              }
                    }
                />
            ))}
        </div>
    );
};

export default FloatingBubbles;

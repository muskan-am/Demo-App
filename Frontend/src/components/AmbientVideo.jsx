import { useEffect, useRef, useState, startTransition } from 'react';
import sampleVideo from '../assets/video.mp4';

/**
 * AmbientVideo Component
 * Inspired by Framer AmbientVideo (https://framer.com/m/AmbientVideo-SZnd.js@OJhlrtu9JpdUpGnJg57v)
 *
 * Real-time canvas color extraction projects a live ambient glow matching the active video content colors.
 */

const AmbientVideo = ({
    videoSrc = sampleVideo,
    poster,
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    glowIntensity = 0.75,
    glowBlur = 60,
    glowSpread = 25,
    borderRadius = 24,
    className = ''
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [glowColor, setGlowColor] = useState('rgba(99, 102, 241, 0.4)');

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let intervalId;

        const extractColorFromFrame = () => {
            if (video.readyState < 2) return null;
            try {
                canvas.width = 1;
                canvas.height = 1;
                ctx.drawImage(video, 0, 0, 1, 1);
                const imageData = ctx.getImageData(0, 0, 1, 1);
                const [r, g, b] = imageData.data;
                return `rgba(${r}, ${g}, ${b}, ${glowIntensity})`;
            } catch (error) {
                return null;
            }
        };

        const updateGlowColor = () => {
            if (video.readyState < 2) return;
            const newColor = extractColorFromFrame();
            if (newColor) {
                startTransition(() => {
                    setGlowColor(newColor);
                });
            }
        };

        const startGlowUpdates = () => {
            if (intervalId) clearInterval(intervalId);
            updateGlowColor();
            intervalId = setInterval(updateGlowColor, 50);
        };

        const stopGlowUpdates = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = 0;
            }
        };

        const handleCanPlay = () => startGlowUpdates();
        const handlePlay = () => startGlowUpdates();
        const handlePause = () => stopGlowUpdates();
        const handleEnded = () => stopGlowUpdates();

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadedmetadata', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        if (video.readyState >= 3) {
            startGlowUpdates();
        }

        return () => {
            stopGlowUpdates();
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadedmetadata', handleCanPlay);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, [glowIntensity]);

    return (
        <div className={`ambient-video-wrapper ${className}`}>
            <div className="ambient-video-container" style={{ borderRadius }}>
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={poster}
                    autoPlay={autoPlay}
                    muted={muted}
                    loop={loop}
                    controls={controls}
                    playsInline
                    className="ambient-video-element"
                    style={{
                        borderRadius,
                        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 ${glowBlur}px ${glowSpread}px ${glowColor}`
                    }}
                />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} width={1} height={1} />
        </div>
    );
};

export default AmbientVideo;

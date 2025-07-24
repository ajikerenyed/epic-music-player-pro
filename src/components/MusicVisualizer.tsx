import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface MusicVisualizerProps {
  isPlaying: boolean;
  audioData?: number[];
}

export const MusicVisualizer = ({ isPlaying, audioData }: MusicVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(new Array(64).fill(0));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        // Simulate audio data if not provided
        const newBars = new Array(64).fill(0).map((_, index) => {
          if (audioData && audioData[index]) {
            return audioData[index];
          }
          // Simulate dynamic audio visualization
          const baseHeight = Math.sin(Date.now() * 0.01 + index * 0.1) * 0.3 + 0.3;
          const randomVariation = Math.random() * 0.4;
          const centerBoost = Math.max(0, 1 - Math.abs(index - 32) / 16) * 0.3;
          return Math.min(1, baseHeight + randomVariation + centerBoost);
        });
        setBars(newBars);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Gradually fade bars to zero
      setBars(prev => prev.map(bar => Math.max(0, bar - 0.05)));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioData]);

  return (
    <Card className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold gradient-text">Audio Visualizer</h3>
      
      {/* Main Visualizer */}
      <div className="h-48 bg-card/30 rounded-lg border border-border/50 p-4 overflow-hidden">
        <div className="flex items-end justify-center gap-1 h-full">
          {bars.map((height, index) => (
            <div
              key={index}
              className="visualizer-bar"
              style={{
                height: `${Math.max(2, height * 100)}%`,
                width: '3px',
                opacity: isPlaying ? 0.8 + height * 0.2 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Circular Visualizer */}
      <div className="h-32 bg-card/30 rounded-lg border border-border/50 p-4 flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          {bars.slice(0, 32).map((height, index) => {
            const angle = (index / 32) * 360;
            const length = 10 + height * 20;
            return (
              <div
                key={index}
                className="absolute w-0.5 bg-gradient-visualizer origin-bottom"
                style={{
                  height: `${length}px`,
                  left: '50%',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  opacity: isPlaying ? 0.7 + height * 0.3 : 0.3,
                }}
              />
            );
          })}
          <div className="absolute inset-2 rounded-full bg-primary/20 neon-glow-cyan animate-pulse" />
        </div>
      </div>

      {/* Waveform */}
      <div className="h-16 bg-card/30 rounded-lg border border-border/50 p-2">
        <div className="flex items-center justify-center h-full">
          <svg width="100%" height="100%" viewBox="0 0 300 60">
            <path
              d={`M 0 30 ${bars.map((height, index) => 
                `L ${(index / bars.length) * 300} ${30 - height * 25}`
              ).join(' ')} L 300 30`}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              className="opacity-80"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
                <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
                <stop offset="100%" stopColor="hsl(var(--neon-pink))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Card>
  );
};
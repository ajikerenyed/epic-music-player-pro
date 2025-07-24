import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  coverArt: string;
}

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const MusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  currentTime,
  onSeek,
}: MusicPlayerProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffleMode, setShuffleMode] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = currentTrack 
    ? (currentTime / currentTrack.duration) * 100 
    : 0;

  return (
    <Card className="glass-card border-none p-6 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        {/* Album Art & Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-primary animate-pulse">
              {currentTrack?.coverArt && (
                <img 
                  src={currentTrack.coverArt} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary neon-glow animate-pulse" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate gradient-text">
              {currentTrack?.title || 'No track selected'}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack?.artist || 'Unknown artist'}
            </p>
            <p className="text-xs text-muted-foreground/60 truncate">
              {currentTrack?.album || 'Unknown album'}
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShuffleMode(!shuffleMode)}
              className={shuffleMode ? 'text-primary neon-glow' : 'text-muted-foreground'}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="text-foreground hover:text-primary"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={onPlayPause}
              className="music-control-btn w-12 h-12"
              disabled={!currentTrack}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="text-foreground hover:text-primary"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRepeatMode(
                repeatMode === 'off' ? 'all' : 
                repeatMode === 'all' ? 'one' : 'off'
              )}
              className={repeatMode !== 'off' ? 'text-primary neon-glow' : 'text-muted-foreground'}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 text-xs bg-primary">
                  1
                </Badge>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-80">
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[progressPercentage]}
                onValueChange={([value]) => {
                  if (currentTrack) {
                    onSeek((value / 100) * currentTrack.duration);
                  }
                }}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {currentTrack ? formatTime(currentTrack.duration) : '0:00'}
            </span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className={isFavorite ? 'text-accent neon-glow-accent' : 'text-muted-foreground'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => onVolumeChange(value)}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
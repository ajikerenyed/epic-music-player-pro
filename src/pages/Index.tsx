import { useState, useEffect, useRef } from 'react';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Equalizer } from '@/components/Equalizer';
import { MusicVisualizer } from '@/components/MusicVisualizer';
import { Playlist } from '@/components/Playlist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music2, Settings, Headphones, Library } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  url: string;
  coverArt: string;
  playCount?: number;
  isFavorite?: boolean;
  addedDate?: Date;
}

const Index = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Sonic Waves',
      album: 'Digital Harmony',
      duration: 245,
      url: '',
      coverArt: '',
      playCount: 23,
      isFavorite: true,
      addedDate: new Date(),
    },
    {
      id: '2',
      title: 'Electric Soul',
      artist: 'Bass Thunder',
      album: 'Frequency',
      duration: 198,
      url: '',
      coverArt: '',
      playCount: 15,
      isFavorite: false,
      addedDate: new Date(),
    },
    {
      id: '3',
      title: 'Neon Lights',
      artist: 'Cyber Symphony',
      album: 'Future Sound',
      duration: 267,
      url: '',
      coverArt: '',
      playCount: 8,
      isFavorite: true,
      addedDate: new Date(),
    },
  ]);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Simulate current time progression
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setCurrentTime(0);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrack(tracks[prevIndex]);
    setCurrentTime(0);
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    
    // Update play count
    setTracks(prev => prev.map(t => 
      t.id === track.id 
        ? { ...t, playCount: (t.playCount || 0) + 1 }
        : t
    ));
  };

  const handleToggleFavorite = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, isFavorite: !track.isFavorite }
        : track
    ));
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary neon-glow flex items-center justify-center">
              <Music2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">SoundScape</h1>
              <p className="text-sm text-muted-foreground">Sonic Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gradient-primary">
              Premium
            </Badge>
            <Badge variant="outline" className="neon-glow-cyan">
              Dolby Digital
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="visualizer" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Visualizer
            </TabsTrigger>
            <TabsTrigger value="equalizer" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Equalizer
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Effects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <Playlist
              tracks={tracks}
              currentTrack={currentTrack}
              onTrackSelect={handleTrackSelect}
              onToggleFavorite={handleToggleFavorite}
            />
          </TabsContent>

          <TabsContent value="visualizer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MusicVisualizer isPlaying={isPlaying} />
              <Card className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold gradient-text">Now Playing</h3>
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-primary neon-glow flex items-center justify-center">
                    <Music2 className="w-16 h-16 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {currentTrack?.title || 'No track selected'}
                    </h4>
                    <p className="text-muted-foreground">
                      {currentTrack?.artist || 'Unknown artist'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equalizer">
            <Equalizer />
          </TabsContent>

          <TabsContent value="effects">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold gradient-text">Audio Effects</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 neon-glow">
                    <h4 className="font-medium mb-2">3D Surround Sound</h4>
                    <p className="text-sm text-muted-foreground">
                      Experience immersive 360° audio with virtual surround sound processing
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-card rounded-lg border border-accent/20 neon-glow-accent">
                    <h4 className="font-medium mb-2">Bass Enhancement</h4>
                    <p className="text-sm text-muted-foreground">
                      Dynamic bass boost with intelligent frequency analysis
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-card rounded-lg border border-neon-cyan/20 neon-glow-cyan">
                    <h4 className="font-medium mb-2">Vocal Clarity</h4>
                    <p className="text-sm text-muted-foreground">
                      Enhanced vocal presence with noise reduction
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold gradient-text">File Scanner</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automatically scan and import music files from your device
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Supported formats:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['.mp3', '.wav', '.m4a', '.aac', '.flac', '.mp4'].map(format => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-secondary neon-glow-accent">
                    Scan Device for Music
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        currentTime={currentTime}
        onSeek={handleSeek}
      />
    </div>
  );
};

export default Index;

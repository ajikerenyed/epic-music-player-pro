import { useState, useEffect, useRef } from 'react';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Equalizer } from '@/components/Equalizer';
import { MusicVisualizer } from '@/components/MusicVisualizer';
import { Playlist } from '@/components/Playlist';
import { MusicUploader } from '@/components/MusicUploader';
import { Library } from '@/components/Library';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music2, Settings, Headphones, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement>(null);

  // Load tracks from Supabase
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tracksError) throw tracksError;

      // Get favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('track_id');

      if (favoritesError) throw favoritesError;

      // Get play counts
      const { data: playHistoryData, error: playHistoryError } = await supabase
        .from('play_history')
        .select('track_id, play_count');

      if (playHistoryError) throw playHistoryError;

      const favoriteIds = new Set(favoritesData?.map(f => f.track_id) || []);
      const playCounts = new Map(playHistoryData?.map(p => [p.track_id, p.play_count]) || []);

      const formattedTracks: Track[] = (tracksData || []).map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Unknown Album',
        duration: track.duration || 0,
        url: track.file_path,
        coverArt: '',
        playCount: playCounts.get(track.id) || 0,
        isFavorite: favoriteIds.has(track.id),
        addedDate: new Date(track.created_at),
      }));

      setTracks(formattedTracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load music library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleTrackSelect = async (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    
    // Update play count in database
    try {
      const { data: existingHistory } = await supabase
        .from('play_history')
        .select('*')
        .eq('track_id', track.id)
        .single();

      if (existingHistory) {
        await supabase
          .from('play_history')
          .update({ play_count: existingHistory.play_count + 1 })
          .eq('track_id', track.id);
      } else {
        await supabase
          .from('play_history')
          .insert({ track_id: track.id, play_count: 1 });
      }

      // Update local state
      setTracks(prev => prev.map(t => 
        t.id === track.id 
          ? { ...t, playCount: (t.playCount || 0) + 1 }
          : t
      ));
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  const handleToggleFavorite = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    try {
      if (track.isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('track_id', trackId);
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({ track_id: trackId });
      }

      // Update local state
      setTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, isFavorite: !t.isFavorite }
          : t
      ));

      toast({
        title: track.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${track.title} by ${track.artist}`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
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
              <FolderOpen className="w-4 h-4" />
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
            <Library
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
              
              <MusicUploader onUploadComplete={loadTracks} />
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

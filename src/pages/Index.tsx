import { useState, useEffect, useRef } from 'react';
import { MusicPlayer } from '@/components/MusicPlayer';
import { MusicVisualizer } from '@/components/MusicVisualizer';
import { Playlist } from '@/components/Playlist';
import { Settings } from '@/components/Settings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Music2, Settings as SettingsIcon, List, Menu } from 'lucide-react';
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
      {/* Minimal Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary neon-glow flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold gradient-text">SoundScape</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Playlist
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-card border-border/50">
                <Playlist
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onTrackSelect={handleTrackSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-4xl glass-card border-border/50">
                <Settings
                  tracks={tracks}
                  currentTrack={currentTrack}
                  onTrackSelect={handleTrackSelect}
                  onToggleFavorite={handleToggleFavorite}
                  onScanComplete={loadTracks}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Visualizer Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer */}
          <div className="lg:col-span-2">
            <MusicVisualizer isPlaying={isPlaying} />
          </div>
          
          {/* Now Playing Card */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold gradient-text mb-4">Now Playing</h3>
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto rounded-2xl bg-gradient-primary neon-glow flex items-center justify-center">
                  <Music2 className="w-24 h-24 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-1">
                    {currentTrack?.title || 'No track selected'}
                  </h4>
                  <p className="text-muted-foreground text-lg">
                    {currentTrack?.artist || 'Unknown artist'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentTrack?.album || 'Unknown album'}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="neon-glow-cyan">
                    {tracks.length} tracks
                  </Badge>
                  {currentTrack?.isFavorite && (
                    <Badge variant="outline" className="neon-glow-accent">
                      Favorite
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card p-4">
              <h4 className="font-semibold mb-3 gradient-text">Library Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tracks:</span>
                  <span>{tracks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Favorites:</span>
                  <span>{tracks.filter(t => t.isFavorite).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Plays:</span>
                  <span>{tracks.reduce((sum, t) => sum + (t.playCount || 0), 0)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
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

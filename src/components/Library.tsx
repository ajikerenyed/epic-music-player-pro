import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, Play, Clock, Search, Filter, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface LibraryProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

export const Library = ({ tracks, currentTrack, onTrackSelect, onToggleFavorite }: LibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'playCount' | 'addedDate'>('addedDate');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const filteredAndSortedTracks = tracks
    .filter(track => {
      // Search filter
      const matchesSearch = !searchTerm || 
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.album.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      switch (filterBy) {
        case 'favorites':
          return track.isFavorite;
        case 'recent':
          return track.addedDate && 
            (Date.now() - track.addedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'playCount':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'addedDate':
          return (b.addedDate?.getTime() || 0) - (a.addedDate?.getTime() || 0);
        default:
          return 0;
      }
    });

  const favoritesTracks = tracks.filter(track => track.isFavorite);
  const mostPlayedTracks = tracks
    .filter(track => (track.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 10);

  const recentTracks = tracks
    .filter(track => track.addedDate && 
      (Date.now() - track.addedDate.getTime()) < (7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => (b.addedDate?.getTime() || 0) - (a.addedDate?.getTime() || 0));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="grid grid-cols-4 glass-card">
            <TabsTrigger value="all">All Music</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Popular
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const sorts: Array<typeof sortBy> = ['addedDate', 'title', 'artist', 'playCount'];
                const currentIndex = sorts.indexOf(sortBy);
                setSortBy(sorts[(currentIndex + 1) % sorts.length]);
              }}
              className="glass-card"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <MusicList 
            tracks={filteredAndSortedTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <MusicList 
            tracks={favoritesTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="recent">
          <MusicList 
            tracks={recentTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="popular">
          <MusicList 
            tracks={mostPlayedTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{tracks.length}</div>
            <div className="text-sm text-muted-foreground">Total Tracks</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{favoritesTracks.length}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">
              {tracks.reduce((sum, track) => sum + (track.playCount || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Plays</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">
              {Math.floor(tracks.reduce((sum, track) => sum + track.duration, 0) / 3600)}h
            </div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface MusicListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

const MusicList = ({ tracks, currentTrack, onTrackSelect, onToggleFavorite }: MusicListProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (tracks.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <div className="text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <p>No tracks found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-border/50">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`p-4 hover:bg-accent/5 transition-colors cursor-pointer group ${
                currentTrack?.id === track.id ? 'bg-accent/10 border-l-2 border-l-primary' : ''
              }`}
              onClick={() => onTrackSelect(track)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary neon-glow flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 text-primary-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{track.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist} • {track.album}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {track.playCount && track.playCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {track.playCount} plays
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track.id);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            track.isFavorite 
                              ? 'fill-destructive text-destructive' 
                              : 'text-muted-foreground hover:text-destructive'
                          }`} 
                        />
                      </Button>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
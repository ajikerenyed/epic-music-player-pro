import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Heart, Search, Music2 } from 'lucide-react';

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

interface PlaylistProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

export const Playlist = ({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onToggleFavorite 
}: PlaylistProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold gradient-text">Playlist</h3>
          <Badge variant="outline" className="neon-glow-cyan">
            {filteredTracks.length} tracks
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tracks found</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              
              return (
                <div
                  key={track.id}
                  className={`playlist-item ${isCurrentTrack ? 'active' : ''}`}
                  onClick={() => onTrackSelect(track)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 h-8 p-0 rounded-full"
                    >
                      {isCurrentTrack && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">
                        {track.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist} • {track.album}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(track.duration)}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track.id);
                        }}
                      >
                        <Heart 
                          className={`w-3 h-3 ${
                            track.isFavorite 
                              ? 'fill-neon-pink text-neon-pink' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>

                  {track.playCount && track.playCount > 0 && (
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{track.playCount} plays</span>
                      {track.addedDate && (
                        <span>Added {track.addedDate.toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
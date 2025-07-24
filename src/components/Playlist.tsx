import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Music, Heart, Clock, Plus, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

export const Playlist = ({ tracks, currentTrack, onTrackSelect, onToggleFavorite }: PlaylistProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.album.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedTab) {
      case 'favorites':
        return matchesSearch && track.isFavorite;
      case 'recent':
        return matchesSearch && track.playCount && track.playCount > 0;
      default:
        return matchesSearch;
    }
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (selectedTab === 'recent') {
      return (b.playCount || 0) - (a.playCount || 0);
    }
    return 0;
  });

  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold gradient-text">Music Library</h2>
        <Badge variant="outline" className="bg-gradient-primary">
          {tracks.length} tracks
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass-card"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            All Music
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          <TrackList 
            tracks={sortedTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-2">
          <TrackList 
            tracks={sortedTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-2">
          <TrackList 
            tracks={sortedTracks} 
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
            showPlayCount
          />
        </TabsContent>
      </Tabs>

      {/* Add Music Button */}
      <Button className="w-full bg-gradient-primary neon-glow">
        <Plus className="w-4 h-4 mr-2" />
        Scan for Music Files
      </Button>
    </Card>
  );
};

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  showPlayCount?: boolean;
}

const TrackList = ({ tracks, currentTrack, onTrackSelect, onToggleFavorite, showPlayCount }: TrackListProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {tracks.map((track) => (
        <div
          key={track.id}
          className={`playlist-item ${currentTrack?.id === track.id ? 'active' : ''}`}
          onClick={() => onTrackSelect(track)}
        >
          <div className="flex items-center gap-3">
            {/* Track Image */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-primary flex-shrink-0">
              {track.coverArt ? (
                <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{track.album}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  {showPlayCount && track.playCount && (
                    <Badge variant="outline" className="text-xs">
                      {track.playCount} plays
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-card border-border">
                      <DropdownMenuItem onClick={() => onToggleFavorite(track.id)}>
                        <Heart className={`w-4 h-4 mr-2 ${track.isFavorite ? 'fill-current text-accent' : ''}`} />
                        {track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {tracks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No tracks found</p>
        </div>
      )}
    </div>
  );
};
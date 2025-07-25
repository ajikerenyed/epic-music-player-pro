import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Music2, 
  Settings as SettingsIcon, 
  Headphones, 
  ScanSearch,
  Palette,
  Volume2,
  Shield
} from 'lucide-react';
import { Equalizer } from './Equalizer';
import { MusicScanner } from './MusicScanner';
import { Library } from './Library';

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

interface SettingsProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onScanComplete: () => void;
}

export const Settings = ({ 
  tracks, 
  currentTrack, 
  onTrackSelect, 
  onToggleFavorite,
  onScanComplete 
}: SettingsProps) => {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary neon-glow flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 glass-card">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <ScanSearch className="w-4 h-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6 space-y-6">
              <h3 className="text-lg font-semibold gradient-text flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Language & Region
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Display Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-card/50">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoplay">Auto-play Next Track</Label>
                  <Switch
                    id="autoplay"
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold gradient-text flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 neon-glow">
                  <h4 className="font-medium mb-2">Data Collection</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control how your listening data is used to improve recommendations
                  </p>
                  <Switch defaultChecked />
                </div>

                <div className="p-4 bg-gradient-card rounded-lg border border-accent/20 neon-glow-accent">
                  <h4 className="font-medium mb-2">Analytics</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Help improve the app by sharing anonymous usage statistics
                  </p>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <Library
            tracks={tracks}
            currentTrack={currentTrack}
            onTrackSelect={onTrackSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </TabsContent>

        <TabsContent value="audio">
          <Equalizer />
        </TabsContent>

        <TabsContent value="scanner">
          <MusicScanner onScanComplete={onScanComplete} />
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold gradient-text">Theme Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkmode">Dark Mode</Label>
                  <Switch
                    id="darkmode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Button size="sm" className="w-8 h-8 p-0 rounded-full bg-neon-purple" />
                    <Button size="sm" className="w-8 h-8 p-0 rounded-full bg-neon-cyan" />
                    <Button size="sm" className="w-8 h-8 p-0 rounded-full bg-neon-pink" />
                    <Button size="sm" className="w-8 h-8 p-0 rounded-full bg-neon-blue" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visualizer Style</Label>
                  <Select defaultValue="spectrum">
                    <SelectTrigger className="bg-card/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spectrum">Spectrum Bars</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="waveform">Waveform</SelectItem>
                      <SelectItem value="particles">Particles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold gradient-text">Display</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 neon-glow">
                  <h4 className="font-medium mb-2">High Contrast</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Improve text readability with higher contrast
                  </p>
                  <Switch />
                </div>

                <div className="p-4 bg-gradient-card rounded-lg border border-accent/20 neon-glow-accent">
                  <h4 className="font-medium mb-2">Reduced Motion</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Minimize animations and transitions
                  </p>
                  <Switch />
                </div>

                <div className="p-4 bg-gradient-card rounded-lg border border-neon-cyan/20 neon-glow-cyan">
                  <h4 className="font-medium mb-2">Screen Reader</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enhanced accessibility features
                  </p>
                  <Switch />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
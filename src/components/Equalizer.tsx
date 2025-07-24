import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EqualizerBand {
  frequency: string;
  gain: number;
}

const presets = {
  flat: { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  rock: { name: 'Rock', gains: [5, 3, -1, -2, 1, 2, 4, 6, 7, 6] },
  pop: { name: 'Pop', gains: [-1, 2, 4, 4, 1, -1, -2, -2, -1, -1] },
  jazz: { name: 'Jazz', gains: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  classical: { name: 'Classical', gains: [4, 3, 2, 1, -1, -2, -1, 2, 3, 4] },
  electronic: { name: 'Electronic', gains: [4, 3, 1, 0, -2, 2, 1, 2, 4, 5] },
  bass: { name: 'Bass Boost', gains: [7, 6, 5, 3, 1, 0, -1, -2, -2, -3] },
  treble: { name: 'Treble Boost', gains: [-3, -2, -1, 0, 1, 3, 5, 6, 7, 8] },
  vocal: { name: 'Vocal', gains: [-2, -1, 1, 3, 4, 4, 3, 1, 0, -1] },
};

const frequencies = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export const Equalizer = () => {
  const [currentPreset, setCurrentPreset] = useState('flat');
  const [gains, setGains] = useState(presets.flat.gains);
  const [bassBoost, setBassBoost] = useState(0);
  const [enabled, setEnabled] = useState(true);

  const handlePresetChange = (presetKey: string) => {
    setCurrentPreset(presetKey);
    setGains([...presets[presetKey as keyof typeof presets].gains]);
  };

  const handleGainChange = (index: number, value: number[]) => {
    const newGains = [...gains];
    newGains[index] = value[0];
    setGains(newGains);
    setCurrentPreset('custom');
  };

  const resetEQ = () => {
    setGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setBassBoost(0);
    setCurrentPreset('flat');
  };

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold gradient-text">Equalizer</h2>
        <div className="flex items-center gap-2">
          <Badge variant={enabled ? "default" : "secondary"} className="cursor-pointer" onClick={() => setEnabled(!enabled)}>
            {enabled ? 'ON' : 'OFF'}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetEQ}>
            Reset
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Preset</label>
        <Select value={currentPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="glass-card">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border">
            {Object.entries(presets).map(([key, preset]) => (
              <SelectItem key={key} value={key}>
                {preset.name}
              </SelectItem>
            ))}
            {currentPreset === 'custom' && (
              <SelectItem value="custom">Custom</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Bass Boost */}
      <div className="space-y-4">
        <label className="text-sm font-medium flex items-center gap-2">
          Bass Boost
          <Badge variant="outline" className="text-xs">
            {bassBoost > 0 ? `+${bassBoost}dB` : `${bassBoost}dB`}
          </Badge>
        </label>
        <div className="relative">
          <Slider
            value={[bassBoost]}
            onValueChange={(value) => setBassBoost(value[0])}
            min={0}
            max={12}
            step={1}
            className="w-full"
            disabled={!enabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0dB</span>
            <span>+12dB</span>
          </div>
        </div>
      </div>

      {/* Equalizer Bands */}
      <div className="space-y-4">
        <label className="text-sm font-medium">Frequency Bands</label>
        <div className="flex justify-between items-end gap-2 p-4 bg-card/30 rounded-lg border border-border/50">
          {frequencies.map((freq, index) => (
            <div key={freq} className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground font-mono">
                {gains[index] > 0 ? `+${gains[index]}` : gains[index]}dB
              </div>
              <div className="h-32 flex items-end">
                <Slider
                  orientation="vertical"
                  value={[gains[index]]}
                  onValueChange={(value) => handleGainChange(index, value)}
                  min={-12}
                  max={12}
                  step={1}
                  className="h-full equalizer-band"
                  disabled={!enabled}
                />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {freq}Hz
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dolby Digital Effect */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Dolby Digital</label>
          <Badge variant="outline" className="bg-gradient-primary">
            Surround
          </Badge>
        </div>
        <div className="p-4 bg-gradient-card rounded-lg border border-primary/20 neon-glow">
          <p className="text-sm text-muted-foreground">
            Enhanced spatial audio processing for immersive sound experience
          </p>
        </div>
      </div>
    </Card>
  );
};
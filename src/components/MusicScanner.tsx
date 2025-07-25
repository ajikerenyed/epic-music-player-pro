import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, Music, FolderOpen, Disc3, ScanLine, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MusicScannerProps {
  onScanComplete: () => void;
}

interface ScanProgress {
  fileName: string;
  progress: number;
  status: 'scanning' | 'processing' | 'complete' | 'error';
  error?: string;
}

export const MusicScanner = ({ onScanComplete }: MusicScannerProps) => {
  const [scannedFiles, setScannedFiles] = useState<ScanProgress[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStats, setScanStats] = useState({
    total: 0,
    processed: 0,
    added: 0,
    skipped: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supportedFormats = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.mp4'];

  const handleFolderScan = () => {
    folderInputRef.current?.click();
  };

  const handleFileScan = () => {
    fileInputRef.current?.click();
  };

  const extractMetadata = async (file: File): Promise<{
    title: string;
    artist?: string;
    album?: string;
    duration?: number;
  }> => {
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const parts = fileName.split(' - ');
    
    return {
      title: parts.length > 1 ? parts[1] : fileName,
      artist: parts.length > 1 ? parts[0] : undefined,
      album: undefined,
      duration: undefined,
    };
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `music/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('epic')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('epic')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleScan = async (files: FileList) => {
    if (files.length === 0) return;

    setIsScanning(true);
    const fileArray = Array.from(files);
    
    // Filter supported formats
    const supportedFiles = fileArray.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedFormats.includes(ext);
    });

    if (supportedFiles.length === 0) {
      toast({
        title: "No music files found",
        description: "No supported music files were found in the selected location",
        variant: "destructive",
      });
      setIsScanning(false);
      return;
    }

    setScanStats({
      total: supportedFiles.length,
      processed: 0,
      added: 0,
      skipped: 0
    });

    // Initialize scan progress
    const initialScans: ScanProgress[] = supportedFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'scanning',
    }));
    setScannedFiles(initialScans);

    let added = 0;
    let skipped = 0;

    // Process files
    for (let i = 0; i < supportedFiles.length; i++) {
      const file = supportedFiles[i];
      
      try {
        // Update progress
        setScannedFiles(prev => prev.map((scan, index) => 
          index === i ? { ...scan, progress: 25 } : scan
        ));

        // Check if file already exists
        const metadata = await extractMetadata(file);
        const { data: existingTrack } = await supabase
          .from('tracks')
          .select('id')
          .eq('title', metadata.title)
          .eq('artist', metadata.artist || '')
          .single();

        if (existingTrack) {
          setScannedFiles(prev => prev.map((scan, index) => 
            index === i ? { ...scan, progress: 100, status: 'complete' } : scan
          ));
          skipped++;
          setScanStats(prev => ({ ...prev, processed: i + 1, skipped }));
          continue;
        }

        setScannedFiles(prev => prev.map((scan, index) => 
          index === i ? { ...scan, progress: 50, status: 'processing' } : scan
        ));

        // Upload file
        const fileUrl = await uploadFile(file);
        
        setScannedFiles(prev => prev.map((scan, index) => 
          index === i ? { ...scan, progress: 75 } : scan
        ));

        // Save to database
        const { error: dbError } = await supabase
          .from('tracks')
          .insert({
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            duration: metadata.duration,
            format: file.name.split('.').pop()?.toLowerCase(),
            file_size: file.size,
            file_path: fileUrl,
          });

        if (dbError) throw dbError;

        setScannedFiles(prev => prev.map((scan, index) => 
          index === i ? { ...scan, progress: 100, status: 'complete' } : scan
        ));

        added++;
        setScanStats(prev => ({ ...prev, processed: i + 1, added }));

      } catch (error) {
        console.error('Scan error:', error);
        setScannedFiles(prev => prev.map((scan, index) => 
          index === i ? { 
            ...scan, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Processing failed'
          } : scan
        ));
        setScanStats(prev => ({ ...prev, processed: i + 1 }));
      }
    }

    setIsScanning(false);
    
    // Show completion message
    if (added > 0) {
      toast({
        title: "Scan complete",
        description: `Found and added ${added} new track${added > 1 ? 's' : ''} to your library`,
      });
      onScanComplete();
    } else {
      toast({
        title: "Scan complete",
        description: "No new tracks were found",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary neon-glow flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">Music Scanner</h2>
            <p className="text-muted-foreground">
              Discover and add music files to your library
            </p>
          </div>
        </div>

        {/* Scan Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Button 
            onClick={handleFolderScan} 
            disabled={isScanning}
            className="h-16 bg-gradient-secondary neon-glow-accent flex-col gap-2"
          >
            <FolderOpen className="w-6 h-6" />
            <span className="text-sm">Scan Folder</span>
          </Button>

          <Button 
            onClick={handleFileScan} 
            disabled={isScanning}
            variant="outline"
            className="h-16 glass-card flex-col gap-2"
          >
            <Music className="w-6 h-6" />
            <span className="text-sm">Select Files</span>
          </Button>
        </div>

        {/* Supported Formats */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Supported formats:</span>
            <Badge variant="outline" className="text-xs">
              {supportedFormats.length} formats
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportedFormats.map(format => (
              <Badge key={format} variant="secondary" className="text-xs">
                {format}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Scan Progress */}
      {isScanning && (
        <Card className="glass-card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scanning Progress</h3>
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {scanStats.processed} / {scanStats.total}
                </span>
              </div>
            </div>
            
            <Progress 
              value={(scanStats.processed / scanStats.total) * 100} 
              className="h-2"
            />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">{scanStats.added}</div>
                <div className="text-xs text-muted-foreground">Added</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">{scanStats.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-lg font-bold">{scanStats.processed}</div>
                <div className="text-xs text-muted-foreground">Processed</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Scan Results */}
      {scannedFiles.length > 0 && (
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Scan Results</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {scannedFiles.map((scan, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1 mr-2">{scan.fileName}</span>
                  <div className="flex items-center gap-2">
                    {scan.status === 'complete' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {scan.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    {scan.status === 'scanning' && (
                      <Search className="w-4 h-4 text-blue-500 animate-pulse" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {scan.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={scan.progress} className="h-1" />
                {scan.error && (
                  <p className="text-xs text-destructive">{scan.error}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hidden file inputs */}
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-ignore - webkitdirectory is not in TypeScript types but is supported
        webkitdirectory=""
        accept={supportedFormats.join(',')}
        onChange={(e) => e.target.files && handleScan(e.target.files)}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.join(',')}
        onChange={(e) => e.target.files && handleScan(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
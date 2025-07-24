import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MusicUploaderProps {
  onUploadComplete: () => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export const MusicUploader = ({ onUploadComplete }: MusicUploaderProps) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supportedFormats = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.mp4'];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const extractMetadata = async (file: File): Promise<{
    title: string;
    artist?: string;
    album?: string;
    duration?: number;
  }> => {
    // Basic metadata extraction from filename
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const parts = fileName.split(' - ');
    
    return {
      title: parts.length > 1 ? parts[1] : fileName,
      artist: parts.length > 1 ? parts[0] : undefined,
      album: undefined,
      duration: undefined, // Would need audio analysis for actual duration
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

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);
    
    // Filter supported formats
    const supportedFiles = fileArray.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedFormats.includes(ext);
    });

    if (supportedFiles.length === 0) {
      toast({
        title: "No supported files",
        description: "Please select music files in supported formats",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Initialize progress tracking
    const initialUploads: UploadProgress[] = supportedFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }));
    setUploads(initialUploads);

    // Process files
    for (let i = 0; i < supportedFiles.length; i++) {
      const file = supportedFiles[i];
      
      try {
        // Update progress
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, progress: 25 } : upload
        ));

        // Upload file
        const fileUrl = await uploadFile(file);
        
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, progress: 50, status: 'processing' } : upload
        ));

        // Extract metadata
        const metadata = await extractMetadata(file);
        
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, progress: 75 } : upload
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

        setUploads(prev => prev.map((upload, index) => 
          index === i ? { ...upload, progress: 100, status: 'complete' } : upload
        ));

      } catch (error) {
        console.error('Upload error:', error);
        setUploads(prev => prev.map((upload, index) => 
          index === i ? { 
            ...upload, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : upload
        ));
      }
    }

    setIsUploading(false);
    
    // Show completion message
    const successCount = uploads.filter(u => u.status === 'complete').length;
    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${successCount} track${successCount > 1 ? 's' : ''}`,
      });
      onUploadComplete();
    }
  };

  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary neon-glow flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold gradient-text">Upload Music</h3>
          <p className="text-sm text-muted-foreground">
            Add your music files to the library
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Supported formats:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportedFormats.map(format => (
            <span key={format} className="px-2 py-1 bg-card/50 rounded text-xs">
              {format}
            </span>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleFileSelect} 
        disabled={isUploading}
        className="w-full bg-gradient-secondary neon-glow-accent"
      >
        <Music className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Select Music Files'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.join(',')}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {uploads.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {uploads.map((upload, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2">{upload.fileName}</span>
                <div className="flex items-center gap-1">
                  {upload.status === 'complete' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {upload.progress}%
                  </span>
                </div>
              </div>
              <Progress value={upload.progress} className="h-1" />
              {upload.error && (
                <p className="text-xs text-destructive">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
import { Upload, FileAudio } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const audioFile = files.find((file) =>
        file.type.startsWith('audio/')
      );

      if (audioFile) {
        onFileSelect(audioFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 transition-all cursor-pointer ${isDragging
          ? 'border-[#D4AF37] bg-white/5'
          : 'border-neutral-700 hover:border-neutral-600 hover:bg-white/5'
        }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-white/5">
          {isDragging ? (
            <Upload className="w-12 h-12 text-[#D4AF37]" />
          ) : (
            <FileAudio className="w-12 h-12 text-neutral-500" />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragging ? 'Drop your audio file' : 'Upload Audio File'}
          </h3>
          <p className="text-neutral-400 text-sm mb-4">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-neutral-500">
            Supports MP3, WAV, FLAC, and other audio formats
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-black rounded-lg font-medium transition-colors inline-block">
            Browse Files
          </div>
        </label>
      </div>
    </div>
  );
};

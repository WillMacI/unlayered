import { Upload, FileAudio, Cpu, Zap } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { QUALITY_PRESETS, type SystemCapabilities } from '../services/apiClient';

interface FileUploadProps {
  onFileSelect: (file: File, quality: number) => void;
  capabilities?: SystemCapabilities | null;
  recommendedQuality?: number;
  disabled?: boolean;
}

export const FileUpload = ({
  onFileSelect,
  capabilities,
  recommendedQuality = 2,
  disabled = false,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(recommendedQuality);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [userHasSelectedQuality, setUserHasSelectedQuality] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedQuality when recommendedQuality changes (if user hasn't manually selected)
  useEffect(() => {
    if (!userHasSelectedQuality && !pendingFile) {
      setSelectedQuality(recommendedQuality);
    }
  }, [recommendedQuality, userHasSelectedQuality, pendingFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (disabled) return;
      setPendingFile(file);
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const audioFile = files.find((file) =>
        file.type.startsWith('audio/')
      );

      if (audioFile) {
        processFile(audioFile);
      }
    },
    [disabled, processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset input so the same file can be selected again
      if (e.target) {
        e.target.value = '';
      }
    },
    [disabled, processFile]
  );

  const handleBrowseClick = useCallback(async () => {
    if (disabled) return;

    try {
      // Try native Tauri dialog first
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Audio Files',
            extensions: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma'],
          },
        ],
      });

      if (selected && typeof selected === 'string') {
        // Read the file content
        const fileData = await readFile(selected);
        const fileName = selected.split('/').pop() || selected.split('\\').pop() || 'audio';

        // Determine MIME type from extension
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const mimeTypes: Record<string, string> = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          flac: 'audio/flac',
          ogg: 'audio/ogg',
          aac: 'audio/aac',
          m4a: 'audio/mp4',
          wma: 'audio/x-ms-wma',
        };
        const mimeType = mimeTypes[ext] || 'audio/mpeg';

        // Create a File object from the data
        const file = new File([fileData], fileName, { type: mimeType });
        processFile(file);
      }
    } catch {
      // Tauri not available or error - fall back to input click using ref
      fileInputRef.current?.click();
    }
  }, [disabled, processFile]);

  const handleStartSeparation = useCallback(() => {
    if (pendingFile && !disabled) {
      onFileSelect(pendingFile, selectedQuality);
      setPendingFile(null);
      setUserHasSelectedQuality(false);
    }
  }, [pendingFile, selectedQuality, onFileSelect, disabled]);

  const handleCancel = useCallback(() => {
    setPendingFile(null);
    setUserHasSelectedQuality(false);
  }, []);

  // If a file is pending, show quality selection
  if (pendingFile) {
    return (
      <div className="border-2 border-[#D4AF37] rounded-lg p-8 bg-white/5">
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 rounded-full bg-[#D4AF37]/20">
            <FileAudio className="w-12 h-12 text-[#D4AF37]" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {pendingFile.name}
            </h3>
            <p className="text-neutral-400 text-sm">
              {(pendingFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          {/* Quality Selection */}
          <div className="w-full max-w-md">
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Select Processing Quality
            </h4>
            <div className="space-y-2">
              {QUALITY_PRESETS.map((preset) => {
                const isRecommended = preset.level === recommendedQuality;
                const isSelected = preset.level === selectedQuality;

                return (
                  <button
                    key={preset.level}
                    onClick={() => {
                      setSelectedQuality(preset.level);
                      setUserHasSelectedQuality(true);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                        : 'border-neutral-700 hover:border-neutral-600 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white">
                          {preset.label}
                        </span>
                        {isRecommended && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]'
                            : 'border-neutral-500'
                        }`}
                      />
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Capabilities */}
          {capabilities && (
            <div className="w-full max-w-md px-4 py-3 rounded-lg bg-white/5 border border-neutral-700">
              <div className="flex items-center gap-2 text-sm">
                {capabilities.has_gpu ? (
                  <>
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">GPU Acceleration</span>
                    {capabilities.gpu_name && (
                      <span className="text-neutral-400">
                        ({capabilities.gpu_name})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">CPU Processing</span>
                    <span className="text-neutral-400">
                      (GPU not available)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-neutral-600 hover:border-neutral-500 text-neutral-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSeparation}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-black rounded-lg font-medium transition-colors"
            >
              Start Separation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 transition-all ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer'
      } ${
        isDragging
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

        {/* Hidden file input with ref */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <button
          onClick={handleBrowseClick}
          disabled={disabled}
          className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] disabled:bg-neutral-600 disabled:cursor-not-allowed text-black rounded-lg font-medium transition-colors"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};

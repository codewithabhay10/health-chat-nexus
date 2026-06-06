import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileImage } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 text-health-500 animate-spin" />
          <p className="text-gray-600">Processing your prescription...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <FileImage className="h-16 w-16 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload Prescription</h3>
            <p className="mt-1 text-sm text-gray-600">
              Drag and drop an image, or click to select
            </p>
          </div>
          <Button onClick={handleButtonClick} className="mt-2">
            <Upload className="h-4 w-4 mr-2" />
            Select Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
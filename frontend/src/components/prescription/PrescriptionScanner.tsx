import React, { useState, useEffect } from 'react';
import { UploadZone } from './UploadZone';
import { TextDisplay } from './TextDisplay';
import { OCRService, PrescriptionStorage } from "../../services/ocrService";
import { PrescriptionData } from '../../types/prescription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export const PrescriptionScanner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [isServiceOnline, setIsServiceOnline] = useState<boolean | null>(null);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = PrescriptionStorage.load();
    if (savedData) {
      setPrescriptionData(savedData);
    }
    
    // Check service health
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    const isOnline = await OCRService.checkHealth();
    setIsServiceOnline(isOnline);
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await OCRService.extractText(file);
      
      const newPrescriptionData: PrescriptionData = {
        text: result.extracted_text,
        filename: result.filename,
        timestamp: new Date().toISOString(),
        fileSize: result.file_size
      };

      // Save to session storage (overwrites previous)
      PrescriptionStorage.save({
        text: result.extracted_text,
        filename: result.filename,
        fileSize: result.file_size
      });

      setPrescriptionData(newPrescriptionData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrescriptionData(null);
    PrescriptionStorage.clear();
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Prescription Scanner
        </h1>
        <p className="text-gray-600">
          Upload a prescription image to extract text using AI
        </p>
      </div>

      {/* Service Status */}
      <div className="flex justify-center">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isServiceOnline === null 
            ? 'bg-gray-100 text-gray-600' 
            : isServiceOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
        }`}>
          {isServiceOnline === null ? (
            <Wifi className="h-4 w-4" />
          ) : isServiceOnline ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>
            {isServiceOnline === null 
              ? 'Checking service...' 
              : isServiceOnline 
                ? 'OCR Service Online' 
                : 'OCR Service Offline'
            }
          </span>
        </div>
      </div>

      {/* Service Offline Warning */}
      {isServiceOnline === false && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            The OCR service is currently offline.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Zone */}
      <UploadZone
        onFileSelect={handleFileSelect}
        isLoading={isLoading}
        error={error}
      />

      {/* Results */}
      {prescriptionData && (
        <TextDisplay
          text={prescriptionData.text}
          filename={prescriptionData.filename}
          timestamp={prescriptionData.timestamp}
          onClear={handleClear}
        />
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload a clear image of your prescription</li>
          <li>• Supported formats: PNG, JPG, JPEG (max 10MB)</li>
        </ul>
      </div>
    </div>
  );
};

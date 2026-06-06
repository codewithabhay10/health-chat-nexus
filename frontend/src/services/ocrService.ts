import { PrescriptionData, OCRResponse } from "../types/prescription";

export const OCRService = {
  // Check if the service is online
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('https://database-tval.onrender.com/health');
      return response.ok;
    } catch (error) {
      console.error('Service health check failed:', error);
      return false;
    }
  },

  // Extract text from an image
  async extractText(file: File): Promise<OCRResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://database-tval.onrender.com/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to extract text');
      }

      return {
        success: data.success,
        extracted_text: data.extracted_text,
        filename: file.name,
        file_size: (file.size / 1024).toFixed(2) + ' KB'
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw error;
    }
  }
};

export const PrescriptionStorage = {
  // Save prescription data to sessionStorage
  save(data: Partial<PrescriptionData>): void {
    try {
      const prescriptionData: PrescriptionData = {
        text: data.text || '',
        filename: data.filename || 'unknown.png',
        timestamp: new Date().toISOString(),
        fileSize: data.fileSize
      };
      sessionStorage.setItem('prescription_data', JSON.stringify(prescriptionData));
    } catch (error) {
      console.error('Failed to save prescription data:', error);
    }
  },

  // Load prescription data from sessionStorage
  load(): PrescriptionData | null {
    try {
      const data = sessionStorage.getItem('prescription_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load prescription data:', error);
      return null;
    }
  },

  // Clear prescription data from sessionStorage
  clear(): void {
    try {
      sessionStorage.removeItem('prescription_data');
    } catch (error) {
      console.error('Failed to clear prescription data:', error);
    }
  }
};

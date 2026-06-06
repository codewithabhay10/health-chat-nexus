export interface PrescriptionData {
  text: string;
  filename: string;
  timestamp: string;
  fileSize?: string;
}

export interface OCRResponse {
  success: boolean;
  extracted_text: string;
  filename: string;
  file_size: string;
}
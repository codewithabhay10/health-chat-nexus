import React from 'react';
import { PrescriptionScanner } from '../components/prescription/PrescriptionScanner';

export const PrescriptionScannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrescriptionScanner />
    </div>
  );
};

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Copy, Trash2, Calendar, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TextDisplayProps {
  text: string;
  filename: string;
  timestamp: string;
  onClear: () => void;
}

export const TextDisplay: React.FC<TextDisplayProps> = ({ text, filename, timestamp, onClear }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The prescription text has been copied to your clipboard."
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.split('.')[0]}_extracted.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Downloaded",
      description: "The prescription text has been downloaded as a text file."
    });
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <FileText className="h-5 w-5 mr-2 text-health-500" />
          Extracted Prescription Text
        </CardTitle>
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(timestamp).toLocaleString()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md mb-4 max-h-80 overflow-y-auto whitespace-pre-line">
          {text || "No text was extracted from the image."}
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Source:</strong> {filename}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={onClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
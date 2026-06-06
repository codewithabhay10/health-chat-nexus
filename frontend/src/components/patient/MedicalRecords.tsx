
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Eye, Calendar, Clock, Plus, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Prescriptions from "./Prescriptions";
import { useLanguage } from "@/context/LanguageContext";

interface Record {
  id: string;
  title: string;
  type: "lab" | "report" | "image" | "prescription";
  date: string;
  provider: string;
  fileSize: string;
  fileName: string;
}

const MedicalRecords = () => {
  const { toast } = useToast();
  const { translate } = useLanguage();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  
  // Form state for upload
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"lab" | "report" | "image" | "prescription">("report");
  const [uploadProvider, setUploadProvider] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Load records from localStorage on component mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('medicalRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    } else {
      // Sample data
      const sampleRecords: Record[] = [
        {
          id: "1",
          title: "Annual Physical Examination",
          type: "report",
          date: "2023-05-10",
          provider: "Dr. Sarah Johnson",
          fileSize: "2.4 MB",
          fileName: "physical_exam_2023.pdf"
        },
        {
          id: "2",
          title: "Blood Test Results",
          type: "lab",
          date: "2023-04-28",
          provider: "Memorial Hospital Lab",
          fileSize: "1.8 MB",
          fileName: "blood_test_apr2023.pdf"
        },
        {
          id: "3",
          title: "Chest X-Ray",
          type: "image",
          date: "2023-03-15",
          provider: "Radiology Center",
          fileSize: "5.2 MB",
          fileName: "chest_xray_mar2023.jpg"
        }
      ];
      
      setRecords(sampleRecords);
      localStorage.setItem('medicalRecords', JSON.stringify(sampleRecords));
    }
  }, []);
  
  // Save records to localStorage whenever they change
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('medicalRecords', JSON.stringify(records));
    }
  }, [records]);
  
  const handleViewDetails = (record: Record) => {
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  };
  
  const handleDownload = (record: Record) => {
    toast({
      title: translate("download"),
      description: `${record.fileName} ${translate("has been downloaded")}.`,
    });
  };
  
  const handleOpenUploadDialog = () => {
    setShowUploadDialog(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!uploadTitle || !uploadType || !uploadProvider || !uploadFile) {
      toast({
        title: translate("incompleteInformation"),
        description: translate("fillAllFields"),
        variant: "destructive"
      });
      return;
    }
    
    // Create new record
    const newRecord: Record = {
      id: Date.now().toString(),
      title: uploadTitle,
      type: uploadType,
      date: new Date().toISOString().split('T')[0],
      provider: uploadProvider,
      fileSize: formatFileSize(uploadFile.size),
      fileName: uploadFile.name
    };
    
    // Add to records
    setRecords(prev => [newRecord, ...prev]);
    
    toast({
      title: translate("recordUploaded"),
      description: `${uploadTitle} ${translate("addedToRecords")}`,
    });
    
    // Reset form
    setUploadTitle("");
    setUploadType("report");
    setUploadProvider("");
    setUploadFile(null);
    setShowUploadDialog(false);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{translate("yourHealthRecords")}</h2>
            <p className="text-gray-500">{translate("accessManageDocuments")}</p>
          </div>
          
          <TabsList>
            <TabsTrigger value="records">{translate("records")}</TabsTrigger>
            <TabsTrigger value="prescriptions">{translate("prescriptions")}</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="records">
          <div className="flex justify-end mb-4">
            <Button onClick={handleOpenUploadDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {translate("uploadRecord")}
            </Button>
          </div>
          
          {records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <FileText className="h-6 w-6 text-health-600" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold">{record.title}</h3>
                          <p className="text-sm text-gray-500">{record.provider}</p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{record.date}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
                                {record.type === "lab" ? translate("labReport") : 
                                 record.type === "report" ? translate("medicalReport") : 
                                 record.type === "image" ? translate("medicalImage") : 
                                 translate("prescription")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {translate("view")}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleDownload(record)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {translate("download")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">{translate("noRecordsFound")}</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={handleOpenUploadDialog}
              >
                <Upload className="h-4 w-4 mr-2" />
                {translate("uploadYourFirst")}
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <Prescriptions />
        </TabsContent>
      </Tabs>
      
      {/* Record Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("recordDetails")}</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-health-600" />
                <h3 className="text-lg font-semibold">{selectedRecord.title}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{translate("recordType")}</p>
                  <p className="font-medium">
                    {selectedRecord.type === "lab" ? translate("labReport") : 
                     selectedRecord.type === "report" ? translate("medicalReport") : 
                     selectedRecord.type === "image" ? translate("medicalImage") : 
                     translate("prescription")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{translate("recordDate")}</p>
                  <p className="font-medium">{selectedRecord.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{translate("healthcareProvider")}</p>
                  <p className="font-medium">{selectedRecord.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{translate("fileSize")}</p>
                  <p className="font-medium">{selectedRecord.fileSize}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{translate("fileName")}</p>
                  <p className="font-medium">{selectedRecord.fileName}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <p className="text-gray-500 mb-2">{translate("previewNotAvailable")}</p>
                <Button onClick={() => handleDownload(selectedRecord)}>
                  <Download className="h-4 w-4 mr-1" />
                  {translate("downloadToView")}
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              {translate("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("uploadRecord")}</DialogTitle>
            <DialogDescription>
              {translate("addedToRecords")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">{translate("recordTitle")}</Label>
              <Input 
                id="title" 
                value={uploadTitle} 
                onChange={(e) => setUploadTitle(e.target.value)} 
                placeholder="e.g., Blood Test Results"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">{translate("recordType")}</Label>
              <select 
                id="type" 
                className="w-full p-2 border rounded-md"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as any)}
              >
                <option value="lab">{translate("labReport")}</option>
                <option value="report">{translate("medicalReport")}</option>
                <option value="image">{translate("medicalImage")}</option>
                <option value="prescription">{translate("prescription")}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">{translate("healthcareProvider")}</Label>
              <Input 
                id="provider" 
                value={uploadProvider} 
                onChange={(e) => setUploadProvider(e.target.value)} 
                placeholder="e.g., Memorial Hospital"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">{translate("selectFile")}</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                
                <div className="flex items-center justify-center">
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer bg-health-50 text-health-600 px-4 py-2 rounded-md hover:bg-health-100"
                  >
                    {translate("selectFile")}
                  </label>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                
                {uploadFile ? (
                  <p className="mt-2 text-sm text-gray-500">
                    {translate("selectedFile")}: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    {translate("supportedFormats")}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
            >
              {translate("cancel")}
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!uploadTitle || !uploadType || !uploadProvider || !uploadFile}
            >
              {translate("uploadRecord")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecords;

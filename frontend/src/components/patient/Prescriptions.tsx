import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Calendar, Clock, Download, Plus, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import ApiService from "@/services/api";
import { Loader2 } from "lucide-react";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  medications: Medication[];
  instructions: string;
  doctor: string;
  doctorId: string;
  date: string;
  appointmentId: string;
}

const Prescriptions = () => {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real prescription data
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getPatientAppointments();
        
        if (response.success && response.appointments) {
          // Filter appointments with prescriptions
          const appointmentsWithPrescriptions = response.appointments.filter(
            apt => apt.prescription && apt.prescription.medications && apt.prescription.medications.length > 0
          );
          
          // Map to our prescription format
          const prescriptionsData = appointmentsWithPrescriptions.map(apt => ({
            id: apt._id,
            medications: apt.prescription.medications,
            instructions: apt.prescription.instructions || '',
            doctor: apt.doctorId.name,
            doctorId: apt.doctorId._id,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            appointmentId: apt._id
          }));
          
          setPrescriptions(prescriptionsData);
        }
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load your prescriptions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [toast]);
  
  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsDialog(true);
  };
  
  const handleDownload = (prescription: Prescription) => {
    // Generate a simple text prescription for download
    const text = `
      PRESCRIPTION
      
      Date: ${prescription.date}
      Doctor: ${prescription.doctor}
      
      Medications:
      ${prescription.medications.map(med => 
        `- ${med.name} ${med.dosage}
         Take: ${med.frequency}
         Duration: ${med.duration}`
      ).join('\n\n')}
      
      Instructions: ${prescription.instructions}
    `;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${prescription.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Prescription Downloaded",
      description: "Your prescription has been downloaded as a text file.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Prescriptions</h2>
          <p className="text-gray-500">View your medication history and details</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-health-600" />
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-health-600" />
                    {prescription.medications[0].name}
                  </CardTitle>
                </div>
                <CardDescription>{prescription.medications[0].dosage}, {prescription.medications[0].frequency}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prescribed by:</span>
                    <span>{prescription.doctor}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2">{prescription.date}</span>
                  </div>
                  {prescription.medications.length > 1 && (
                    <div className="text-sm text-gray-500 mt-2">
                      + {prescription.medications.length - 1} more medication(s)
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewDetails(prescription)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownload(prescription)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <Pill className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">No prescriptions found</p>
        </div>
      )}
      
      {/* Prescription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-2">Medications</h3>
                <div className="space-y-4">
                  {selectedPrescription.medications.map((med, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="h-4 w-4 text-health-600" />
                        <h4 className="font-medium">{med.name} {med.dosage}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Frequency</p>
                          <p>{med.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p>{med.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4 border rounded-md p-3">
                  <div>
                    <p className="text-sm text-gray-500">Prescribed By</p>
                    <p className="font-medium">{selectedPrescription.doctor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prescribed Date</p>
                    <p className="font-medium">{selectedPrescription.date}</p>
                  </div>
                </div>
              </div>
              
              {selectedPrescription.instructions && (
                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <div className="border rounded-md p-3">
                    <p>{selectedPrescription.instructions}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => selectedPrescription && handleDownload(selectedPrescription)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prescriptions;
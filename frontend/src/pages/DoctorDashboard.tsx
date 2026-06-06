import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  BarChart, 
  Settings, 
  MessageSquare, 
  LogOut,
  Bell,
  Video,
  Upload,
  FileText,
  AlertTriangle,
  Stethoscope,
  X,
  Plus
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import DoctorProfile from "@/components/doctor/DoctorProfile";
import ApiService from "../services/api.js";
import { useLanguage } from "@/context/LanguageContext";
//import multilingualTranslate from "../utils/translation.ts";

 const name = localStorage.getItem("userName");

const DoctorDashboard = () => {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patients");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<File | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    patientName: "",
    date: "",
    time: "",
    type: "Video",
  });
  // Replace your mock data with these state variables
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState({
    name: "",
    specialization: "",
    totalPatients: 0
  });
  const [consultations, setConsultations] = useState([]);

  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [showAppointmentSelectionDialog, setShowAppointmentSelectionDialog] = useState(false);
  const [selectedPatientFilter, setSelectedPatientFilter] = useState('all');

  // Add this useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch doctor profile
        const profileResponse = await ApiService.getDoctorProfile();
        if (profileResponse.success && profileResponse.doctor) {
          setDoctorProfile({
            name: profileResponse.doctor.name,
            specialization: profileResponse.doctor.specialization,
            totalPatients: profileResponse.doctor.totalPatients || 0
          });
        }
        
        // 2. Fetch appointments
        const appointmentsResponse = await ApiService.getDoctorAppointments();
        if (appointmentsResponse.success && appointmentsResponse.appointments) {
          
          setAppointments(appointmentsResponse.appointments.map(apt => ({
            id: apt._id,
            patient: apt.patientId.name,
            time: apt.timeSlot,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            type: apt.consultationType || "Video",
            status: apt.status,
            patientId: apt.patientId._id,
            symptoms: apt.symptoms || "",
            prescription: apt.prescription,
            roomId: apt.roomId
          })));

          // Add this line to set consultations based on appointments
          setConsultations(appointmentsResponse.appointments.map(apt => ({
            id: apt._id,
            patient: apt.patientId.name,
            time: apt.timeSlot,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            type: apt.consultationType || "Video",
            status: apt.status
          })));
          
          // 3. Extract unique patients from appointments
          const uniquePatients = [...new Map(
            appointmentsResponse.appointments.map(apt => [
              apt.patientId._id, 
              {
                id: apt.patientId._id,
                name: apt.patientId.name,
                age: apt.patientId.age || 30,
                gender: apt.patientId.gender || "Unknown",
                symptoms: apt.symptoms ? [apt.symptoms] : ["Consultation"],
                status: apt.status,
                lastVisit: new Date(apt.appointmentDate).toLocaleDateString(),
                nextAppointment: `${new Date(apt.appointmentDate).toLocaleDateString()}, ${apt.timeSlot}`,
                image: apt.patientId.profileImage || "/placeholder.svg"
              }
            ])
          ).values()];
          
          setPatients(uniquePatients);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorData();
  }, []);

  const handleLogout = async () => {
  try {
    const response = await ApiService.logout();
    
    if (response.success) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      
      toast({
        title: translate("logout"),
        description: translate("You have been successfully logged out.")
      });
      
      navigate("/");
    } else {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    toast({
      title: translate("logoutFailed"),
      description: translate("There was a problem logging out. Please try again."),
      variant: "destructive"
    });
  }
};

  // Update the handleStartConsultation function
const handleStartConsultation = async (consultationId: string) => {
  const response = await ApiService.getAppointment(consultationId);
  if (response && response.appointment && response.appointment.roomId) {
    toast({
      title: "Starting consultation",
      description: "Connecting to video call...",
    });
    // Use roomId and pass from=doctor
    console.log(response.appointment.roomId);
    navigate(`/video-conference/${consultationId}&from=doctor`);
  } else {
    toast({
      title: "Error",
      description: "Consultation or room ID not found",
      variant: "destructive"
    });
  }
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionImage(e.target.files[0]);
    }
  };


  const handleScheduleNew = () => {
    setShowNewAppointmentDialog(true);
  };

  const handleAppointmentSubmit = () => {
    if (!appointmentData.patientName || !appointmentData.date || !appointmentData.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Appointment scheduled",
      description: `New appointment with ${appointmentData.patientName} has been scheduled.`
    });

    setShowNewAppointmentDialog(false);
    setAppointmentData({
      patientName: "",
      date: "",
      time: "",
      type: "Video",
    });
  };

  // Add these handler functions
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  // Update your handleUploadPrescription function
  const handleUploadPrescription = (patientId: string, appointmentId: string) => {
    setCurrentPatientId(patientId);
    setCurrentAppointmentId(appointmentId);
    setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setPrescriptionInstructions('');
    setShowPrescriptionDialog(true);
  };

  // Update the handlePrescriptionSubmit function to refresh data after success

  const handlePrescriptionSubmit = async () => {
    if (!currentAppointmentId) {
      toast({
        title: "No appointment selected",
        description: "Please select a valid appointment to add a prescription",
        variant: "destructive"
      });
      return;
    }

    if (medications.some(med => !med.name || !med.dosage)) {
      toast({
        title: "Missing information",
        description: "Please fill in at least medication name and dosage.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prescriptionData = {
        medications: medications,
        instructions: prescriptionInstructions
      };
      
      await ApiService.addPrescription(currentAppointmentId!, prescriptionData);
      
      // Refresh appointments data to show the new prescription
      const appointmentsResponse = await ApiService.getDoctorAppointments();
      if (appointmentsResponse.success && appointmentsResponse.appointments) {
        setAppointments(appointmentsResponse.appointments.map(apt => ({
          id: apt._id,
          patient: apt.patientId.name,
          time: apt.timeSlot,
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          type: apt.consultationType || "Video",
          status: apt.status,
          patientId: apt.patientId._id,
          symptoms: apt.symptoms || "",
          prescription: apt.prescription // Make sure this is included
        })));
      }
      
      toast({
        title: "Prescription added",
        description: "The prescription has been added to the patient's record."
      });
      
      setShowPrescriptionDialog(false);
      setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setPrescriptionInstructions('');
      setCurrentAppointmentId(null);
      setCurrentPatientId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add prescription. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-health-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dr. {name}</h1>
              <p className="text-sm text-gray-500">General Physician • IMA Certified</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-2">
                <AvatarImage src="/placeholder.svg" alt="Doctor" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Dr. {name}</p>
                <p className="text-xs text-gray-500">IMA #MH12345</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b mb-6">
            <TabsList className="overflow-x-auto">
              <TabsTrigger value="dashboard">
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="patients">
                <Users className="h-4 w-4 mr-2" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="consultations">
                <Video className="h-4 w-4 mr-2" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="prescriptions">
                <FileText className="h-4 w-4 mr-2" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{doctorProfile.totalPatients || patients.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {appointments.filter(apt => 
                      new Date(apt.date).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Next Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <>
                      <p className="text-xl font-medium">
                        {appointments
                          .filter(apt => new Date(apt.date) >= new Date())
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.time || "No upcoming"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointments
                          .filter(apt => new Date(apt.date) >= new Date())
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.patient || "appointments"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-medium">No upcoming</p>
                      <p className="text-sm text-gray-500">appointments</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
                <Card className="w-full">
                <CardHeader>
                  <CardTitle>Upcoming Consultations</CardTitle>
                  <CardDescription>Scheduled for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultations
                      .filter(consultation => {
                        // Parse consultation date and time
                        const [aptHour, aptMinute] = consultation.time.split(':');
                        const aptDate = new Date(consultation.date);
                        aptDate.setHours(parseInt(aptHour), parseInt(aptMinute.split('-')[0]), 0);
                        
                        // Only show future consultations
                        return aptDate > new Date() && consultation.status !== 'cancelled';
                      })
                      .slice(0, 3)
                      .map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src="/placeholder.svg" alt={consultation.patient} />
                              <AvatarFallback>{consultation.patient.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{consultation.patient}</p>
                              <div className="flex text-sm text-gray-500">
                                <span className="mr-3">{consultation.time}</span>
                                <span className="flex items-center">
                                  {consultation.type === "Video" ? 
                                    <Video className="h-3 w-3 mr-1" /> : 
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                  }
                                  {consultation.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartConsultation(consultation.id)}
                          >
                            Join
                          </Button>
                        </div>
                      ))}
                      
                    {consultations.filter(c => {
                      const [aptHour, aptMinute] = c.time.split(':');
                      const aptDate = new Date(c.date);
                      aptDate.setHours(parseInt(aptHour), parseInt(aptMinute.split('-')[0]), 0);
                      return aptDate > new Date();
                    }).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No upcoming consultations</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("consultations")}>
                    View All Consultations
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Patient Management</h2>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search patients..." 
                  className="w-64"
                />
                <Button>
                  Filter
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-health-600" />
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-10 border rounded-lg">
                <p className="text-gray-500">No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patients.map((patient) => (
                  <Card key={patient.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex p-4">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={patient.image} alt={patient.name} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{patient.name}</h3>
                              <p className="text-gray-500 text-sm">
                                {patient.age} years • {patient.gender} • Last visit: {patient.lastVisit}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${patient.status === "urgent" ? "bg-red-100 text-red-800" : 
                              patient.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                              patient.status === "completed" ? "bg-green-100 text-green-800" :
                              "bg-blue-100 text-blue-800"}`}>
                              {patient.status}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm font-medium">Symptoms:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.symptoms.map((symptom, index) => (
                                <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t bg-gray-50 p-3 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium">Next Appointment:</span> {patient.nextAppointment}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Find the latest appointment for this patient
                              const patientAppointment = appointments.find(apt => 
                                apt.patientId === patient.id && 
                                (apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'completed')
                              );
                              
                              if (patientAppointment) {
                                handleUploadPrescription(patient.id, patientAppointment.id);
                              } else {
                                toast({
                                  title: "No active appointment",
                                  description: "Cannot add prescription without an active appointment",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Prescription
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleStartConsultation(patient.id)}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Consult
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="consultations" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Upcoming Consultations</h2>
                <Button onClick={handleScheduleNew}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-health-600" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-gray-500">No consultations scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments
                      .filter(apt => {
                        // First filter for status
                        const statusOk = apt.status === 'scheduled' || apt.status === 'confirmed';
                        
                        // Then filter for future date/time
                        const [aptHour, aptMinute] = apt.time.split(':');
                        const aptDate = new Date(apt.date);
                        aptDate.setHours(parseInt(aptHour), parseInt(aptMinute.split('-')[0]), 0);
                        
                        // Return true only if both conditions are met
                        return statusOk && aptDate > new Date();
                      })
                      .map((consultation) => (
                        <Card key={consultation.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{consultation.patient}</CardTitle>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${consultation.type === "Video" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                              {consultation.type}
                            </span>
                          </div>
                          <CardDescription>{consultation.date}, {consultation.time}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm">{consultation.symptoms || "General consultation"}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            onClick={() => handleUploadPrescription(consultation.patientId, consultation.id)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Prescription
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => handleStartConsultation(consultation.id)}
                          >
                            {consultation.type === "Video" ? (
                              <><Video className="h-4 w-4 mr-1" /> Join</>
                            ) : (
                              <><MessageSquare className="h-4 w-4 mr-1" /> Call</>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="prescriptions" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Prescriptions History</h2>
                  <p className="text-gray-500">View and manage all patient prescriptions</p>
                </div>
                
                <Button onClick={() => {
                  // Instead of automatically finding an appointment, show a selection dialog
                  setShowAppointmentSelectionDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Search prescriptions..." 
                  className="max-w-sm"
                />
                <select 
                  className="border rounded-md px-3 py-1 text-sm"
                  value={selectedPatientFilter}
                  onChange={(e) => setSelectedPatientFilter(e.target.value)}
                >
                  <option value="all">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">                  

                    {appointments
                      .filter(apt => 
                        // Only show prescriptions that exist
                        (apt.prescription && apt.prescription.medications && apt.prescription.medications.length > 0) &&
                        // Filter by selected patient if one is selected
                        (selectedPatientFilter === 'all' || apt.patientId === selectedPatientFilter)
                      )
                      .map((apt) => (
                        <tr key={apt.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg" alt={apt.patient} />
                                  <AvatarFallback>{apt.patient.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{apt.patient}</div>
                                <div className="text-sm text-gray-500">{apt.date}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {apt.prescription?.medications.map((med, i) => (
                              <div key={i} className="mb-1">
                                {med.name} {med.dosage}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              className="text-health-600 hover:text-health-900"
                              onClick={() => {
                                setCurrentPatientId(apt.patientId);
                                setCurrentAppointmentId(apt.id);
                                // Load existing prescription data
                                if (apt.prescription) {
                                  setMedications(apt.prescription.medications);
                                  setPrescriptionInstructions(apt.prescription.instructions || '');
                                }
                                setShowPrescriptionDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                      
                    {appointments.filter(apt => apt.prescription && apt.prescription.medications && apt.prescription.medications.length > 0).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          No prescriptions found. Create a new prescription to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Completed Appointments Without Prescriptions</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments
                      .filter(apt => 
                        apt.status === 'completed' && 
                        (!apt.prescription || !apt.prescription.medications || apt.prescription.medications.length === 0)
                      )
                      .map((apt) => (
                        <tr key={apt.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg" alt={apt.patient} />
                                  <AvatarFallback>{apt.patient.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{apt.patient}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentPatientId(apt.patientId);
                                setCurrentAppointmentId(apt.id);
                                setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
                                setPrescriptionInstructions('');
                                setShowPrescriptionDialog(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Add Prescription
                            </Button>
                          </td>
                        </tr>
                      ))}
                      
                    {appointments.filter(apt => 
                      apt.status === 'completed' && 
                      (!apt.prescription || !apt.prescription.medications || apt.prescription.medications.length === 0)
                    ).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                          No completed appointments without prescriptions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Appointments Management</h2>
                <Button onClick={handleScheduleNew}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-health-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Today</CardTitle>
                      <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointments
                        .filter(apt => {
                          // Parse appointment date and time
                          const [aptHour, aptMinute] = apt.time.split(':');
                          const aptDate = new Date(apt.date);
                          aptDate.setHours(parseInt(aptHour), parseInt(aptMinute.split('-')[0]), 0);
                          
                          // Get current date/time
                          const now = new Date();
                          
                          // Check if date is today AND time is in the future
                          return aptDate.toDateString() === now.toDateString() && 
                                aptDate > now && 
                                apt.status !== 'cancelled';
                        })
                        .map((appointment) => (
                          <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                            <div>
                              <p className="font-medium">{appointment.patient}</p>
                              <div className="text-sm text-gray-600">{appointment.time}</div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleStartConsultation(appointment.id)}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      
                      {appointments.filter(apt => new Date(apt.date).toDateString() === new Date().toDateString()).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p>No appointments today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tomorrow</CardTitle>
                      <CardDescription>{new Date(Date.now() + 86400000).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointments
                        .filter(apt => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return new Date(apt.date).toDateString() === tomorrow.toDateString() && 
                                  apt.status !== 'cancelled';
                        })
                        .map((appointment) => (
                          <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="font-medium">{appointment.patient}</p>
                              <div className="text-sm text-gray-600">{appointment.time}</div>
                            </div>
                            <Button size="sm" variant="ghost">View</Button>
                          </div>
                        ))}
                        
                      {appointments.filter(apt => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return new Date(apt.date).toDateString() === tomorrow.toDateString();
                      }).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p>No appointments tomorrow</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Week</CardTitle>
                      <CardDescription>Next 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointments
                        .filter(apt => {
                          const appointmentDate = new Date(apt.date);
                          const today = new Date();
                          const nextWeek = new Date();
                          nextWeek.setDate(today.getDate() + 7);
                          return appointmentDate > today && 
                                  appointmentDate <= nextWeek && 
                                  apt.status !== 'cancelled';
                        })
                        .map((appointment) => (
                          <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition-colors">
                            <div>
                              <p className="font-medium">{appointment.patient}</p>
                              <div className="text-sm text-gray-600">{appointment.date}, {appointment.time}</div>
                            </div>
                            <Button size="sm" variant="ghost">View</Button>
                          </div>
                        ))}
                        
                      {appointments.filter(apt => {
                        const appointmentDate = new Date(apt.date);
                        const today = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(today.getDate() + 7);
                        return appointmentDate > today && appointmentDate <= nextWeek;
                      }).length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <p>No upcoming appointments</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Patient Messages</h2>
              <p className="text-gray-500">Secure messaging with patients would go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <DoctorProfile />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Prescription Upload Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogDescription>
              {currentAppointmentId && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium">
                    {appointments.find(apt => apt.id === currentAppointmentId)?.patient}
                  </div>
                  <div className="text-xs text-gray-500">
                    {appointments.find(apt => apt.id === currentAppointmentId)?.date}, 
                    {appointments.find(apt => apt.id === currentAppointmentId)?.time}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {medications.map((medication, index) => (
              <div key={index} className="space-y-2 border-b pb-4">
                <div className="flex justify-between">
                  <h4 className="font-medium">Medication {index + 1}</h4>
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input 
                      value={medication.name} 
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="Medicine name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dosage</label>
                    <Input 
                      value={medication.dosage} 
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Frequency</label>
                    <Input 
                      value={medication.frequency} 
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Input 
                      value={medication.duration} 
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={addMedication}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </Button>
            
            <div className="grid w-full gap-1.5">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </label>
              <textarea 
                id="instructions" 
                rows={3} 
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Add instructions for the patient..."
                value={prescriptionInstructions}
                onChange={(e) => setPrescriptionInstructions(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handlePrescriptionSubmit}>Save Prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="patientName" className="text-sm font-medium">
                Patient Name
              </label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={appointmentData.patientName}
                onChange={(e) => setAppointmentData({...appointmentData, patientName: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="appointmentDate" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="appointmentDate"
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="appointmentTime" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="appointmentTime"
                type="time"
                value={appointmentData.time}
                onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="appointmentType" className="text-sm font-medium">
                Appointment Type
              </label>
              <select
                id="appointmentType"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                value={appointmentData.type}
                onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value})}
              >
                <option value="Video">Video Consultation</option>
                <option value="Audio">Audio Call</option>
                <option value="In-Person">In-Person Visit</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleAppointmentSubmit}>Schedule Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* New Appointment Selection Dialog */}
      <Dialog open={showAppointmentSelectionDialog} onOpenChange={setShowAppointmentSelectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Appointment</DialogTitle>
            <DialogDescription>
              Choose an appointment to create a prescription for.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="max-h-[60vh] overflow-y-auto border rounded-md">
              {appointments
                .filter(apt => 
                  apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'completed'
                )
                .length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No eligible appointments found
                  </div>
                ) : (
                  <div className="divide-y">
                    {appointments
                      .filter(apt => 
                        apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'completed'
                      )
                      .map(apt => (
                        <div 
                          key={apt.id} 
                          className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setCurrentPatientId(apt.patientId);
                            setCurrentAppointmentId(apt.id);
                            setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
                            setPrescriptionInstructions('');
                            setShowAppointmentSelectionDialog(false);
                            setShowPrescriptionDialog(true);
                          }}
                        >
                          <div>
                            <h4 className="font-medium">{apt.patient}</h4>
                            <div className="text-sm text-gray-500">
                              {apt.date}, {apt.time}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                            ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentSelectionDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
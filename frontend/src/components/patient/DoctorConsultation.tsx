//import ZegoVideoConference from "@/pages/VideoConference";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Video, Phone, UserCircle, Search, Star, Check, Clock4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ApiService from '../../services/api.js'

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  language: string[];
  experience: number;
  rating: number;
  availability: string[];
  photo: string;
  price: number;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "canceled";
  photo: string;
}

// Define specialties based on the Doctor model
const specialties = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Dentistry',
  'Emergency Medicine'
];

const API_BASE = "https://backendnode-j51t.onrender.com/api";

const DoctorConsultation = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const navigate = useNavigate();
  // Add this after your state declarations (around line 63)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Add this with your other state variables
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow by default
  );


  // Load appointments from localStorage on component mount
  useEffect(() => {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
      
      // Find active appointment
      const active = JSON.parse(savedAppointments).find(
        (apt: Appointment) => apt.status === 'scheduled'
      );
      if (active) {
        setCurrentAppointment(active);
        setBookingComplete(true);
      }
    }
  }, []);

  // Update the saveAppointment function
  async function saveAppointment(appointment: Appointment) {
    try {
      // First save to the Node.js backend
      const nodeResponse = await fetch("https://backendnode-j51t.onrender.com/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctorId: appointment.doctorId,
          appointmentDate: appointment.date,
          timeSlot: appointment.time,
          status: "scheduled"
        }),
      });
      
      if (!nodeResponse.ok) {
        throw new Error('Failed to book appointment');
      }
      
      const nodeData = await nodeResponse.json();
      
      // Then save to the Python backend for any ML processing needs
      const pythonResponse = await fetch("https://database-tval.onrender.com/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...appointment,
          id: nodeData.appointmentId || appointment.id,
        }),
      });
      
      const pythonData = await pythonResponse.json();
      
      return {
        ...nodeData,
        ...pythonData
      };
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw error;
    }
  }

  // Replace the useEffect block for fetching doctors with this:
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all doctors
        const response = await ApiService.getAllDoctors();
        
        if (response.success && response.doctors) {
          setDoctors(response.doctors.map(doctor => ({
            id: doctor._id,
            name: doctor.name,
            specialty: doctor.specialization,
            language: doctor.languages || ["English"],
            experience: doctor.experience || 0,
            rating: doctor.rating || 4.5,
            availability: doctor.availability?.timeSlots || [],
            photo: doctor.profileImage || "/placeholder.svg",
            price: doctor.consultationFee || 100
          })));
        }
        
        // Fetch patient's appointments
        const appointmentsResponse = await ApiService.getPatientAppointments();
        
        if (appointmentsResponse.success && appointmentsResponse.appointments) {
          const formattedAppointments = appointmentsResponse.appointments.map(apt => ({
            id: apt._id,
            doctorId: apt.doctorId._id,
            doctorName: apt.doctorId.name,
            specialty: apt.doctorId.specialization,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            time: apt.timeSlot,
            status: apt.status,
            photo: apt.doctorId.profileImage || "/placeholder.svg"
          }));
          
          setAppointments(formattedAppointments);
          
          // Set current appointment if there's an active one
          const active = formattedAppointments.find(apt => 
            apt.status === 'scheduled' || apt.status === 'confirmed'
          );
          
          if (active) {
            setCurrentAppointment(active);
            setBookingComplete(true);
          }
        }
      } catch (error) {
        console.error("Error fetching doctors or appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load doctors or appointments",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);


  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setAppointmentTime(time);
  };

  const handleBookAppointment = () => {
    if (selectedDoctor && appointmentTime) {
      setShowDialog(true);
    }
  };

  // Replace the confirmBooking function with this:
  const confirmBooking = async () => {
    if (selectedDoctor && appointmentTime) {
      try {
        setIsLoading(true);
        
        // Format the date as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        const response = await ApiService.createAppointment({
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate, // Use selected date instead of today
          timeSlot: appointmentTime,
          consultationType: 'video',
          symptoms: ""
        });
        
        if (response.success && response.appointment) {
          // Format the new appointment for the UI
          const newAppointment = {
            id: response.appointment._id,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            date: new Date(response.appointment.appointmentDate).toLocaleDateString(),
            time: appointmentTime,
            status: response.appointment.status,
            photo: selectedDoctor.photo
          };
          
          setAppointments(prev => [...prev, newAppointment]);
          setCurrentAppointment(newAppointment);
          setBookingComplete(true);
          setShowDialog(false);
          
          toast({
            title: "Appointment Booked",
            description: `Your appointment with ${selectedDoctor.name} at ${appointmentTime} has been confirmed.`,
          });
        } else {
          throw new Error(response.message || "Failed to book appointment");
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
        toast({
          title: "Booking Failed",
          description: error instanceof Error ? error.message : "Failed to book appointment",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelAppointment = () => {
    setShowCancelDialog(true);
  };

  async function cancelAppointment(appointmentId: string) {
    const response = await fetch(`https://backendnode-j51t.onrender.com/meeting/${appointmentId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  }

  const confirmCancelAppointment = () => {
    if (currentAppointment) {
      // Update the appointment status to canceled
      cancelAppointment(currentAppointment.id);
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === currentAppointment.id 
            ? {...apt, status: 'canceled' as const} 
            : apt
        )
      );
      
      // Reset the current view
      setCurrentAppointment(null);
      setBookingComplete(false);
      setShowCancelDialog(false);
      
      toast({
        title: "Appointment Canceled",
        description: "Your appointment has been successfully canceled.",
      });
    }
  };


  // Reschedule appointment using backendNode API
  const confirmRescheduleAppointment = async () => {
    if (currentAppointment && newAppointmentTime) {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/appointments/${currentAppointment.id}/reschedule`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeSlot: newAppointmentTime }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to reschedule appointment");
        }
        const updatedAppointment = {
          ...currentAppointment,
          time: newAppointmentTime
        };
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === currentAppointment.id 
              ? updatedAppointment
              : apt
          )
        );
        setCurrentAppointment(updatedAppointment);
        setShowRescheduleDialog(false);
        setNewAppointmentTime(null);
        toast({
          title: "Appointment Rescheduled",
          description: `Your appointment has been rescheduled to ${newAppointmentTime}.`,
        });
      } catch (error: any) {
        toast({
          title: "Reschedule Failed",
          description: error.message || "Failed to reschedule appointment",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRescheduleAppointment = () => {
    setShowRescheduleDialog(true);
  };
              
  // Update the startConsultation function
  const startConsultation = () => {
    if (currentAppointment) {
      toast({
        title: "Joining Consultation",
        description: "Connecting to your doctor...",
      });
      
      // Navigate to the video conference with the appointment ID
      navigate(`/video-conference/${currentAppointment.id}&from=patient` );
    }
  };

  // Add this computed property before the return statement (around line 339)
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === "" || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSpecialty = selectedSpecialty === null || 
      doctor.specialty === selectedSpecialty;
      
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video/Audio Consultations</h2>
          <p className="text-gray-500">Connect with healthcare providers remotely</p>
        </div>
        
        {bookingComplete && (
          <Button onClick={startConsultation} className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Join Consultation
          </Button>
        )}
      </div>
      
      {bookingComplete && currentAppointment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Upcoming Consultation
            </CardTitle>
            <CardDescription>Your scheduled appointment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <img src={currentAppointment.photo} alt={currentAppointment.doctorName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{currentAppointment.doctorName}</h3>
                <p className="text-gray-500">{currentAppointment.specialty}</p>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{currentAppointment.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{currentAppointment.time}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Clock4 className="h-3 w-3 mr-1" />
                  Starts in 15 minutes
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="sm:flex-1" onClick={handleRescheduleAppointment}>Reschedule</Button>
            <Button variant="destructive" className="sm:flex-1" onClick={handleCancelAppointment}>Cancel Appointment</Button>
            <Button className="sm:flex-1" onClick={startConsultation}>
              <Video className="h-4 w-4 mr-2" />
              Join Now
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="find">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find">Find Doctors</TabsTrigger>
            <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
          </TabsList>
          
          <TabsContent value="find" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors by name or specialty..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-shrink-0 w-full md:w-auto">
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={selectedSpecialty || ""}
                  onChange={(e) => setSelectedSpecialty(e.target.value || null)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className={`cursor-pointer transition-all ${selectedDoctor?.id === doctor.id ? 'ring-2 ring-health-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                          <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="flex-grow space-y-2">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{doctor.name}</h3>
                            <p className="text-health-600">{doctor.specialty}</p>
                          </div>
                          <div className="flex items-center mt-2 md:mt-0">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {doctor.experience} years exp.
                          </span>
                          {doctor.language.map((lang) => (
                            <span key={lang} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm text-gray-500 mb-2">Available today:</p>
                          <div className="flex flex-wrap gap-2">
                            {doctor.availability.map((time) => (
                              <Button
                                key={time}
                                variant={appointmentTime === time && selectedDoctor?.id === doctor.id ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  handleDoctorSelect(doctor);
                                  handleTimeSelect(time);
                                }}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50 px-6 py-3">
                    <div>
                      <span className="font-semibold text-health-700">${doctor.price}</span>
                      <span className="text-sm text-gray-500"> per consultation</span>
                    </div>
                    <Button 
                      onClick={() => handleDoctorSelect(doctor)}
                      variant={selectedDoctor?.id === doctor.id ? "default" : "outline"}
                    >
                      {selectedDoctor?.id === doctor.id ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredDoctors.length === 0 && (
                <div className="text-center p-8 border rounded-lg">
                  <UserCircle className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-gray-500">No doctors found matching your criteria</p>
                </div>
              )}
            </div>
            
            {selectedDoctor && appointmentTime && (
              <div className="sticky bottom-0 bg-white p-4 border-t mt-6 -mx-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">Selected: {selectedDoctor.name}</p>
                    <p className="text-sm text-gray-500">Today at {appointmentTime}</p>
                  </div>
                  <Button onClick={handleBookAppointment}>Book Appointment</Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500 mb-2">Based on your past visits and current symptoms</p>
              <h3 className="text-lg font-semibold mb-6">Recommended Specialists</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.slice(0, 2).map((doctor) => (
                  <Card key={doctor.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                          <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doctor.name}</h4>
                          <p className="text-sm text-health-600">{doctor.specialty}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Date:</span>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
          className="w-40"
        />
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              You're about to book a video consultation with {selectedDoctor?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Doctor:</span>
              <span>{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Specialty:</span>
              <span>{selectedDoctor?.specialty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Date:</span>
              <span>{new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Time:</span>
              <span>{appointmentTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Fee:</span>
              <span>${selectedDoctor?.price}</span>
            </div>
            
            <div className="pt-4">
              <Label htmlFor="reminders">Send reminders via:</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="email" defaultChecked />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sms" defaultChecked />
                  <label htmlFor="sms">SMS</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="whatsapp" />
                  <label htmlFor="whatsapp">WhatsApp</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={confirmBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new time for your appointment with {currentAppointment?.doctorName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Current time:</span>
              <span>{currentAppointment?.time}</span>
            </div>
            
            <div>
              <Label htmlFor="new-time">New appointment time:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDoctor?.availability.map((time) => (
                  <Button
                    key={time}
                    variant={newAppointmentTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewAppointmentTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmRescheduleAppointment} 
              disabled={!newAppointmentTime}
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment with {currentAppointment?.doctorName}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-gray-500">
              Cancellation is free if done 2 hours before the appointment. 
              Last-minute cancellations may incur a fee.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Appointment</Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelAppointment}
            >
              Yes, Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorConsultation;

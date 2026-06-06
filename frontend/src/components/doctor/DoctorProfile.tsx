import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone,
  Calendar, 
  MapPin, 
  UserCircle,
  AlertCircle,
  Shield,
  Bell,
  Award,
  Stethoscope,
  GraduationCap,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  // Initialize with fields that match the Doctor schema
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: [],
    age: "",
    gender: "",
    consultationFee: "",
    availability: {
      days: [],
      timeSlots: []
    },
    profileImage: "",
    // Additional fields that might be added in the future
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    languages: []
  });

  // List of available specializations from the schema
  const specializations = [
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

  // Days of the week for availability
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Fetch doctor profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getDoctorProfile();
        
        console.log("Doctor profile response:", response);
        
        if (response.success && response.doctor) {
          const doctor = response.doctor;
          
          setDoctorData({
            name: doctor.name || "",
            email: doctor.email || "",
            phone: doctor.phone || "",
            specialization: doctor.specialization || "",
            experience: doctor.experience?.toString() || "",
            qualifications: doctor.qualifications || [],
            age: doctor.age?.toString() || "",
            gender: doctor.gender || "",
            consultationFee: doctor.consultationFee?.toString() || "",
            availability: doctor.availability || { days: [], timeSlots: [] },
            profileImage: doctor.profileImage || "",
            // Additional fields that might be present
            address: doctor.address || "",
            city: doctor.city || "",
            state: doctor.state || "",
            pincode: doctor.pincode || "",
            bio: doctor.bio || "",
            languages: doctor.languages || []
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Prepare data for the API, including only fields in the schema
      const profileData = {
        name: doctorData.name,
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        experience: parseInt(doctorData.experience) || 0,
        qualifications: doctorData.qualifications,
        age: parseInt(doctorData.age) || 25,
        gender: doctorData.gender,
        consultationFee: parseInt(doctorData.consultationFee) || 0,
        availability: doctorData.availability,
        // Include additional fields if the backend supports them
        ...(doctorData.address && { address: doctorData.address }),
        ...(doctorData.city && { city: doctorData.city }),
        ...(doctorData.state && { state: doctorData.state }),
        ...(doctorData.pincode && { pincode: doctorData.pincode }),
        ...(doctorData.bio && { bio: doctorData.bio }),
        ...(doctorData.languages.length > 0 && { languages: doctorData.languages })
      };
      
      // Update profile
      const response = await ApiService.updateDoctorProfile(profileData);
      
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setEditMode(false);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDoctorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvailabilityChange = (type, value) => {
    setDoctorData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [type]: value
      }
    }));
  };

  const addTimeSlot = () => {
    if (!doctorData.newTimeSlot) return;
    
    setDoctorData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: [...prev.availability.timeSlots, prev.newTimeSlot]
      },
      newTimeSlot: ""
    }));
  };

  const removeTimeSlot = (index) => {
    setDoctorData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const handleDayToggle = (day) => {
    const currentDays = doctorData.availability.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleAvailabilityChange('days', newDays);
  };

  const getInitials = () => {
    if (!doctorData.name) return "DR";
    return doctorData.name.split(" ").map(n => n[0]).join("");
  };

  if (isLoading && !editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  if (error && !doctorData.email) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">{error}</h3>
        <p className="text-gray-500 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-health-100">
                {doctorData.profileImage ? (
                  <AvatarImage src={doctorData.profileImage} alt={doctorData.name} />
                ) : (
                  <AvatarFallback className="bg-health-500 text-white text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              {!editMode && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white"
                  onClick={() => setEditMode(true)}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">Dr. {doctorData.name}</h2>
              <p className="text-health-600 font-medium">{doctorData.specialization}</p>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{doctorData.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{doctorData.phone}</span>
                </div>
              </div>
            </div>
            
            {editMode ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[500px] mx-auto">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            <span>Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="professional">
            <Stethoscope className="h-4 w-4 mr-2" />
            <span>Professional Info</span>
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="h-4 w-4 mr-2" />
            <span>Availability</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-health-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your Personal Information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    value={doctorData.name} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    value={doctorData.email} 
                    disabled={true} // Email shouldn't be editable
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    value={doctorData.phone} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
                  <Input 
                    type="number"
                    value={doctorData.age} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={doctorData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
            </CardContent>
          </Card>
          
          
        </TabsContent>
        
        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold">Qualifications And Specialization</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Your Professional Qualifications</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialization</label>
                  <Select
                    value={doctorData.specialization}
                    onValueChange={(value) => handleInputChange("specialization", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience (Years)</label>
                  <Input 
                    type="number"
                    value={doctorData.experience} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Qualifications</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {doctorData.qualifications.map((qual, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                        <span>{qual}</span>
                        {editMode && (
                          <button 
                            className="ml-2 text-gray-500 hover:text-red-500"
                            onClick={() => {
                              const newQuals = [...doctorData.qualifications];
                              newQuals.splice(index, 1);
                              handleInputChange("qualifications", newQuals);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <div className="flex gap-2">
                      <Input 
                        value={doctorData.newQualification || ''} 
                        onChange={(e) => handleInputChange("newQualification", e.target.value)}
                        placeholder="Add a qualification (e.g., MBBS, MD)"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (doctorData.newQualification) {
                            handleInputChange("qualifications", [
                              ...doctorData.qualifications, 
                              doctorData.newQualification
                            ]);
                            handleInputChange("newQualification", "");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consultation Fee (₹)</label>
                  <Input 
                    type="number"
                    value={doctorData.consultationFee} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold">Availability</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Your Available Days and Time Slots</p>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <Button
                        key={day}
                        type="button"
                        variant={doctorData.availability.days?.includes(day) ? "default" : "outline"}
                        onClick={() => editMode && handleDayToggle(day)}
                        disabled={!editMode}
                        className="min-w-[100px]"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Time Slots</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctorData.availability.timeSlots?.map((slot, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                        <span>{slot}</span>
                        {editMode && (
                          <button 
                            className="ml-2 text-gray-500 hover:text-red-500"
                            onClick={() => removeTimeSlot(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {(!doctorData.availability.timeSlots || doctorData.availability.timeSlots.length === 0) && (
                      <p className="text-gray-500">No time slots added yet</p>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="flex gap-2">
                      <Input 
                        value={doctorData.newTimeSlot || ''} 
                        onChange={(e) => handleInputChange("newTimeSlot", e.target.value)}
                        placeholder="Add a time slot (e.g., 09:00-10:00)"
                      />
                      <Button 
                        variant="outline"
                        onClick={addTimeSlot}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  {editMode && (
                    <p className="text-xs text-gray-500 mt-2">
                      Format: HH:MM-HH:MM (24-hour format), e.g., 09:00-10:00
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorProfile;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Lock, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Calendar, 
  HeartPulse,
  AlertCircle, 
  Pill,
  UserPlus,
  Upload
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import ApiService from "@/services/api";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Basic interface for the form data
interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: Array<{
    condition: string;
    diagnosedDate: string;
    status: string;
  }>;
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  profileImage?: File | null;
}

const PatientSignup = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Initialize form state with default values
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: 0,
    gender: "",
    bloodGroup: "",
    allergies: [""],
    medicalHistory: [{ condition: "", diagnosedDate: "", status: "Active" }],
    currentMedications: [{ name: "", dosage: "", frequency: "" }],
    emergencyContact: { name: "", phone: "", relation: "" },
    profileImage: null
  });

  // Helper functions for array fields
  const addAllergy = () => {
    setFormData({
      ...formData,
      allergies: [...formData.allergies, ""]
    });
  };

  const updateAllergy = (index: number, value: string) => {
    const updatedAllergies = [...formData.allergies];
    updatedAllergies[index] = value;
    setFormData({
      ...formData,
      allergies: updatedAllergies
    });
  };

  const removeAllergy = (index: number) => {
    if (formData.allergies.length > 1) {
      const updatedAllergies = formData.allergies.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        allergies: updatedAllergies
      });
    }
  };

  const addMedicalHistory = () => {
    setFormData({
      ...formData,
      medicalHistory: [...formData.medicalHistory, { condition: "", diagnosedDate: "", status: "Active" }]
    });
  };

  const updateMedicalHistory = (index: number, field: string, value: string) => {
    const updatedHistory = [...formData.medicalHistory];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setFormData({
      ...formData,
      medicalHistory: updatedHistory
    });
  };

  const removeMedicalHistory = (index: number) => {
    if (formData.medicalHistory.length > 1) {
      const updatedHistory = formData.medicalHistory.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        medicalHistory: updatedHistory
      });
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      currentMedications: [...formData.currentMedications, { name: "", dosage: "", frequency: "" }]
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.currentMedications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setFormData({
      ...formData,
      currentMedications: updatedMedications
    });
  };

  const removeMedication = (index: number) => {
    if (formData.currentMedications.length > 1) {
      const updatedMedications = formData.currentMedications.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        currentMedications: updatedMedications
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      emergencyContact: {
        ...formData.emergencyContact,
        [field]: value
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        profileImage: e.target.files[0]
      });
    }
  };

  const validateForm = () => {
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    // Required fields validation
    const requiredFields = ['name', 'email', 'phone', 'password', 'age', 'gender'];
    for (const field of requiredFields) {
      if (!formData[field as keyof PatientFormData]) {
        toast({
          title: "Missing Required Field",
          description: `Please fill in all required fields before submitting.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return false;
    }

    // Age validation
    if (formData.age < 1 || formData.age > 120) {
      toast({
        title: "Invalid Age",
        description: "Age must be between 1 and 120.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Prepare data for API
      const patientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || undefined,
        allergies: formData.allergies.filter(a => a.trim() !== ""),
        medicalHistory: formData.medicalHistory
        .filter(m => m.condition.trim() !== "")
        .map(m => ({
          condition: m.condition,
          diagnosedDate: m.diagnosedDate ? new Date(m.diagnosedDate).toISOString() : undefined,
          status: m.status
        })),
        currentMedications: formData.currentMedications.filter(m => m.name.trim() !== ""),
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined
      };

      // Handle profile image upload if provided
      let imageUrl = "";
      if (formData.profileImage) {
        // You would typically upload the image to a server or cloud storage
        // and receive a URL back. This is a placeholder for that logic.
        // const uploadResponse = await uploadImage(formData.profileImage);
        // imageUrl = uploadResponse.url;
        // patientData.profileImage = imageUrl;
      }
      
      // Register patient
      const response = await ApiService.registerPatient(patientData);
      
      if (response.token) {
        // Store auth data
        login(response.token, 'patient', response.userId);
        
        toast({
          title: "Registration Successful",
          description: "Welcome to your patient dashboard.",
        });
        
        
      } else {
        throw new Error("Registration failed");
      }
      navigate("/patient-dashboard");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form navigation controls
  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("medical");
    else if (activeTab === "medical") setActiveTab("emergency");
  };

  const prevTab = () => {
    if (activeTab === "emergency") setActiveTab("medical");
    else if (activeTab === "medical") setActiveTab("basic");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-50 to-white flex items-center justify-center p-6">
      <GlassCard className="max-w-2xl w-full">
        <Button 
          variant="ghost" 
          className="mb-4 p-0 h-auto" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Home</span>
        </Button>

        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-health-50 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-health-600" />
          </div>
          <h1 className="text-2xl font-bold">Patient Registration</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to manage your health records and appointments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="30"
                    value={formData.age || ""}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
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

              <div className="space-y-2">
                <label htmlFor="bloodGroup" className="text-sm font-medium">
                  Blood Group
                </label>
                <Select 
                  value={formData.bloodGroup} 
                  onValueChange={(value) => handleInputChange("bloodGroup", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="profileImage" className="text-sm font-medium">
                  Profile Picture (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="flex items-center justify-center">
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-health-600 mb-2" />
                      <span className="text-sm text-health-600">Click to upload</span>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {formData.profileImage && (
                    <p className="text-sm text-center mt-2">
                      Selected: {formData.profileImage.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextTab}>
                  Next: Medical History
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-health-600" />
                    Allergies
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addAllergy}
                  >
                    Add Allergy
                  </Button>
                </div>
                
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="e.g., Peanuts, Penicillin"
                      value={allergy}
                      onChange={(e) => updateAllergy(index, e.target.value)}
                    />
                    {formData.allergies.length > 1 && (
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="icon"
                        onClick={() => removeAllergy(index)}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <HeartPulse className="h-5 w-5 mr-2 text-health-600" />
                    Medical History
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMedicalHistory}
                  >
                    Add Condition
                  </Button>
                </div>
                
                {formData.medicalHistory.map((history, index) => (
                  <div key={index} className="border p-3 rounded-md mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium">Condition</label>
                        <Input
                          placeholder="e.g., Diabetes, Hypertension"
                          value={history.condition}
                          onChange={(e) => updateMedicalHistory(index, "condition", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Diagnosed Date</label>
                        <Input
                          type="date"
                          value={history.diagnosedDate}
                          onChange={(e) => updateMedicalHistory(index, "diagnosedDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select 
                          value={history.status} 
                          onValueChange={(value) => updateMedicalHistory(index, "status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Chronic">Chronic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {formData.medicalHistory.length > 1 && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeMedicalHistory(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-health-600" />
                    Current Medications
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMedication}
                  >
                    Add Medication
                  </Button>
                </div>
                
                {formData.currentMedications.map((medication, index) => (
                  <div key={index} className="border p-3 rounded-md mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-medium">Medication Name</label>
                        <Input
                          placeholder="e.g., Lisinopril"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Dosage</label>
                        <Input
                          placeholder="e.g., 10mg"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Frequency</label>
                        <Input
                          placeholder="e.g., Once daily"
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {formData.currentMedications.length > 1 && (
                      <div className="flex justify-end mt-2">
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeMedication(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={prevTab}>
                  Back: Basic Info
                </Button>
                <Button type="button" onClick={nextTab}>
                  Next: Emergency Contact
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="emergency">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <UserPlus className="h-5 w-5 mr-2 text-health-600" />
                    Emergency Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Name</label>
                      <Input
                        placeholder="e.g., Jane Doe"
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Relationship</label>
                      <Input
                        placeholder="e.g., Spouse, Parent"
                        value={formData.emergencyContact.relation}
                        onChange={(e) => handleEmergencyContactChange("relation", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input
                        placeholder="e.g., +1 234 567 8900"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <p className="text-sm text-gray-500">
                    <span className="text-red-500">*</span> Indicates required fields
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Back: Medical History
                    </Button>
                    
                    <AnimatedButton 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Complete Registration"}
                    </AnimatedButton>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <a href="#" className="text-health-600 hover:underline">
                      <button type="button" onClick={() => navigate("/patient-login")}>
                        Sign In
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </GlassCard>
    </div>
  );
};

export default PatientSignup;
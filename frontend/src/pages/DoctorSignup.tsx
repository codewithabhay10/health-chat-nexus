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
  Award,
  Calendar,
  Briefcase,
  DollarSign
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { useToast } from "@/hooks/use-toast";
import ApiService from "../services/api";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  experience: number;
  qualifications: string[];
  age: number;
  gender: string;
  consultationFee: number;
}

const DoctorSignup = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    experience: 0,
    qualifications: [""],
    age: 25,
    gender: "",
    consultationFee: 0,
  });

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

  // Helper functions for array fields
  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, ""]
    });
  };

  const updateQualification = (index: number, value: string) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = value;
    setFormData({
      ...formData,
      qualifications: updatedQualifications
    });
  };

  const removeQualification = (index: number) => {
    if (formData.qualifications.length > 1) {
      const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        qualifications: updatedQualifications
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
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
    const requiredFields = ['name', 'email', 'phone', 'password', 'specialization', 'gender'];
    for (const field of requiredFields) {
      if (!formData[field as keyof DoctorFormData]) {
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
    if (formData.age < 25 || formData.age > 80) {
      toast({
        title: "Invalid Age",
        description: "Age must be between 25 and 80.",
        variant: "destructive",
      });
      return false;
    }

    // Experience validation
    if (formData.experience < 0 || formData.experience > 50) {
      toast({
        title: "Invalid Experience",
        description: "Experience must be between 0 and 50 years.",
        variant: "destructive",
      });
      return false;
    }

    // Consultation Fee validation
    if (formData.consultationFee < 0) {
      toast({
        title: "Invalid Consultation Fee",
        description: "Consultation fee cannot be negative.",
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
      const doctorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        specialization: formData.specialization,
        experience: formData.experience,
        qualifications: formData.qualifications.filter(q => q.trim() !== ""),
        age: formData.age,
        gender: formData.gender,
        consultationFee: formData.consultationFee
      };
      
      // Register doctor
      const response = await ApiService.registerDoctor(doctorData);
      
      if (response.success) {
        // Store basic info in localStorage
        localStorage.setItem('userId', response.user?.id || response.userId || '');
        localStorage.setItem('userName', formData.name);
        localStorage.setItem('userRole', 'doctor');
        
        toast({
          title: "Registration Successful",
          description: "Welcome to your doctor dashboard.",
        });
        
        navigate("/doctor-dashboard");
      } else {
        throw new Error(response.message || "Registration failed");
      }
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
    if (activeTab === "basic") setActiveTab("professional");
  };

  const prevTab = () => {
    if (activeTab === "professional") setActiveTab("basic");
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
            <Award className="h-8 w-8 text-health-600" />
          </div>
          <h1 className="text-2xl font-bold">Doctor Registration</h1>
          <p className="text-muted-foreground mt-2">
            Create your professional healthcare account
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional Details</TabsTrigger>
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
                    placeholder="Dr. John Doe"
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
                    placeholder="doctor@example.com"
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
                    min="25"
                    max="80"
                    placeholder="35"
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
                <label htmlFor="password" className="text-sm font-medium">
                  Password(must be 6 character long) <span className="text-red-500">*</span>
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

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextTab}>
                  Next: Professional Details
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="specialization" className="text-sm font-medium">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={(value) => handleInputChange("specialization", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(specialization => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="experience" className="text-sm font-medium">
                    Experience (years) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="10"
                      value={formData.experience || ""}
                      onChange={(e) => handleInputChange("experience", parseInt(e.target.value))}
                      className="pl-10"
                      required
                    />
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="consultationFee" className="text-sm font-medium">
                    Consultation Fee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      placeholder="500"
                      value={formData.consultationFee || ""}
                      onChange={(e) => handleInputChange("consultationFee", parseInt(e.target.value))}
                      className="pl-10"
                      required
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="h-5 w-5 mr-2 text-health-600" />
                    Qualifications
                  </h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addQualification}
                  >
                    Add Qualification
                  </Button>
                </div>
                
                {formData.qualifications.map((qualification, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="e.g., MBBS, MD, MS"
                      value={qualification}
                      onChange={(e) => updateQualification(index, e.target.value)}
                    />
                    {formData.qualifications.length > 1 && (
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="icon"
                        onClick={() => removeQualification(index)}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
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
                    Back: Basic Info
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
                    <button type="button" onClick={() => navigate("/doctor-login")}>
                      Sign In
                    </button>
                  </a>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </GlassCard>
    </div>
  );
};

export default DoctorSignup;
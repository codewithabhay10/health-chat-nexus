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
  Heart,
  Activity,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import MedicalChatbot from "./MedicalChatbot";

const UserProfile = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Initialize with empty user data
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
    chronicConditions: [],
    emergencyContact: "",
    emergencyPhone: "",
    profileImage: "",
    medicalHistory: [],
    currentMedications: [],
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Add this debugging log
      console.log("Fetching profile with user info:", {
        userId: localStorage.getItem('userId'),
        userRole: localStorage.getItem('userRole')
      });
        const response = await ApiService.getPatientProfile();
        console.log("API Response:", response); // Add this to debug
        
        if (response.patient) {

          // Format dates for display
          const formatDate = (dateString) => {
            if (!dateString) return "";
            // Convert ISO date or timestamp to YYYY-MM-DD format
            return new Date(dateString).toISOString().split('T')[0];
          };

          setUserData({
            firstName: response.patient.name?.split(' ')[0] || "",
            lastName: response.patient.name?.split(' ').slice(1).join(' ') || "",
            email: response.patient.email || "",
            phone: response.patient.phone || "",
            gender: response.patient.gender || "",
            bloodGroup: response.patient.bloodGroup || "",
            allergies: Array.isArray(response.patient.allergies) ? response.patient.allergies.join(', ') : response.patient.allergies || "",
             // Format medical history for display
            medicalHistory: response.patient.medicalHistory?.map(h => ({
              ...h,
              diagnosedDate: formatDate(h.diagnosedDate) // Format diagnosed date
            })) || [],
            chronicConditions: response.patient.medicalHistory?.map(h => h.condition).join(', ') || "",
            emergencyContact: response.patient.emergencyContact?.name || "",
            emergencyPhone: response.patient.emergencyContact?.phone || "",
            profileImage: response.patient.profileImage || "",
            currentMedications: response.patient.currentMedications || []
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
      
      // Prepare data for the API
      const profileData = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        bloodGroup: userData.bloodGroup,
        allergies: userData.allergies.split(',').map(item => item.trim()),
        emergencyContact: {
          name: userData.emergencyContact,
          phone: userData.emergencyPhone,
          relation: "Family" // Default if not provided
        },
        medicalHistory: userData.medicalHistory.map(h => ({
          condition: h.condition,
          diagnosedDate: h.diagnosedDate,
          status: h.status
        })),
        currentMedications: userData.currentMedications
      };
      
      // Update profile
      const response = await ApiService.updatePatientProfile(profileData);
      
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

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading && !editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  if (error && !userData.email) {
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
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage} alt={userData.firstName} />
                ) : (
                  <AvatarFallback className="bg-health-500 text-white text-2xl">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
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
              <h2 className="text-2xl font-bold">{userData.firstName} {userData.lastName}</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{userData.phone}</span>
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
                  {translate("cancel")}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {translate("saving")}
                    </>
                  ) : (
                    translate("save")
                  )}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                {translate("edit")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px] mx-auto">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            <span>{translate("personalInfo")}</span>
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Heart className="h-4 w-4 mr-2" />
            <span>{translate("medicalInfo")}</span>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Shield className="h-4 w-4 mr-2" />
            <span>{translate("security")}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-health-600" />
                {translate("personalDetails")}
              </CardTitle>
              <CardDescription>
                {translate("yourPersonalInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("firstName")}</label>
                  <Input 
                    value={userData.firstName} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("lastName")}</label>
                  <Input 
                    value={userData.lastName} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("email")}</label>
                  <Input 
                    value={userData.email} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("phone")}</label>
                  <Input 
                    value={userData.phone} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("gender")}</label>
                  <Input 
                    value={userData.gender} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-health-600" />
                {translate("medicalProfile")}
              </CardTitle>
              <CardDescription>
                {translate("yourHealthInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("bloodGroup")}</label>
                  <Input 
                    value={userData.bloodGroup} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("allergies")}</label>
                  <Input 
                    value={userData.allergies} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">{translate("chronicConditions")}</label>
                  <Input 
                    value={userData.chronicConditions} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("chronicConditions", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-health-600" />
                {translate("medicalHistory")}
              </CardTitle>
              <CardDescription>
                {translate("yourPreviousMedicalConditions")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData.medicalHistory && userData.medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {userData.medicalHistory.map((condition, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <h4 className="text-sm font-medium">{translate("condition")}</h4>
                          <p>{condition.condition}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{translate("diagnosedDate")}</h4>
                          <p>{condition.diagnosedDate || translate("notSpecified")}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{translate("status")}</h4>
                          <p>{condition.status || translate("active")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {translate("noMedicalHistoryRecorded")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-health-600" />
                {translate("currentMedications")}
              </CardTitle>
              <CardDescription>
                {translate("yourCurrentMedications")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userData.currentMedications && userData.currentMedications.length > 0 ? (
                <div className="space-y-4">
                  {userData.currentMedications.map((medication, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <h4 className="text-sm font-medium">{translate("medicationName")}</h4>
                          <p>{medication.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{translate("dosage")}</h4>
                          <p>{medication.dosage || translate("notSpecified")}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{translate("frequency")}</h4>
                          <p>{medication.frequency || translate("notSpecified")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {translate("noCurrentMedications")}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-health-600" />
                {translate("emergencyContacts")}
              </CardTitle>
              <CardDescription>
                {translate("inCaseOfEmergency")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("emergencyContact")}</label>
                  <Input 
                    value={userData.emergencyContact} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("emergencyPhone")}</label>
                  <Input 
                    value={userData.emergencyPhone} 
                    disabled={!editMode}
                    onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-health-600" />
                {translate("accountSecurity")}
              </CardTitle>
              <CardDescription>
                {translate("managePassword")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("currentPassword")}</label>
                  <Input type="password" disabled={!editMode} placeholder="********" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("newPassword")}</label>
                  <Input type="password" disabled={!editMode} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("confirmPassword")}</label>
                  <Input type="password" disabled={!editMode} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled={!editMode}>
                {translate("changePassword")}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-health-600" />
                {translate("notifications")}
              </CardTitle>
              <CardDescription>
                {translate("manageNotifications")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{translate("emailNotifications")}</h4>
                    <p className="text-sm text-muted-foreground">{translate("receiveEmailNotifs")}</p>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      className="h-4 w-4"
                      disabled={!editMode}
                      defaultChecked
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{translate("smsNotifications")}</h4>
                    <p className="text-sm text-muted-foreground">{translate("receiveSmsNotifs")}</p>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      className="h-4 w-4"
                      disabled={!editMode}
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;

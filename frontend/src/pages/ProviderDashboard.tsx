
import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Hospital, 
  Users, 
  Calendar, 
  BarChart, 
  Settings, 
  MessageSquare, 
  LogOut,
  Bell,
  Video
} from "lucide-react";
import DoctorsList from "@/components/dashboard/DoctorsList";
import VirtualConsultation from "@/components/dashboard/VirtualConsultation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("doctors");

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Hospital className="h-8 w-8 text-health-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Memorial Hospital</h1>
              <p className="text-sm text-gray-500">Provider Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-2">
                <AvatarImage src="/placeholder.svg" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">Hospital Administrator</p>
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
              <TabsTrigger value="doctors">
                <Users className="h-4 w-4 mr-2" />
                Doctors
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="consultations">
                <Video className="h-4 w-4 mr-2" />
                Virtual Consultations
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Hospital Overview Dashboard</h2>
              <p className="text-gray-500">Hospital dashboard content would go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="doctors" className="mt-0">
            <DoctorsList />
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Appointments Management</h2>
              <p className="text-gray-500">Appointments calendar and management tools would go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="consultations" className="mt-0">
            <VirtualConsultation />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Provider Messages</h2>
              <p className="text-gray-500">Internal messaging system would go here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Hospital Settings</h2>
              <p className="text-gray-500">Hospital settings and configuration options would go here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { 
  LayoutDashboard, 
  User, 
  Video, 
  Bot, 
  FileText, 
  TestTube,
  Globe,
  LogOut,
  Pill,
  Shield,
  ScanText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ApiService from "../../services/api.js"

interface PatientSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, translate } = useLanguage();

  const languages = [
    "English",
    "Hindi",
    "Punjabi",
    "Telugu",
    "Tamil",
    "Gujarati",
    "Bengali",
  ];

  // On mount, set language from localStorage if available
  useEffect(() => {
    const storedLang = localStorage.getItem("language");
    if (storedLang && storedLang !== language) {
      setLanguage(storedLang as any);
    }
    // eslint-disable-next-line
  }, []);

  // Whenever language changes, update localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

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

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: translate("dashboard"),
      value: "dashboard"
    },
    {
      icon: User,
      label: translate("profile"),
      value: "profile"
    },
    {
      icon: Video,
      label: translate("consultations"),
      value: "consultation"
    },
    {
      icon: Bot,
      label: translate("aiAssistant"),
      value: "chatbot"
    },
    {
      icon: FileText,
      label: translate("records"),
      value: "records"
    },
    {
      icon: TestTube,
      label: translate("tests"),
      value: "tests"
    },
    {
      icon: Pill,
      label: translate("myPrescriptions"),
      value: "prescriptions"
    },
    {
      icon: Shield,
      label: translate("governmentSchemes"),
      value: "schemes"
    },
  ];

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-health-500 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-semibold text-lg">Health Portal</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    className={
                      activeTab === item.value 
                        ? "bg-health-500 text-white hover:bg-health-600 transition-colors" 
                        : "hover:bg-health-50 hover:text-health-700 transition-colors"
                    }
                    onClick={() => setActiveTab(item.value)}
                  >
                    <item.icon className={`h-5 w-5 ${activeTab === item.value ? "text-white" : ""}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-5 my-2">
            {translate("settings")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="hover:bg-health-50 hover:text-health-700 transition-colors">
                      <Globe className="h-5 w-5" />
                      <span>{translate("languageSelector")}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem 
                        key={lang}
                        onClick={() => setLanguage(lang as any)}
                        className={language === lang ? "bg-health-100 text-health-700" : ""}
                      >
                        {lang}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="hover:bg-health-50 hover:text-health-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{translate("logout")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {/* Footer area - previously contained health profile completion */}
      </SidebarFooter>
    </Sidebar>
  );
};

export default PatientSidebar;
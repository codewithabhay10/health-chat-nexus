
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Index from "./pages/Index";
import PatientLogin from "./pages/PatientLogin";
import DoctorLogin from "./pages/DoctorLogin";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import NotFound from "./pages/NotFound";
import PatientSignup from "./pages/PatientSignUp";
import VideoConference from './pages/video-confernce';

import { AuthProvider } from './context/AuthContext';

// New components to create
import DoctorSignup from './pages/DoctorSignup';
import BookAppointment from './pages/BookAppointment';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
        <BrowserRouter>
        <div className="App">
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/doctor-login" element={<DoctorLogin />} />
                        <Route path="/doctor-signup" element={<DoctorSignup />} />
                        <Route path="/patient-login" element={<PatientLogin />} />
                        <Route path="/patient-signup" element={<PatientSignup />} />
                        
                        {/* Protected Routes */}
                        <Route 
                            path="/doctor-dashboard" 
                            element={
                                <ProtectedRoute requiredRole="doctor">
                                    <DoctorDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/patient-dashboard" 
                            element={
                                <ProtectedRoute requiredRole="patient">
                                    <PatientDashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/book-appointment/:doctorId" 
                            element={
                                <ProtectedRoute requiredRole="patient">
                                    <BookAppointment />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/video-conference/:appointmentId" 
                            element={
                                <ProtectedRoute requiredRole="patient">
                                    <VideoConference />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
        </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

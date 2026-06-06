import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, ArrowLeft, Award } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { useToast } from "@/hooks/use-toast";
import ApiService from "../services/api";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      console.log("Attempting doctor login with:", email);

      // Call the API service with correct endpoint
      const data = await ApiService.loginDoctor({ 
        email,
        password 
      });

      console.log("Doctor login response:", data);
      
      if (data.success) {
        // Store in localstorage as backup
        localStorage.setItem('userId', data.user?.id || '');
        localStorage.setItem('userName', data.user?.name || email);
        localStorage.setItem('userRole', 'doctor');
        
        toast({
          title: "Login Successful",
          description: "Welcome to your doctor dashboard",
        });
        // ADD THIS DELAY - gives browser time to save cookie
        setTimeout(() => {
          navigate("/doctor-dashboard");
        }, 100);
        
        //navigate("/doctor-dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-50 to-white flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full">
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
          <h1 className="text-2xl font-bold">Doctor Login</h1>
          <p className="text-muted-foreground mt-2">
            Access your patient management dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300 text-health-600 focus:ring-health-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-health-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <AnimatedButton type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </AnimatedButton>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-health-600 hover:underline">
              <button type="button" onClick={() => navigate("/doctor-signup")}>
                Create one now
              </button>
            </a>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default DoctorLogin;
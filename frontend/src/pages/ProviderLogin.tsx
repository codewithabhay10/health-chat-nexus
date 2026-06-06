
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, ArrowLeft, Hospital, Building, HelpCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { useToast } from "@/hooks/use-toast";

const ProviderLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentication logic would go here
    console.log("Provider login attempt with:", { email, password, hospitalId });
    
    // For demo purposes, we'll just navigate to the dashboard
    toast({
      title: "Login successful",
      description: "Welcome to the provider dashboard!",
    });
    
    navigate("/provider-dashboard");
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
            <Hospital className="h-8 w-8 text-health-600" />
          </div>
          <h1 className="text-2xl font-bold">Healthcare Provider Login</h1>
          <p className="text-muted-foreground mt-2">
            Access your hospital's provider dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Work Email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="hospitalId" className="text-sm font-medium">
              Hospital ID
            </label>
            <div className="relative">
              <Input
                id="hospitalId"
                type="text"
                placeholder="HOSP123456"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="pl-10"
                required
              />
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

          <AnimatedButton type="submit" className="w-full">
            Sign In
          </AnimatedButton>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Need an account?{" "}
            <a href="#" className="text-health-600 hover:underline">
              Contact your hospital administrator
            </a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-health-600" />
            <h3 className="text-sm font-medium">Want to become a provider?</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            If you're a licensed healthcare professional interested in joining our network, please fill out our provider application form.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-sm"
          >
            Apply to Join as Provider
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProviderLogin;


import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero = () => {
  const isMobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

    const handleNavigation = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-health-100 rounded-full filter blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-health-50 rounded-full filter blur-3xl opacity-40 -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className={`flex-1 space-y-8 ${loaded ? 'animate-slideInFromLeft' : 'opacity-0'}`}>
            <div className="inline-block">
              <div className="bg-health-50 text-health-700 px-4 py-1.5 rounded-full font-medium text-sm inline-flex items-center">
                <span className="animate-pulse relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-health-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-health-600"></span>
                </span>
                Multilingual Healthcare Assistant
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight">
              Your Health Companion<br />
              <span className="text-gradient">Any Language, Anytime</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Connect with our AI chatbot or healthcare professionals in your preferred language. 
              Breaking language barriers in healthcare has never been easier.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <AnimatedButton className="rounded-full px-6 py-6 text-lg" onClick={() => handleNavigation("demo")}>
                  Start Chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
              <Button 
                variant="outline" 
                className="rounded-full px-6 py-6 text-lg transition-all hover:bg-background hover:text-health-600 hover:border-health-200"
                onClick={() => handleNavigation("features")}
              >
                Learn How It Works
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-health-100 border-2 border-white flex items-center justify-center">
                    <span className="text-health-700 font-medium text-xs">{i}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">5000+</span> patients & doctors
                </p>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className={`flex-1 relative ${loaded ? 'animate-slideInFromRight' : 'opacity-0'}`}>
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-soft-lg">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                alt="Healthcare technology"
                className="w-full h-auto object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-xl glass-card shadow-soft animate-float z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-health-600 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">25+ Languages</p>
                  <p className="text-xs text-muted-foreground">Supported & Growing</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 p-4 rounded-xl glass-card shadow-soft animate-float animation-delay-1000 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-health-100 border border-health-200 flex items-center justify-center">
                  <span className="text-health-700 font-medium">24/7</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Always Available</p>
                  <p className="text-xs text-muted-foreground">Round-the-clock care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

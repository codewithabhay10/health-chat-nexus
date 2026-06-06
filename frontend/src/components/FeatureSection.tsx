
import React, { useEffect, useRef } from "react";
import GlassCard from "./ui/GlassCard";
import { Globe, MessageCircle, Shield, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const features = [
  {
    icon: <Globe className="h-8 w-8 text-health-600" />,
    title: "Multilingual Support",
    description: "Chat with our AI or doctors in 25+ languages, removing communication barriers in healthcare."
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-health-600" />,
    title: "Advanced AI Chatbot",
    description: "Get instant responses to health queries with our medically-trained AI assistant."
  },
  {
    icon: <User className="h-8 w-8 text-health-600" />,
    title: "Verified Doctors",
    description: "Connect with licensed healthcare professionals specializing in various fields."
  },
  {
    icon: <Shield className="h-8 w-8 text-health-600" />,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with enterprise-grade security."
  }
];

const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-6 bg-gradient-to-b from-white to-health-50"
      id = "features"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-on-scroll" >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Breaking Barriers in <span className="text-gradient">Healthcare</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Our platform combines advanced AI technology with professional healthcare
            to provide accessible care in any language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
              <GlassCard hoverEffect animationDelay={index * 100}>
                <div className="h-14 w-14 rounded-xl bg-health-50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

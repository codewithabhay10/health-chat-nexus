
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import ChatbotDemo from "@/components/ChatbotDemo";
import LoginOptions from "@/components/LoginOptions";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Reset scroll position when the page loads
    window.scrollTo(0, 0);
    
    // Add scroll animation observer
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
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <FeatureSection />
        <ChatbotDemo />
        <LoginOptions />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

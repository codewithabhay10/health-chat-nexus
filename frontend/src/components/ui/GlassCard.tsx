
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animationDelay?: number;
}

const GlassCard = ({
  children,
  className,
  hoverEffect = false,
  animationDelay = 0,
  ...props
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-300",
        hoverEffect && 
          "hover:shadow-soft-lg hover:translate-y-[-5px] hover:bg-white/80",
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        transformOrigin: "center center" 
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;


import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  animationDelay?: number;
}

const AnimatedButton = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  animationDelay = 0,
  ...props
}: AnimatedButtonProps) => {
  return (
    <Button
      className={cn(
        "btn-hover-effect relative overflow-hidden animate-fadeIn",
        className
      )}
      variant={variant}
      size={size}
      asChild={asChild}
      style={{ animationDelay: `${animationDelay}ms` }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton;

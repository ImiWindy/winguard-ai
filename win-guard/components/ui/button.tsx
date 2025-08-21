"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      default: "bg-black text-white dark:bg-white dark:text-black hover:opacity-90",
      outline: "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-900",
    };
    const sizes: Record<string, string> = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";



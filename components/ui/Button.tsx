"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    const variants = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-400 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
      secondary:
        "bg-brand-50 hover:bg-brand-100 text-brand-700 focus:ring-brand-300 hover:-translate-y-0.5",
      outline:
        "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 focus:ring-brand-400 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
      ghost:
        "hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-gray-300",
      danger:
        "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

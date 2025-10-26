import type React from "react"
import { cn } from "@/lib/utils"

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: React.ReactNode
}

export function NeoButton({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: NeoButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive",
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs md:text-sm",
    md: "px-6 py-3 text-sm md:text-base",
    lg: "px-8 py-4 text-base md:text-lg",
  }

  return (
    <button
      className={cn(
        "neo-button font-bold uppercase tracking-wider active:scale-95 transition-transform",
        variantClasses[variant],
        sizeClasses[size],
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  )
}

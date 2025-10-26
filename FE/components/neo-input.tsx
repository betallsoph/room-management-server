import type React from "react"
import { cn } from "@/lib/utils"

interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function NeoInput({ label, error, helperText, className, ...props }: NeoInputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          "neo-input w-full px-4 py-3 bg-input text-foreground placeholder-muted-foreground text-sm md:text-base",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          error ? "border-destructive" : "border-border",
          className,
        )}
        {...props}
      />
      {error && <p className="text-destructive text-xs md:text-sm font-bold mt-1 uppercase animate-shake">{error}</p>}
      {helperText && !error && <p className="text-muted-foreground text-xs md:text-sm mt-1">{helperText}</p>}
    </div>
  )
}

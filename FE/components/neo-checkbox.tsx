import type React from "react"
import { cn } from "@/lib/utils"

interface NeoCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function NeoCheckbox({ label, className, ...props }: NeoCheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" className={cn("neo-checkbox cursor-pointer", className)} {...props} />
      {label && <label className="text-sm font-semibold cursor-pointer">{label}</label>}
    </div>
  )
}

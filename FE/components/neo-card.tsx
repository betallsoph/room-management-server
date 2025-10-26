import type React from "react"
import { cn } from "@/lib/utils"

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function NeoCard({ className, children, ...props }: NeoCardProps) {
  return (
    <div className={cn("neo-card bg-card text-card-foreground p-6", className)} {...props}>
      {children}
    </div>
  )
}

"use client"

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  subtext?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: "default" | "warning" | "success"
}

export function StatCard({ icon, label, value, subtext, action, variant = "default" }: StatCardProps) {
  const bgColor = {
    default: "bg-card",
    warning: "bg-destructive/10",
    success: "bg-accent/10",
  }[variant]

  return (
    <div className={`${bgColor} neo-card p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl mb-1">{icon}</div>
          <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 w-full bg-primary text-primary-foreground neo-button py-2 text-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

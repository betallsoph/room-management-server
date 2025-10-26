interface StatsCardProps {
  label: string
  value: string | number
  color: "primary" | "secondary" | "accent"
  icon: string
}

export default function StatsCard({ label, value, color, icon }: StatsCardProps) {
  const colorClasses = {
    primary: "bg-primary text-black",
    secondary: "bg-secondary text-black",
    accent: "bg-accent text-white",
  }

  return (
    <div className="neo-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-black mt-2">{value}</p>
        </div>
        <div
          className={`text-4xl ${colorClasses[color]} w-16 h-16 rounded-lg flex items-center justify-center neo-border border-3 border-black`}
        >
          {icon}
        </div>
      </div>
      <div className="h-1 bg-muted rounded-full"></div>
    </div>
  )
}

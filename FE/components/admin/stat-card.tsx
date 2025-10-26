"use client"

interface StatCardProps {
  label: string
  value: string
  icon: string
  color: "primary" | "secondary" | "accent" | "destructive"
}

const colorClasses = {
  primary: "bg-yellow-50",
  secondary: "bg-pink-50",
  accent: "bg-emerald-50",
  destructive: "bg-red-50",
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`neo-card p-4 animate-bounce-in ${colorClasses[color]}`}>
      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

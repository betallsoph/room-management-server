"use client"

interface ReportChartProps {
  title: string
  type: "occupancy" | "revenue"
}

export default function ReportChart({ title, type }: ReportChartProps) {
  const occupancyData = [
    { label: "Có Người", value: 21, color: "bg-accent" },
    { label: "Trống", value: 2, color: "bg-secondary" },
    { label: "Bảo Trì", value: 1, color: "bg-destructive" },
  ]

  const revenueData = [
    { label: "Tiền Thuê", value: 85, color: "bg-primary" },
    { label: "Tiện Ích", value: 10, color: "bg-accent" },
    { label: "Khác", value: 5, color: "bg-secondary" },
  ]

  const data = type === "occupancy" ? occupancyData : revenueData
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="neo-card bg-card p-6">
      <h3 className="text-lg font-black mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="font-bold">{item.label}</span>
              <span className="font-black">{item.value}</span>
            </div>
            <div className="neo-border bg-muted h-8 flex items-center overflow-hidden">
              <div
                className={`${item.color} h-full flex items-center justify-center font-bold text-sm transition-all`}
                style={{ width: `${(item.value / total) * 100}%` }}
              >
                {(item.value / total) * 100 > 10 && `${Math.round((item.value / total) * 100)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

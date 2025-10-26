"use client"

interface RevenueChartProps {
  revenueData: {
    monthly: number
    total: number
    byMonth: Array<{
      _id: { year: number; month: number }
      total: number
      count: number
    }>
  }
}

export default function RevenueChart({ revenueData }: RevenueChartProps) {
  // Convert backend data to chart format (last 6 months)
  const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
  
  const data = revenueData.byMonth
    .slice(-6) // Get last 6 months
    .map((item) => ({
      month: monthNames[item._id.month - 1],
      revenue: item.total
    }))

  // Fallback if no data
  if (data.length === 0) {
    const currentMonth = new Date().getMonth()
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      data.push({
        month: monthNames[monthIndex],
        revenue: 0
      })
    }
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1) // Avoid division by zero

  return (
    <div className="neo-card bg-card p-6">
      <h3 className="text-lg font-black mb-6">DOANH THU 6 THÁNG</h3>
      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center">
              <div
                className="w-full bg-primary neo-border transition-all hover:bg-secondary"
                style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
              />
            </div>
            <span className="text-xs font-bold">{item.month}</span>
            <span className="text-xs text-muted-foreground">
              {item.revenue >= 1000000 
                ? `${(item.revenue / 1000000).toFixed(1)}tr` 
                : `${(item.revenue / 1000).toFixed(0)}k`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

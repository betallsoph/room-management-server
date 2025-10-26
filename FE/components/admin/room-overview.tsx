"use client"

interface RoomOverviewProps {
  units: {
    total: number
    available: number
    occupied: number
    maintenance: number
    occupancyRate: string
  }
}

export default function RoomOverview({ units }: RoomOverviewProps) {
  const roomStatus = [
    { status: "Có Người", count: units.occupied, color: "bg-accent" },
    { status: "Trống", count: units.available, color: "bg-secondary" },
    { status: "Bảo Trì", count: units.maintenance, color: "bg-destructive" },
  ]

  return (
    <div className="neo-card bg-card p-6">
      <h3 className="text-lg font-black mb-6">TRẠNG THÁI PHÒNG</h3>
      <div className="mb-4 p-3 bg-primary/10 neo-border">
        <div className="flex justify-between items-center">
          <span className="font-bold">Tỷ lệ lấp đầy</span>
          <span className="text-2xl font-black">{units.occupancyRate}%</span>
        </div>
      </div>
      <div className="space-y-4">
        {roomStatus.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="font-bold text-sm">{item.status}</span>
              <span className="font-black">{item.count}</span>
            </div>
            <div className="neo-border bg-muted h-8 flex items-center">
              <div
                className={`${item.color} h-full flex items-center justify-center font-bold text-sm`}
                style={{ width: `${units.total > 0 ? (item.count / units.total) * 100 : 0}%` }}
              >
                {item.count > 0 && item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

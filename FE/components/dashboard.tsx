"use client"

import StatsCard from "./stats-card"
import RoomCard from "./room-card"
import TenantTable from "./tenant-table"

const mockRooms = [
  { id: 1, number: "101", status: "occupied", tenant: "Nguyễn Văn A", rent: 1200, utilities: 150 },
  { id: 2, number: "102", status: "vacant", tenant: null, rent: 1200, utilities: 0 },
  { id: 3, number: "103", status: "occupied", tenant: "Trần Thị B", rent: 1200, utilities: 120 },
  { id: 4, number: "104", status: "occupied", tenant: "Phạm Văn C", rent: 1500, utilities: 180 },
  { id: 5, number: "105", status: "vacant", tenant: null, rent: 1200, utilities: 0 },
  { id: 6, number: "106", status: "occupied", tenant: "Lê Thị D", rent: 1200, utilities: 140 },
]

const mockTenants = [
  { id: 1, name: "Nguyễn Văn A", room: "101", phone: "0901-234-567", rentStatus: "paid", amount: 1200 },
  { id: 2, name: "Trần Thị B", room: "103", phone: "0902-345-678", rentStatus: "paid", amount: 1200 },
  { id: 3, name: "Phạm Văn C", room: "104", phone: "0903-456-789", rentStatus: "pending", amount: 1500 },
  { id: 4, name: "Lê Thị D", room: "106", phone: "0904-567-890", rentStatus: "paid", amount: 1200 },
]

export default function Dashboard() {
  const occupiedRooms = mockRooms.filter((r) => r.status === "occupied").length
  const totalIncome = mockRooms.reduce((sum, r) => sum + r.rent, 0)
  const totalUtilities = mockRooms.reduce((sum, r) => sum + r.utilities, 0)
  const vacantRooms = mockRooms.filter((r) => r.status === "vacant").length

  return (
    <div className="p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-black mb-2">BẢNG ĐIỀU KHIỂN</h2>
        <p className="text-muted-foreground font-semibold">Chào mừng trở lại! Đây là tổng quan tài sản của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Tổng Thu Nhập" value={`$${totalIncome.toLocaleString()}`} color="primary" icon="💵" />
        <StatsCard label="Phòng Có Người" value={occupiedRooms} color="secondary" icon="🏠" />
        <StatsCard label="Phòng Trống" value={vacantRooms} color="accent" icon="🔓" />
        <StatsCard
          label="Tổng Tiền Điện Nước"
          value={`$${totalUtilities.toLocaleString()}`}
          color="primary"
          icon="⚡"
        />
      </div>

      {/* Rooms Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-black mb-6">PHÒNG</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>

      {/* Tenants Section */}
      <div>
        <h3 className="text-2xl font-black mb-6">NGƯỜI THUÊ</h3>
        <TenantTable tenants={mockTenants} />
      </div>
    </div>
  )
}

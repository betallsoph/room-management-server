"use client"

import { type Unit, ROOM_TYPE_NAMES, STATUS_NAMES, formatCurrency } from "@/lib/unit-service"

interface RoomTableProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  onDelete: (unitId: string) => void
}

const statusColors = {
  "available": "bg-accent text-accent-foreground",
  "occupied": "bg-secondary text-secondary-foreground",
  "maintenance": "bg-destructive text-destructive-foreground",
  "rented-out": "bg-primary text-primary-foreground",
}

export default function RoomTable({ units, onEdit, onDelete }: RoomTableProps) {
  const getTenantName = (unit: Unit): string => {
    if (unit.currentTenant?.userId?.fullName) {
      return unit.currentTenant.userId.fullName
    }
    return '-'
  }

  if (units.length === 0) {
    return (
      <div className="neo-card bg-card p-8 text-center">
        <p className="text-xl font-bold text-muted-foreground">Không có phòng nào</p>
      </div>
    )
  }

  return (
    <div className="neo-card bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-4 border-black bg-muted">
              <th className="px-6 py-4 text-left font-black">PHÒNG</th>
              <th className="px-6 py-4 text-left font-black">TÒA</th>
              <th className="px-6 py-4 text-left font-black">TẦNG</th>
              <th className="px-6 py-4 text-left font-black">LOẠI</th>
              <th className="px-6 py-4 text-left font-black">DIỆN TÍCH</th>
              <th className="px-6 py-4 text-left font-black">TIỀN THUÊ</th>
              <th className="px-6 py-4 text-left font-black">TRẠNG THÁI</th>
              <th className="px-6 py-4 text-left font-black">NGƯỜI THUÊ</th>
              <th className="px-6 py-4 text-left font-black">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit._id} className={`border-b-2 border-black ${index % 2 === 0 ? "bg-card" : "bg-muted"}`}>
                <td className="px-6 py-4 font-bold text-lg">{unit.unitNumber}</td>
                <td className="px-6 py-4 font-bold">{unit.building}</td>
                <td className="px-6 py-4">{unit.floor}</td>
                <td className="px-6 py-4 text-sm">{ROOM_TYPE_NAMES[unit.roomType]}</td>
                <td className="px-6 py-4">{unit.squareMeters}m²</td>
                <td className="px-6 py-4 font-bold text-sm">{formatCurrency(unit.rentPrice)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`neo-border px-3 py-1 font-bold text-xs ${statusColors[unit.status]}`}
                  >
                    {STATUS_NAMES[unit.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{getTenantName(unit)}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onEdit(unit)}
                    className="neo-button bg-primary text-primary-foreground px-3 py-1 text-xs mr-2"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => onDelete(unit._id)}
                    className="neo-button bg-destructive text-destructive-foreground px-3 py-1 text-xs"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

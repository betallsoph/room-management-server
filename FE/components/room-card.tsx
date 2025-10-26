interface Room {
  id: number
  number: string
  status: "occupied" | "vacant"
  tenant: string | null
  rent: number
  utilities: number
}

interface RoomCardProps {
  room: Room
}

export default function RoomCard({ room }: RoomCardProps) {
  const isOccupied = room.status === "occupied"
  const statusColor = isOccupied ? "bg-secondary" : "bg-accent"
  const statusText = isOccupied ? "CÓ NGƯỜI" : "TRỐNG"

  return (
    <div className="neo-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground uppercase">Phòng</p>
          <p className="text-4xl font-black">{room.number}</p>
        </div>
        <div
          className={`${statusColor} ${isOccupied ? "text-black" : "text-white"} px-4 py-2 rounded-lg font-black text-xs neo-border border-2 border-black`}
        >
          {statusText}
        </div>
      </div>

      {isOccupied && (
        <div className="mb-4 pb-4 border-b-2 border-black">
          <p className="text-xs font-bold text-muted-foreground uppercase">Người Thuê</p>
          <p className="font-black text-lg">{room.tenant}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="neo-border border-2 border-black rounded-lg p-3 bg-muted">
          <p className="text-xs font-bold text-muted-foreground uppercase">Tiền Thuê</p>
          <p className="font-black text-lg">${room.rent}</p>
        </div>
        <div className="neo-border border-2 border-black rounded-lg p-3 bg-muted">
          <p className="text-xs font-bold text-muted-foreground uppercase">Điện Nước</p>
          <p className="font-black text-lg">${room.utilities}</p>
        </div>
      </div>
    </div>
  )
}

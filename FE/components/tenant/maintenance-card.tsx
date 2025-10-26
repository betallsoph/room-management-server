"use client"

interface MaintenanceCardProps {
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low" | "urgent"
  status: "processing" | "completed" | "cancelled" | "rejected"
  createdDate: string
  onView: () => void
}

export function MaintenanceCard({
  title,
  description,
  category,
  priority,
  status,
  createdDate,
  onView,
}: MaintenanceCardProps) {
  const priorityColor = {
    urgent: "bg-purple-100 text-purple-900 border-purple-900",
    high: "bg-red-100 text-red-900 border-red-900",
    medium: "bg-yellow-100 text-yellow-900 border-yellow-900",
    low: "bg-green-100 text-green-900 border-green-900",
  }[priority]

  const priorityLabel = {
    urgent: "Khẩn Cấp",
    high: "Cao",
    medium: "Trung Bình",
    low: "Thấp",
  }[priority]

  const statusLabel = {
    processing: "Đang Xử Lý",
    completed: "Hoàn Thành",
    cancelled: "Đã Hủy",
    rejected: "Từ Chối",
  }[status]

  return (
    <div className="bg-card neo-card p-4 flex flex-col gap-3 transition-all hover:neo-shadow hover:-translate-y-0.5 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-bold text-base">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="px-2 py-1 neo-border text-xs font-bold bg-muted">{category}</div>
        <div className={`px-2 py-1 neo-border text-xs font-bold ${priorityColor}`}>{priorityLabel}</div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Ngày Tạo: {createdDate}</span>
        <span className="font-bold">{statusLabel}</span>
      </div>
      <button onClick={onView} className="w-full bg-primary text-primary-foreground neo-button py-2 text-xs font-bold hover:neo-shadow transition-all">
        Xem Chi Tiết
      </button>
    </div>
  )
}

"use client"

interface InvoiceCardProps {
  invoiceNumber: string
  month: string
  type: string
  amount: number
  dueDate: string
  status: "unpaid" | "paid" | "overdue"
  onView: () => void
  onPay?: () => void
}

export function InvoiceCard({ invoiceNumber, month, type, amount, dueDate, status, onView, onPay }: InvoiceCardProps) {
  const statusColor = {
    unpaid: "bg-yellow-100 text-yellow-900 border-yellow-900",
    paid: "bg-green-100 text-green-900 border-green-900",
    overdue: "bg-red-100 text-red-900 border-red-900",
  }[status]

  const statusLabel = {
    unpaid: "Chưa Thanh Toán",
    paid: "Đã Thanh Toán",
    overdue: "Quá Hạn",
  }[status]

  return (
    <div className="bg-card neo-card p-4 flex flex-col gap-3 transition-all hover:neo-shadow hover:-translate-y-0.5 cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-base">{invoiceNumber}</div>
          <div className="text-xs text-muted-foreground">{month}</div>
        </div>
        <div className={`px-2 py-1 neo-border text-xs font-bold ${statusColor}`}>{statusLabel}</div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Loại:</span>
          <span className="font-bold">{type}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Số Tiền:</span>
          <span className="font-bold text-base">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Hạn Thanh Toán:</span>
          <span className="font-bold">{dueDate}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onView} className="flex-1 bg-muted neo-button py-2 text-xs font-bold hover:neo-shadow transition-all">
          Xem
        </button>
        {onPay && status !== "paid" && (
          <button
            onClick={onPay}
            className="flex-1 bg-primary text-primary-foreground neo-button py-2 text-xs font-bold hover:neo-shadow transition-all"
          >
            Thanh Toán
          </button>
        )}
      </div>
    </div>
  )
}

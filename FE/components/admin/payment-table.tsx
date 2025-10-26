"use client"

export default function PaymentTable() {
  const payments = [
    { id: 1, tenant: "Nguyễn Văn A", room: "101", amount: "$1,200", date: "2024-01-05", status: "Đã Thanh Toán" },
    { id: 2, tenant: "Trần Thị B", room: "103", amount: "$1,200", date: "2024-01-06", status: "Đã Thanh Toán" },
    { id: 3, tenant: "Phạm Văn C", room: "105", amount: "$1,200", date: "2024-01-10", status: "Chưa Thanh Toán" },
    { id: 4, tenant: "Lê Thị D", room: "107", amount: "$1,200", date: "2024-01-08", status: "Đã Thanh Toán" },
  ]

  return (
    <div className="neo-card bg-card overflow-hidden">
      <div className="p-6 border-b-4 border-black">
        <h3 className="text-lg font-black">LỊCH SỬ THANH TOÁN</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-4 border-black bg-muted">
            <th className="px-6 py-4 text-left font-black">NGƯỜI THUÊ</th>
            <th className="px-6 py-4 text-left font-black">PHÒNG</th>
            <th className="px-6 py-4 text-left font-black">SỐ TIỀN</th>
            <th className="px-6 py-4 text-left font-black">NGÀY</th>
            <th className="px-6 py-4 text-left font-black">TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={payment.id} className={`border-b-2 border-black ${index % 2 === 0 ? "bg-card" : "bg-muted"}`}>
              <td className="px-6 py-4 font-bold">{payment.tenant}</td>
              <td className="px-6 py-4">{payment.room}</td>
              <td className="px-6 py-4 font-bold">{payment.amount}</td>
              <td className="px-6 py-4">{payment.date}</td>
              <td className="px-6 py-4">
                <span
                  className={`neo-border px-3 py-1 font-bold text-sm ${
                    payment.status === "Đã Thanh Toán"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

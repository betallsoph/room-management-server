"use client"

export default function FinanceChart() {
  const data = [
    { month: "T1", income: 4200, expense: 600 },
    { month: "T2", income: 4500, expense: 700 },
    { month: "T3", income: 4200, expense: 550 },
    { month: "T4", income: 4800, expense: 800 },
    { month: "T5", income: 4600, expense: 650 },
    { month: "T6", income: 5000, expense: 750 },
  ]

  const maxValue = Math.max(...data.map((d) => d.income + d.expense))

  return (
    <div className="neo-card bg-card p-6">
      <h3 className="text-lg font-black mb-6">DOANH THU VS CHI PHÍ</h3>
      <div className="flex items-end justify-between h-64 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-end gap-1">
              <div className="w-full bg-primary neo-border" style={{ height: `${(item.income / maxValue) * 200}px` }} />
              <div
                className="w-full bg-destructive neo-border"
                style={{ height: `${(item.expense / maxValue) * 200}px` }}
              />
            </div>
            <span className="text-xs font-bold">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary neo-border" />
          <span className="text-sm font-bold">Doanh Thu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive neo-border" />
          <span className="text-sm font-bold">Chi Phí</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import ReportChart from "@/components/admin/report-chart"

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-black">BÁO CÁO</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="TỶ LỆ CHIẾM DỤNG PHÒNG" type="occupancy" />
        <ReportChart title="PHÂN BỐ DOANH THU" type="revenue" />
      </div>

      <div className="neo-card bg-card p-6">
        <h3 className="text-lg font-black mb-4">THỐNG KÊ TỔNG QUÁT</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="neo-card bg-blue-50 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tổng Phòng</p>
            <p className="text-2xl font-black">24</p>
          </div>
          <div className="neo-card bg-pink-50 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Phòng Trống</p>
            <p className="text-2xl font-black">3</p>
          </div>
          <div className="neo-card bg-yellow-50 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tỷ Lệ Chiếm Dụng</p>
            <p className="text-2xl font-black">87.5%</p>
          </div>
          <div className="neo-card bg-emerald-50 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Doanh Thu TB</p>
            <p className="text-2xl font-black">$4.2k</p>
          </div>
        </div>
      </div>
    </div>
  )
}

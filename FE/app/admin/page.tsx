"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StatCard from "@/components/admin/stat-card"
import RoomOverview from "@/components/admin/room-overview"
import RevenueChart from "@/components/admin/revenue-chart"
import { getDashboardStatistics, type DashboardStatistics } from "@/lib/dashboard-service"

export default function AdminDashboard() {
  const router = useRouter()
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "admin") {
      router.push("/login")
      return
    }

    loadDashboardData(token)
  }, [router])

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true)
      const stats = await getDashboardStatistics(token)
      setStatistics(stats)
    } catch (err: any) {
      console.error("Failed to load dashboard:", err)
      setError(err.message || "Lỗi tải dữ liệu")
      
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => router.push("/login"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-xl font-black">ĐANG TẢI DỮ LIỆU...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="neo-card max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-black mb-2">LỖI</h2>
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => router.push("/login")}
            className="neo-button bg-primary text-primary-foreground"
          >
            Về Trang Login
          </button>
        </div>
      </div>
    )
  }

  if (!statistics) return null

  const stats = [
    { 
      label: "Tổng Phòng", 
      value: `${statistics.units.occupied}/${statistics.units.total}`, 
      icon: "🏠", 
      color: "primary" as const
    },
    { 
      label: "Phòng Trống", 
      value: statistics.units.available.toString(), 
      icon: "🔓", 
      color: "secondary" as const
    },
    { 
      label: "Người Thuê", 
      value: statistics.tenants.active.toString(), 
      icon: "👥", 
      color: "accent" as const
    },
    { 
      label: "Bảo Trì", 
      value: statistics.maintenanceTickets.total.toString(), 
      icon: "🔧", 
      color: "destructive" as const
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RevenueChart revenueData={statistics.revenue} />
        </div>
        
        <div className="space-y-6">
          {/* Room Status */}
          <div className="neo-card p-4">
            <h2 className="text-lg font-black uppercase mb-3">TRẠNG THÁI PHÒNG</h2>
            
            <div className="mb-3 p-3 neo-border bg-beige-50">
              <div className="text-xs font-bold mb-1">Tỷ lệ lấp đầy</div>
              <div className="text-2xl font-black">{statistics.units.occupancyRate}%</div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Có Người</span>
                  <span className="text-lg font-black">{statistics.units.occupied}</span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {statistics.units.occupied > 0 && (
                    <div className="h-full bg-emerald-400 flex items-center justify-center transition-all"
                         style={{ width: `${statistics.units.total > 0 ? (statistics.units.occupied / statistics.units.total * 100) : 0}%` }}>
                      <span className="text-xs font-bold">{statistics.units.occupied}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Trống</span>
                  <span className="text-lg font-black">{statistics.units.available}</span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {statistics.units.available > 0 && (
                    <div className="h-full bg-pink-400 flex items-center justify-center transition-all"
                         style={{ width: `${statistics.units.total > 0 ? (statistics.units.available / statistics.units.total * 100) : 0}%` }}>
                      <span className="text-xs font-bold">{statistics.units.available}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Đang Bảo Trì</span>
                  <span className="text-lg font-black">{statistics.units.maintenance}</span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {statistics.units.maintenance > 0 && (
                    <div className="h-full bg-orange-300 flex items-center justify-center transition-all"
                         style={{ width: `${statistics.units.total > 0 ? (statistics.units.maintenance / statistics.units.total * 100) : 0}%` }}>
                      <span className="text-xs font-bold">{statistics.units.maintenance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Maintenance Tickets Status */}
          <div className="neo-card p-4">
            <h2 className="text-lg font-black uppercase mb-3">TRẠNG THÁI BẢO TRÌ</h2>
            
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Mới</span>
                  <span className="text-lg font-black">{statistics.maintenanceTickets.new || 0}</span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {(statistics.maintenanceTickets.new || 0) > 0 && statistics.maintenanceTickets.total > 0 && (
                    <div className="h-full bg-red-400 flex items-center justify-center transition-all"
                         style={{ width: `${((statistics.maintenanceTickets.new || 0) / statistics.maintenanceTickets.total * 100)}%` }}>
                      <span className="text-xs font-bold text-white">{statistics.maintenanceTickets.new || 0}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Đang Xử Lý</span>
                  <span className="text-lg font-black">
                    {(statistics.maintenanceTickets.assigned || 0) + (statistics.maintenanceTickets.inProgress || 0)}
                  </span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {((statistics.maintenanceTickets.assigned || 0) + (statistics.maintenanceTickets.inProgress || 0)) > 0 && statistics.maintenanceTickets.total > 0 && (
                    <div className="h-full bg-yellow-400 flex items-center justify-center transition-all"
                         style={{ width: `${(((statistics.maintenanceTickets.assigned || 0) + (statistics.maintenanceTickets.inProgress || 0)) / statistics.maintenanceTickets.total * 100)}%` }}>
                      <span className="text-xs font-bold">
                        {(statistics.maintenanceTickets.assigned || 0) + (statistics.maintenanceTickets.inProgress || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">Hoàn Thành</span>
                  <span className="text-lg font-black">{statistics.maintenanceTickets.completed || 0}</span>
                </div>
                <div className="h-6 neo-border bg-white overflow-hidden">
                  {(statistics.maintenanceTickets.completed || 0) > 0 && statistics.maintenanceTickets.total > 0 && (
                    <div className="h-full bg-green-400 flex items-center justify-center transition-all"
                         style={{ width: `${((statistics.maintenanceTickets.completed || 0) / statistics.maintenanceTickets.total * 100)}%` }}>
                      <span className="text-xs font-bold">{statistics.maintenanceTickets.completed || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

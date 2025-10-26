"use client"

import { StatCard } from "@/components/tenant/stat-card"
import { MaintenanceCard } from "@/components/tenant/maintenance-card"
import { NotificationItem } from "@/components/tenant/notification-item"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getTenantProfile,
  getTenantInvoices,
  getTenantMaintenanceTickets,
  getTenantNotifications,
  formatCurrency,
  formatDate,
  getTimeAgo,
  ROOM_TYPE_NAMES,
  CATEGORY_NAMES,
  type TenantProfile,
  type Invoice,
  type MaintenanceTicket,
  type Notification,
} from "@/lib/tenant-portal-service"

export default function TenantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([])
  const [currentMonthInvoice, setCurrentMonthInvoice] = useState<Invoice | null>(null)
  const [paidInvoicesCount, setPaidInvoicesCount] = useState(0)
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "tenant") {
      router.push("/login")
      return
    }

    loadDashboardData(token)
  }, [router])

  async function loadDashboardData(token: string) {
    try {
      setLoading(true)
      setError(null)

      // Load all data in parallel
      const [profileData, allInvoices, tickets, notifs] = await Promise.all([
        getTenantProfile(token),
        getTenantInvoices(token),
        getTenantMaintenanceTickets(token),
        getTenantNotifications(token, 5),
      ])

      setProfile(profileData)

      // Process invoices
      const unpaid = allInvoices.filter(inv => inv.status === 'issued' || inv.status === 'overdue')
      const paid = allInvoices.filter(inv => inv.status === 'paid')
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const thisMonth = allInvoices.find(inv => inv.month === currentMonth && inv.year === currentYear)

      setUnpaidInvoices(unpaid)
      setPaidInvoicesCount(paid.length)
      setCurrentMonthInvoice(thisMonth || null)

      setMaintenanceTickets(tickets.slice(0, 3))
      setNotifications(notifs)
    } catch (err: any) {
      console.error("Dashboard error:", err)
      setError(err.message || "Không thể tải dữ liệu dashboard")
      
      if (err.message?.includes("Unauthorized")) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const processingTickets = maintenanceTickets.filter(t => t.status === 'new' || t.status === 'assigned' || t.status === 'in-progress')
  const completedTickets = maintenanceTickets.filter(t => t.status === 'completed')
  const lastTicket = maintenanceTickets[0]

  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-bold uppercase">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 neo-card p-4">
        <div className="text-destructive font-bold uppercase mb-1">Lỗi</div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-muted neo-card p-4">
        <div className="font-bold uppercase">Không tìm thấy thông tin người thuê</div>
      </div>
    )
  }

  const unit = profile.currentUnit

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Room Info & Payment Status Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Room Information - Spanning 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold uppercase mb-2">Phòng Hiện Tại</h2>
          {unit ? (
            <div className="bg-card neo-card p-4 transition-all hover:neo-shadow hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏠</div>
                  <div>
                    <div className="text-xl font-bold">PHÒNG {unit.unitNumber} - TÒA {unit.building}</div>
                    <div className="text-xs text-muted-foreground">{ROOM_TYPE_NAMES[unit.roomType] || unit.roomType}</div>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-100 border-2 border-green-900 text-green-900 text-xs font-bold">
                  {profile.status === 'active' ? 'HOẠT ĐỘNG' : 'TẠM NGƯNG'}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="border-l-4 border-black pl-2">
                  <div className="text-xs text-muted-foreground">Diện Tích</div>
                  <div className="font-bold">{unit.squareMeters || 0} m²</div>
                </div>
                <div className="border-l-4 border-black pl-2">
                  <div className="text-xs text-muted-foreground">Giá Thuê</div>
                  <div className="font-bold text-sm">{formatCurrency(unit.rentPrice || 0)}</div>
                </div>
                <div className="border-l-4 border-black pl-2">
                  <div className="text-xs text-muted-foreground">Ngày Thuê</div>
                  <div className="font-bold text-sm">{profile.moveInDate ? formatDate(profile.moveInDate) : "N/A"}</div>
                </div>
                <div className="border-l-4 border-black pl-2">
                  <div className="text-xs text-muted-foreground">Tiền Cọc</div>
                  <div className="font-bold text-sm">{formatCurrency(unit.depositAmount || 0)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card neo-card p-4 text-center text-sm text-muted-foreground">
              Bạn chưa được gán phòng
            </div>
          )}
        </div>

        {/* Current Month Invoice - 1 column */}
        <div>
          <h2 className="text-base font-bold uppercase mb-2">Hóa Đơn Tháng Này</h2>
          <div className="bg-card neo-card p-4 transition-all hover:neo-shadow hover:-translate-y-0.5">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-xs text-muted-foreground mb-1">HÓA ĐƠN THÁNG NÀY</div>
              {currentMonthInvoice ? (
                <>
                  <div className="text-2xl font-bold mb-2">{formatCurrency(currentMonthInvoice.totalAmount)}</div>
                  <div className="text-xs text-muted-foreground mb-3">Hạn: {formatDate(currentMonthInvoice.dueDate)}</div>
                  {currentMonthInvoice.status !== 'paid' && (
                    <button 
                      onClick={() => router.push('/tenant/invoices')}
                      className="w-full bg-primary text-primary-foreground neo-button py-2 text-xs font-bold hover:neo-shadow transition-all"
                    >
                      THANH TOÁN
                    </button>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground py-4">Chưa có</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <section>
        <h2 className="text-base font-bold uppercase mb-2">Tình Trạng Thanh Toán</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div onClick={() => router.push('/tenant/invoices?tab=unpaid')} className="cursor-pointer">
            <div className="neo-card p-3 bg-orange-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <div className="text-xs text-orange-800 font-bold uppercase">Chưa Thanh Toán</div>
                  <div className="text-xl font-bold text-orange-900">{unpaidInvoices.length}</div>
                  <div className="text-xs text-orange-700">Tổng: {formatCurrency(totalUnpaidAmount)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div onClick={() => router.push('/tenant/invoices?tab=paid')} className="cursor-pointer">
            <div className="neo-card p-3 bg-green-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✓</div>
                <div className="flex-1">
                  <div className="text-xs text-green-800 font-bold uppercase">Đã Thanh Toán</div>
                  <div className="text-xl font-bold text-green-900">{paidInvoicesCount}</div>
                  <div className="text-xs text-green-700">Hóa đơn</div>
                </div>
              </div>
            </div>
          </div>

          <div onClick={() => router.push('/tenant/invoices')} className="cursor-pointer">
            <div className="neo-card p-3 bg-blue-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📊</div>
                <div className="flex-1">
                  <div className="text-xs text-blue-800 font-bold uppercase">Tất Cả</div>
                  <div className="text-xl font-bold text-blue-900">{unpaidInvoices.length + paidInvoicesCount}</div>
                  <div className="text-xs text-blue-700">Hóa đơn</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold uppercase">Yêu Cầu Bảo Trì</h2>
          <button 
            onClick={() => router.push('/tenant/maintenance?create=true')}
            className="bg-primary text-primary-foreground neo-button px-3 py-1 text-xs font-bold hover:neo-shadow transition-all"
          >
            + TẠO MỚI
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="neo-card p-3 bg-gray-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
            <div className="flex items-center gap-2">
              <div className="text-xl">🔧</div>
              <div>
                <div className="text-xs text-gray-800 font-bold">ĐANG XỬ LÝ</div>
                <div className="text-2xl font-bold text-gray-900">{processingTickets.length}</div>
              </div>
            </div>
          </div>
          <div className="neo-card p-3 bg-green-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
            <div className="flex items-center gap-2">
              <div className="text-xl">✓</div>
              <div>
                <div className="text-xs text-green-800 font-bold">HOÀN THÀNH</div>
                <div className="text-2xl font-bold text-green-900">{completedTickets.length}</div>
              </div>
            </div>
          </div>
          <div className="neo-card p-3 bg-purple-50 transition-all hover:neo-shadow hover:-translate-y-0.5">
            <div className="flex items-center gap-2">
              <div className="text-xl">📅</div>
              <div>
                <div className="text-xs text-purple-800 font-bold">GẦN NHẤT</div>
                <div className="text-sm font-bold text-purple-900">{lastTicket ? getTimeAgo(lastTicket.createdAt) : "Chưa có"}</div>
              </div>
            </div>
          </div>
        </div>
        {maintenanceTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {maintenanceTickets.map((ticket) => (
              <MaintenanceCard
                key={ticket._id}
                title={ticket.title}
                description={ticket.description}
                category={CATEGORY_NAMES[ticket.category] || ticket.category}
                priority={ticket.priority}
                status={ticket.status === 'new' || ticket.status === 'assigned' || ticket.status === 'in-progress' ? 'processing' : ticket.status}
                createdDate={formatDate(ticket.createdAt)}
                onView={() => router.push(`/tenant/maintenance?id=${ticket._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card neo-card p-3 text-center text-xs text-muted-foreground">
            Chưa có yêu cầu bảo trì
          </div>
        )}
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-base font-bold uppercase mb-2">Thông Báo Mới Nhất</h2>
        {notifications.length > 0 ? (
          <div className="bg-card neo-card overflow-hidden transition-all hover:neo-shadow">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif._id}
                icon={getNotificationIcon(notif.type)}
                title={notif.title}
                message={notif.message}
                timeAgo={getTimeAgo(notif.createdAt)}
                isNew={!notif.isRead}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card neo-card p-3 text-center text-xs text-muted-foreground">
            Không có thông báo mới
          </div>
        )}
      </section>
    </div>
  )
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'invoice': return '💰'
    case 'maintenance': return '🔧'
    case 'announcement': return '📢'
    case 'payment': return '✓'
    case 'contract': return '📋'
    default: return '🔔'
  }
}

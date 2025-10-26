"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getAllMaintenanceTickets,
  MaintenanceTicket,
  TICKET_STATUS_NAMES,
  PRIORITY_NAMES,
  CATEGORY_NAMES,
  type TicketListResponse
} from "@/lib/admin-maintenance-service"
import { TicketCard } from "@/components/admin/ticket-card"
import { TicketDetailsModal } from "@/components/admin/ticket-details-modal"
import { UpdateStatusModal } from "@/components/admin/update-status-modal"

export default function AdminMaintenancePage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Statistics from API
  const [statistics, setStatistics] = useState({
    total: 0,
    new: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  })
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)
  
  // Modals
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [currentPage, statusFilter, priorityFilter, categoryFilter, searchQuery])

  const loadTickets = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      const params: any = {
        page: currentPage,
        limit: 12,
      }

      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (categoryFilter) params.category = categoryFilter
      if (searchQuery) params.search = searchQuery

      const response = await getAllMaintenanceTickets(token, params)
      setTickets(response.tickets)
      setTotalPages(response.pagination.pages)
      setTotalTickets(response.pagination.total)
      
      // Update statistics from API
      if (response.statistics) {
        setStatistics({
          total: response.statistics.total || 0,
          new: response.statistics.new || 0,
          assigned: response.statistics.assigned || 0,
          inProgress: response.statistics.inProgress || 0,
          completed: response.statistics.completed || 0,
          rejected: response.statistics.rejected || 0
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu')
      console.error('Load tickets error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket)
    setShowUpdateModal(true)
  }

  const handleUpdateSuccess = () => {
    loadTickets()
    setShowUpdateModal(false)
  }

  const resetFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setCategoryFilter('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-2xl font-black uppercase">ĐANG TẢI...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">
            QUẢN LÝ BẢO TRÌ
          </h1>
          <p className="text-muted-foreground">Theo dõi và xử lý yêu cầu bảo trì từ khách thuê</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="neo-card p-4 bg-blue-50">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tổng Số</p>
            <p className="text-2xl font-black">{statistics.total}</p>
          </div>
          <div className="neo-card p-4 bg-red-50">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Mới</p>
            <p className="text-2xl font-black">{statistics.new}</p>
          </div>
          <div className="neo-card p-4 bg-yellow-50">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Đang Xử Lý</p>
            <p className="text-2xl font-black">{statistics.assigned + statistics.inProgress}</p>
          </div>
          <div className="neo-card p-4 bg-green-50">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Hoàn Thành</p>
            <p className="text-2xl font-black">{statistics.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="neo-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Trạng Thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full neo-input"
              >
                <option value="">Tất cả</option>
                <option value="new">Mới</option>
                <option value="assigned">Đã Gán</option>
                <option value="in-progress">Đang Xử Lý</option>
                <option value="completed">Hoàn Thành</option>
                <option value="rejected">Từ Chối</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Độ Ưu Tiên</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full neo-input"
              >
                <option value="">Tất cả</option>
                <option value="urgent">Khẩn Cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung Bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Loại Sự Cố</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full neo-input"
              >
                <option value="">Tất cả</option>
                <option value="plumbing">Ống Nước</option>
                <option value="electrical">Điện</option>
                <option value="structural">Kết Cấu</option>
                <option value="appliance">Thiết Bị</option>
                <option value="ventilation">Thông Gió</option>
                <option value="door-lock">Cửa/Khóa</option>
                <option value="paint">Sơn</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Tìm Kiếm</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo số phòng..."
                className="w-full neo-input"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="mt-4 neo-button bg-muted text-muted-foreground hover:bg-muted/80"
          >
            XÓA BỘ LỌC
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="neo-border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive font-bold uppercase">{error}</p>
          </div>
        )}

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <p className="text-muted-foreground font-bold">KHÔNG CÓ YÊU CẦU BẢO TRÌ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onViewDetails={() => handleViewDetails(ticket)}
                onUpdateStatus={() => handleUpdateStatus(ticket)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="neo-button bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              TRƯỚC
            </button>
            <span className="px-4 py-2 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="neo-button bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
            >
              SAU
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showUpdateModal && selectedTicket && (
        <UpdateStatusModal
          ticket={selectedTicket}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  )
}

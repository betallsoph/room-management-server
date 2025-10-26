"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MaintenanceCard } from "@/components/tenant/maintenance-card"
import {
  getTenantMaintenanceTickets,
  createMaintenanceTicket,
  formatDate,
  CATEGORY_NAMES,
  PRIORITY_NAMES,
  type MaintenanceTicket,
} from "@/lib/tenant-portal-service"

export default function MaintenancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("all")
  const [showForm, setShowForm] = useState(searchParams.get('create') === 'true')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const tabs = [
    { id: "processing", label: "Đang Xử Lý", statuses: ['pending', 'in-progress'] },
    { id: "completed", label: "Hoàn Thành", statuses: ['completed'] },
    { id: "cancelled", label: "Đã Hủy", statuses: ['cancelled'] },
    { id: "all", label: "Tất Cả", statuses: undefined },
  ]

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "tenant") {
      router.push("/login")
      return
    }

    loadTickets(token)
  }, [router, activeTab])

  async function loadTickets(token: string) {
    try {
      setLoading(true)
      setError(null)

      const data = await getTenantMaintenanceTickets(token)
      setTickets(data)
    } catch (err: any) {
      console.error("Load tickets error:", err)
      setError(err.message || "Không thể tải danh sách yêu cầu bảo trì")
      
      if (err.message?.includes("Unauthorized")) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.priority) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)

      await createMaintenanceTicket(token, formData)
      
      // Reset form and reload tickets
      setFormData({ title: "", description: "", category: "", priority: "" })
      setShowForm(false)
      await loadTickets(token)
    } catch (err: any) {
      console.error("Create ticket error:", err)
      setFormError(err.message || "Không thể tạo yêu cầu bảo trì")
    } finally {
      setSubmitting(false)
    }
  }

  // Filter tickets by active tab
  const currentTab = tabs.find(t => t.id === activeTab)
  const filteredTickets = currentTab?.statuses
    ? tickets.filter(ticket => currentTab.statuses!.includes(ticket.status))
    : tickets

  function getDisplayCategory(category: string): string {
    return CATEGORY_NAMES[category] || category
  }

  function getDisplayStatus(status: string): 'processing' | 'completed' | 'cancelled' | 'rejected' {
    if (status === 'new' || status === 'assigned' || status === 'in-progress') return 'processing'
    if (status === 'completed') return 'completed'
    if (status === 'rejected') return 'rejected'
    return 'cancelled'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-bold uppercase">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold uppercase">Yêu Cầu Bảo Trì</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground neo-button px-4 py-2 text-sm font-bold uppercase"
          >
            {showForm ? "Đóng Form" : "+ Tạo Yêu Cầu"}
          </button>
        </div>

        {/* Create Request Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card neo-card p-4 mb-4 space-y-4">
            <h3 className="text-base font-bold uppercase">Tạo Yêu Cầu Bảo Trì Mới</h3>
            
            {formError && (
              <div className="bg-destructive/10 neo-border border-destructive p-3">
                <div className="text-destructive text-sm font-bold">{formError}</div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Tiêu Đề *</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề yêu cầu..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm neo-input bg-background text-foreground"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Danh Mục *</label>
                  <select 
                    className="w-full px-3 py-2 text-sm neo-input bg-background text-foreground"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Chọn danh mục...</option>
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
                  <label className="block text-xs font-bold uppercase mb-1">Mức Độ Ưu Tiên *</label>
                  <select 
                    className="w-full px-3 py-2 text-sm neo-input bg-background text-foreground"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="">Chọn mức độ...</option>
                    <option value="urgent">Khẩn Cấp</option>
                    <option value="high">Cao</option>
                    <option value="medium">Trung Bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Mô Tả Chi Tiết *</label>
                <textarea
                  placeholder="Mô tả chi tiết vấn đề..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm neo-input bg-background text-foreground"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormError(null)
                    setFormData({ title: "", description: "", category: "", priority: "" })
                  }}
                  className="flex-1 bg-muted neo-button py-2 text-sm font-bold uppercase"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground neo-button py-2 text-sm font-bold uppercase"
                  disabled={submitting}
                >
                  {submitting ? "Đang Gửi..." : "Gửi Yêu Cầu"}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 neo-card p-3">
          <div className="text-destructive text-sm font-bold uppercase mb-1">Lỗi</div>
          <div className="text-xs text-muted-foreground">{error}</div>
        </div>
      )}

      {/* Filters */}
      <section>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 neo-border font-bold uppercase text-xs ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground neo-shadow"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Request List */}
      <section>
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <MaintenanceCard
                key={ticket._id}
                title={ticket.title}
                description={ticket.description}
                category={getDisplayCategory(ticket.category)}
                priority={ticket.priority}
                status={getDisplayStatus(ticket.status)}
                createdDate={formatDate(ticket.createdAt)}
                onView={() => console.log("View ticket", ticket._id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card neo-card p-4 text-center text-sm text-muted-foreground">
            Chưa có yêu cầu bảo trì nào
          </div>
        )}
      </section>
    </div>
  )
}

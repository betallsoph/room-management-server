"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TenantTable from "@/components/admin/tenant-table"
import TenantModal from "@/components/admin/tenant-modal"
import { getTenants, deleteTenant, type Tenant } from "@/lib/tenant-service"

export default function TenantsPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTenants, setTotalTenants] = useState(0)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "admin") {
      router.push("/login")
      return
    }

    loadTenants(token)
  }, [router, statusFilter, searchTerm, currentPage])

  const loadTenants = async (token: string) => {
    try {
      setLoading(true)
      setError("")
      
      const response = await getTenants(
        token,
        currentPage,
        20,
        statusFilter || undefined,
        searchTerm || undefined
      )
      
      setTenants(response.tenants)
      setTotalPages(response.pagination.pages)
      setTotalTenants(response.pagination.total)
    } catch (err: any) {
      console.error("Failed to load tenants:", err)
      setError(err.message || "Lỗi tải danh sách người thuê")
      
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => router.push("/login"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddTenant = () => {
    setEditingTenant(null)
    setIsModalOpen(true)
  }

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setIsModalOpen(true)
  }

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người thuê này?")) {
      return
    }

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) return

    try {
      await deleteTenant(token, tenantId)
      await loadTenants(token)
      alert("Đã xóa người thuê thành công!")
    } catch (err: any) {
      console.error("Failed to delete tenant:", err)
      alert(err.message || "Lỗi xóa người thuê")
    }
  }

  const handleModalClose = async (shouldReload: boolean = false) => {
    setIsModalOpen(false)
    setEditingTenant(null)
    
    if (shouldReload) {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (token) {
        await loadTenants(token)
      }
    }
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
  }

  if (loading && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neo-card bg-card p-8">
          <p className="text-xl font-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error && tenants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neo-card bg-destructive p-8">
          <p className="text-xl font-bold text-destructive-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">QUẢN LÝ NGƯỜI THUÊ</h1>
        <button
          onClick={handleAddTenant}
          className="neo-button bg-primary text-primary-foreground px-6 py-3"
        >
          + Thêm Người Thuê
        </button>
      </div>

      {/* Filters */}
      <div className="neo-card bg-card p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="neo-input w-full px-4 py-2 bg-input"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilterChange("")}
              className={`neo-button px-4 py-2 text-sm ${
                statusFilter === "" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-foreground"
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => handleStatusFilterChange("active")}
              className={`neo-button px-4 py-2 text-sm ${
                statusFilter === "active" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-muted text-foreground"
              }`}
            >
              Đang Thuê
            </button>
            <button
              onClick={() => handleStatusFilterChange("moved-out")}
              className={`neo-button px-4 py-2 text-sm ${
                statusFilter === "moved-out" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-muted text-foreground"
              }`}
            >
              Đã Chuyển Đi
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="neo-card bg-blue-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tổng Số</p>
          <p className="text-2xl font-black">{totalTenants}</p>
        </div>
        <div className="neo-card bg-emerald-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Đang Thuê</p>
          <p className="text-2xl font-black">
            {tenants.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="neo-card bg-gray-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Đã Chuyển Đi</p>
          <p className="text-2xl font-black">
            {tenants.filter(t => t.status === 'moved-out').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <TenantTable 
        tenants={tenants} 
        onEdit={handleEditTenant}
        onDelete={handleDeleteTenant}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="neo-button bg-muted text-foreground px-4 py-2 text-sm disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="neo-card bg-card px-4 py-2 font-bold">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="neo-button bg-muted text-foreground px-4 py-2 text-sm disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <TenantModal 
          tenant={editingTenant}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

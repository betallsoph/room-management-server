"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import RoomTable from "@/components/admin/room-table"
import RoomModal from "@/components/admin/room-modal"
import { getUnits, deleteUnit, type Unit } from "@/lib/unit-service"

export default function RoomsPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  
  // Filters
  const [buildingFilter, setBuildingFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUnits, setTotalUnits] = useState(0)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "admin") {
      router.push("/login")
      return
    }

    loadUnits(token)
  }, [router, buildingFilter, statusFilter, roomTypeFilter, currentPage])

  const loadUnits = async (token: string) => {
    try {
      setLoading(true)
      setError("")
      
      const response = await getUnits(
        token,
        currentPage,
        20,
        buildingFilter || undefined,
        statusFilter || undefined,
        undefined,
        roomTypeFilter || undefined
      )
      
      setUnits(response.units)
      setTotalPages(response.pagination.pages)
      setTotalUnits(response.pagination.total)
    } catch (err: any) {
      console.error("Failed to load units:", err)
      setError(err.message || "Lỗi tải danh sách phòng")
      
      if (err.message.includes("Unauthorized")) {
        setTimeout(() => router.push("/login"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = () => {
    setEditingUnit(null)
    setIsModalOpen(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit)
    setIsModalOpen(true)
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này? (Phòng sẽ chuyển sang trạng thái Bảo Trì)")) {
      return
    }

    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) return

    try {
      await deleteUnit(token, unitId)
      await loadUnits(token)
      alert("Đã xóa phòng thành công!")
    } catch (err: any) {
      console.error("Failed to delete unit:", err)
      alert(err.message || "Lỗi xóa phòng")
    }
  }

  const handleModalClose = async (shouldReload: boolean = false) => {
    setIsModalOpen(false)
    setEditingUnit(null)
    
    if (shouldReload) {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      if (token) {
        await loadUnits(token)
      }
    }
  }

  const handleBuildingFilterChange = (building: string) => {
    setBuildingFilter(building)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleRoomTypeFilterChange = (roomType: string) => {
    setRoomTypeFilter(roomType)
    setCurrentPage(1)
  }

  // Get unique buildings from units
  const buildings = Array.from(new Set(units.map(u => u.building))).sort()

  if (loading && units.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neo-card bg-card p-8">
          <p className="text-xl font-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error && units.length === 0) {
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
        <h1 className="text-3xl font-black">QUẢN LÝ PHÒNG</h1>
        <button
          onClick={handleAddUnit}
          className="neo-button bg-primary text-primary-foreground px-6 py-3"
        >
          + Thêm Phòng
        </button>
      </div>

      {/* Filters */}
      <div className="neo-card bg-card p-4">
        <div className="flex gap-4 flex-wrap items-center">
          {/* Building Filter */}
          <div>
            <label className="block font-bold mb-2 text-sm">Tòa Nhà</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleBuildingFilterChange("")}
                className={`neo-button px-4 py-2 text-sm ${
                  buildingFilter === "" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Tất Cả
              </button>
              {['A', 'B', 'C'].map(building => (
                <button
                  key={building}
                  onClick={() => handleBuildingFilterChange(building)}
                  className={`neo-button px-4 py-2 text-sm ${
                    buildingFilter === building 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  }`}
                >
                  Tòa {building}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-bold mb-2 text-sm">Trạng Thái</label>
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
                onClick={() => handleStatusFilterChange("available")}
                className={`neo-button px-4 py-2 text-sm ${
                  statusFilter === "available" 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Trống
              </button>
              <button
                onClick={() => handleStatusFilterChange("occupied")}
                className={`neo-button px-4 py-2 text-sm ${
                  statusFilter === "occupied" 
                    ? "bg-secondary text-secondary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Có Người
              </button>
              <button
                onClick={() => handleStatusFilterChange("maintenance")}
                className={`neo-button px-4 py-2 text-sm ${
                  statusFilter === "maintenance" 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Bảo Trì
              </button>
            </div>
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block font-bold mb-2 text-sm">Loại Phòng</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleRoomTypeFilterChange("")}
                className={`neo-button px-3 py-2 text-sm ${
                  roomTypeFilter === "" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => handleRoomTypeFilterChange("studio")}
                className={`neo-button px-3 py-2 text-sm ${
                  roomTypeFilter === "studio" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                Studio
              </button>
              <button
                onClick={() => handleRoomTypeFilterChange("one-bedroom")}
                className={`neo-button px-3 py-2 text-sm ${
                  roomTypeFilter === "one-bedroom" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                1PN
              </button>
              <button
                onClick={() => handleRoomTypeFilterChange("two-bedroom")}
                className={`neo-button px-3 py-2 text-sm ${
                  roomTypeFilter === "two-bedroom" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}
              >
                2PN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neo-card bg-blue-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tổng Số Phòng</p>
          <p className="text-2xl font-black">{totalUnits}</p>
        </div>
        <div className="neo-card bg-pink-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Phòng Trống</p>
          <p className="text-2xl font-black">
            {units.filter(u => u.status === 'available').length}
          </p>
        </div>
        <div className="neo-card bg-emerald-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Có Người</p>
          <p className="text-2xl font-black">
            {units.filter(u => u.status === 'occupied').length}
          </p>
        </div>
        <div className="neo-card bg-orange-50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Bảo Trì</p>
          <p className="text-2xl font-black">
            {units.filter(u => u.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <RoomTable 
        units={units} 
        onEdit={handleEditUnit}
        onDelete={handleDeleteUnit}
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
        <RoomModal 
          unit={editingUnit}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

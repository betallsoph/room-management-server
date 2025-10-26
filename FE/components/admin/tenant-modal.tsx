"use client"

import { useState, useEffect } from "react"
import { type Tenant, createTenant, updateTenant, getAvailableUnits, type TenantUnit } from "@/lib/tenant-service"

interface TenantModalProps {
  tenant?: Tenant | null
  onClose: (shouldReload?: boolean) => void
}

export default function TenantModal({ tenant, onClose }: TenantModalProps) {
  const isEditMode = !!tenant
  
  // Form fields
  const [userId, setUserId] = useState("")
  const [identityCard, setIdentityCard] = useState("")
  const [phone, setPhone] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [currentUnit, setCurrentUnit] = useState<string>("")
  const [moveInDate, setMoveInDate] = useState("")
  const [moveOutDate, setMoveOutDate] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "moved-out">("active")
  
  const [availableUnits, setAvailableUnits] = useState<TenantUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (token) {
      loadAvailableUnits(token)
    }

    if (tenant) {
      // Populate form with existing tenant data
      if (typeof tenant.userId === 'object' && tenant.userId) {
        setUserId(tenant.userId._id)
      }
      setIdentityCard(tenant.identityCard || "")
      setPhone(tenant.phone || "")
      
      if (tenant.emergencyContact) {
        setEmergencyContactName(tenant.emergencyContact.name || "")
        setEmergencyContactPhone(tenant.emergencyContact.phone || "")
      }
      
      if (tenant.currentUnit) {
        if (typeof tenant.currentUnit === 'object') {
          setCurrentUnit(tenant.currentUnit._id)
        } else {
          setCurrentUnit(tenant.currentUnit)
        }
      }
      
      // Format dates for input[type="date"]
      if (tenant.moveInDate) {
        const date = new Date(tenant.moveInDate)
        setMoveInDate(date.toISOString().split('T')[0])
      }
      
      if (tenant.moveOutDate) {
        const date = new Date(tenant.moveOutDate)
        setMoveOutDate(date.toISOString().split('T')[0])
      }
      
      setStatus(tenant.status)
    }
  }, [tenant])

  const loadAvailableUnits = async (token: string) => {
    try {
      const units = await getAvailableUnits(token)
      setAvailableUnits(units)
    } catch (err) {
      console.error("Failed to load units:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      setError("Vui lòng đăng nhập lại")
      return
    }

    // Validation
    if (!isEditMode && !userId) {
      setError("Vui lòng nhập User ID")
      return
    }

    if (!phone) {
      setError("Vui lòng nhập số điện thoại")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (isEditMode && tenant) {
        // Update existing tenant
        const updates: any = {
          phone,
          status,
        }

        if (emergencyContactName && emergencyContactPhone) {
          updates.emergencyContact = {
            name: emergencyContactName,
            phone: emergencyContactPhone,
          }
        }

        if (currentUnit) {
          updates.currentUnit = currentUnit
        }

        if (moveInDate) {
          updates.moveInDate = moveInDate
        }

        if (moveOutDate) {
          updates.moveOutDate = moveOutDate
        }

        await updateTenant(token, tenant._id, updates)
        alert("Cập nhật người thuê thành công!")
        onClose(true)
      } else {
        // Create new tenant
        const tenantData: any = {
          userId,
          identityCard,
          phone,
        }

        if (emergencyContactName && emergencyContactPhone) {
          tenantData.emergencyContact = {
            name: emergencyContactName,
            phone: emergencyContactPhone,
          }
        }

        if (currentUnit) {
          tenantData.currentUnit = currentUnit
        }

        if (moveInDate) {
          tenantData.moveInDate = moveInDate
        }

        await createTenant(token, tenantData)
        alert("Thêm người thuê thành công!")
        onClose(true)
      }
    } catch (err: any) {
      console.error("Form submit error:", err)
      setError(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="neo-card bg-card p-8 w-full max-w-2xl animate-bounce-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black mb-6">
          {isEditMode ? "CHỈNH SỬA NGƯỜI THUÊ" : "THÊM NGƯỜI THUÊ MỚI"}
        </h2>
        
        {error && (
          <div className="neo-card bg-destructive text-destructive-foreground p-4 mb-4">
            <p className="font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditMode && (
            <div>
              <label className="block font-bold mb-2">User ID *</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
                placeholder="VD: 507f1f77bcf86cd799439011"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                ID của user đã đăng ký trong hệ thống
              </p>
            </div>
          )}

          {!isEditMode && (
            <div>
              <label className="block font-bold mb-2">Số CCCD/CMND *</label>
              <input
                type="text"
                value={identityCard}
                onChange={(e) => setIdentityCard(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
                placeholder="VD: 001234567890"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-2">Số Điện Thoại *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="neo-input w-full px-4 py-2 bg-input"
              placeholder="VD: 0912345678"
              required
            />
          </div>

          <div className="neo-card bg-muted p-4">
            <h3 className="font-black mb-3">Liên Hệ Khẩn Cấp</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-2">Tên Người Liên Hệ</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="neo-input w-full px-4 py-2 bg-input"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="neo-input w-full px-4 py-2 bg-input"
                  placeholder="VD: 0987654321"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Phòng</label>
            <select
              value={currentUnit}
              onChange={(e) => setCurrentUnit(e.target.value)}
              className="neo-input w-full px-4 py-2 bg-input"
            >
              <option value="">-- Chưa phân phòng --</option>
              {availableUnits.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.unitNumber} - Tầng {unit.floor} - Tòa {unit.building}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Ngày Vào Ở</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Ngày bắt đầu thuê phòng
              </p>
            </div>

            <div>
              <label className="block font-bold mb-2">Ngày Chuyển Đi</label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
                min={moveInDate || undefined}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Ngày kết thúc thuê (nếu có)
              </p>
            </div>
          </div>

          {isEditMode && (
            <div>
              <label className="block font-bold mb-2">Trạng Thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="neo-input w-full px-4 py-2 bg-input"
              >
                <option value="active">Đang Thuê</option>
                <option value="inactive">Không Hoạt Động</option>
                <option value="moved-out">Đã Chuyển Đi</option>
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 neo-button bg-muted text-foreground py-3"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 neo-button bg-primary text-primary-foreground py-3"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : isEditMode ? "Cập Nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

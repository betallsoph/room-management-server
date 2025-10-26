"use client"

import { useState, useEffect } from "react"
import { type Unit, createUnit, updateUnit, ROOM_TYPE_NAMES } from "@/lib/unit-service"

interface RoomModalProps {
  unit?: Unit | null
  onClose: (shouldReload?: boolean) => void
}

export default function RoomModal({ unit, onClose }: RoomModalProps) {
  const isEditMode = !!unit
  
  // Form fields
  const [unitNumber, setUnitNumber] = useState("")
  const [building, setBuilding] = useState("A")
  const [floor, setFloor] = useState(1)
  const [squareMeters, setSquareMeters] = useState(25)
  const [roomType, setRoomType] = useState<"studio" | "one-bedroom" | "two-bedroom" | "three-bedroom">("studio")
  const [rentPrice, setRentPrice] = useState(3000000)
  const [depositAmount, setDepositAmount] = useState(6000000)
  const [amenities, setAmenities] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"available" | "occupied" | "maintenance" | "rented-out">("available")
  
  // Amenities checkboxes
  const [hasAC, setHasAC] = useState(false)
  const [hasWaterHeater, setHasWaterHeater] = useState(false)
  const [hasWiFi, setHasWiFi] = useState(false)
  const [hasBalcony, setHasBalcony] = useState(false)
  const [hasKitchen, setHasKitchen] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (unit) {
      // Populate form with existing unit data
      setUnitNumber(unit.unitNumber)
      setBuilding(unit.building)
      setFloor(unit.floor)
      setSquareMeters(unit.squareMeters)
      setRoomType(unit.roomType)
      setRentPrice(unit.rentPrice)
      setDepositAmount(unit.depositAmount)
      setDescription(unit.description || "")
      setStatus(unit.status)
      
      // Set amenities checkboxes
      const unitAmenities = unit.amenities || []
      setHasAC(unitAmenities.includes("Điều hòa"))
      setHasWaterHeater(unitAmenities.includes("Nóng lạnh"))
      setHasWiFi(unitAmenities.includes("WiFi"))
      setHasBalcony(unitAmenities.includes("Ban công"))
      setHasKitchen(unitAmenities.includes("Bếp riêng"))
    }
  }, [unit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) {
      setError("Vui lòng đăng nhập lại")
      return
    }

    // Validation
    if (!unitNumber.trim()) {
      setError("Vui lòng nhập số phòng")
      return
    }

    if (rentPrice <= 0) {
      setError("Giá thuê phải lớn hơn 0")
      return
    }

    // Build amenities array
    const selectedAmenities: string[] = []
    if (hasAC) selectedAmenities.push("Điều hòa")
    if (hasWaterHeater) selectedAmenities.push("Nóng lạnh")
    if (hasWiFi) selectedAmenities.push("WiFi")
    if (hasBalcony) selectedAmenities.push("Ban công")
    if (hasKitchen) selectedAmenities.push("Bếp riêng")

    setLoading(true)
    setError("")

    try {
      if (isEditMode && unit) {
        // Update existing unit
        const updates: any = {
          unitNumber,
          building,
          floor,
          squareMeters,
          roomType,
          rentPrice,
          depositAmount,
          amenities: selectedAmenities,
          description,
          status,
        }

        await updateUnit(token, unit._id, updates)
        alert("Cập nhật phòng thành công!")
        onClose(true)
      } else {
        // Create new unit
        const unitData: any = {
          unitNumber,
          building,
          floor,
          squareMeters,
          roomType,
          rentPrice,
          depositAmount,
          amenities: selectedAmenities,
          description,
        }

        await createUnit(token, unitData)
        alert("Thêm phòng thành công!")
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
      <div className="neo-card bg-card p-8 w-full max-w-3xl animate-bounce-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black mb-6">
          {isEditMode ? "CHỈNH SỬA PHÒNG" : "THÊM PHÒNG MỚI"}
        </h2>
        
        {error && (
          <div className="neo-card bg-destructive text-destructive-foreground p-4 mb-4">
            <p className="font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số phòng */}
            <div>
              <label className="block font-bold mb-2">Số Phòng *</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
                placeholder="VD: 101"
                required
              />
            </div>

            {/* Tòa nhà */}
            <div>
              <label className="block font-bold mb-2">Tòa Nhà *</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="neo-input w-full px-4 py-2 bg-input"
                required
              >
                <option value="A">Tòa A</option>
                <option value="B">Tòa B</option>
                <option value="C">Tòa C</option>
              </select>
            </div>

            {/* Tầng */}
            <div>
              <label className="block font-bold mb-2">Tầng *</label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value))}
                className="neo-input w-full px-4 py-2 bg-input"
                min="1"
                max="20"
                required
              />
            </div>

            {/* Diện tích */}
            <div>
              <label className="block font-bold mb-2">Diện Tích (m²) *</label>
              <input
                type="number"
                value={squareMeters}
                onChange={(e) => setSquareMeters(parseFloat(e.target.value))}
                className="neo-input w-full px-4 py-2 bg-input"
                min="10"
                step="0.5"
                required
              />
            </div>

            {/* Loại phòng */}
            <div>
              <label className="block font-bold mb-2">Loại Phòng *</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as any)}
                className="neo-input w-full px-4 py-2 bg-input"
                required
              >
                <option value="studio">Studio</option>
                <option value="one-bedroom">1 Phòng Ngủ</option>
                <option value="two-bedroom">2 Phòng Ngủ</option>
                <option value="three-bedroom">3 Phòng Ngủ</option>
              </select>
            </div>

            {/* Giá thuê */}
            <div>
              <label className="block font-bold mb-2">Giá Thuê/Tháng (VNĐ) *</label>
              <input
                type="number"
                value={rentPrice}
                onChange={(e) => setRentPrice(parseInt(e.target.value))}
                className="neo-input w-full px-4 py-2 bg-input"
                min="0"
                step="100000"
                required
              />
            </div>

            {/* Tiền cọc */}
            <div>
              <label className="block font-bold mb-2">Tiền Cọc (VNĐ) *</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                className="neo-input w-full px-4 py-2 bg-input"
                min="0"
                step="100000"
                required
              />
            </div>

            {/* Trạng thái (chỉ khi edit) */}
            {isEditMode && (
              <div>
                <label className="block font-bold mb-2">Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="neo-input w-full px-4 py-2 bg-input"
                >
                  <option value="available">Trống</option>
                  <option value="occupied">Có Người</option>
                  <option value="maintenance">Bảo Trì</option>
                  <option value="rented-out">Đã Cho Thuê</option>
                </select>
              </div>
            )}
          </div>

          {/* Tiện nghi */}
          <div className="neo-card bg-muted p-4">
            <h3 className="font-black mb-3">Tiện Nghi</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAC}
                  onChange={(e) => setHasAC(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">Điều hòa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWaterHeater}
                  onChange={(e) => setHasWaterHeater(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">Nóng lạnh</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWiFi}
                  onChange={(e) => setHasWiFi(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">WiFi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBalcony}
                  onChange={(e) => setHasBalcony(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">Ban công</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasKitchen}
                  onChange={(e) => setHasKitchen(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold text-sm">Bếp riêng</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block font-bold mb-2">Mô Tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input w-full px-4 py-2 bg-input"
              placeholder="Mô tả chi tiết về phòng..."
              rows={3}
            />
          </div>

          {/* Buttons */}
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
              {loading ? "Đang xử lý..." : isEditMode ? "Cập Nhật" : "Thêm Phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

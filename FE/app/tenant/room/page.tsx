"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getTenantProfile,
  getTenantContract,
  formatCurrency,
  formatDate,
  ROOM_TYPE_NAMES,
  type TenantProfile,
  type Contract,
} from "@/lib/tenant-portal-service"

export default function MyRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "tenant") {
      router.push("/login")
      return
    }

    loadRoomData(token)
  }, [router])

  async function loadRoomData(token: string) {
    try {
      setLoading(true)
      setError(null)
      
      const [profileData, contractData] = await Promise.all([
        getTenantProfile(token),
        getTenantContract(token)
      ])
      
      setProfile(profileData)
      setContract(contractData)
    } catch (err: any) {
      console.error("Failed to load room data:", err)
      setError(err.message || "Không thể tải thông tin phòng")
      
      if (err.message?.includes("Unauthorized")) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

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

  if (!profile || !profile.currentUnit) {
    return (
      <div className="bg-muted neo-card p-6 text-center">
        <div className="text-2xl mb-2">🏠</div>
        <div className="font-bold uppercase mb-2">Chưa Có Phòng</div>
        <div className="text-sm text-muted-foreground">
          Bạn chưa được gán phòng nào. Vui lòng liên hệ quản lý.
        </div>
      </div>
    )
  }

  const unit = profile.currentUnit

  return (
    <div className="space-y-3 animate-slide-up">
      <h1 className="text-xl font-black mb-3">PHÒNG CỦA TÔI</h1>

      {/* Room Header - Compact */}
      <div className="bg-card neo-card p-4 transition-all hover:neo-shadow hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏠</div>
            <div>
              <h2 className="text-xl font-bold">PHÒNG {unit.unitNumber} - TÒA {unit.building}</h2>
              <p className="text-sm text-muted-foreground">
                {ROOM_TYPE_NAMES[unit.roomType] || unit.roomType}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 neo-border font-bold text-xs ${
            unit.status === 'occupied' 
              ? 'bg-green-100 text-green-900 border-green-900' 
              : 'bg-yellow-100 text-yellow-900 border-yellow-900'
          }`}>
            {unit.status === 'occupied' ? '✓ ĐANG Ở' : (unit.status?.toUpperCase() || 'N/A')}
          </div>
        </div>

        {/* Quick Stats - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-l-4 border-black pl-2">
            <div className="text-xs text-muted-foreground uppercase">Diện Tích</div>
            <div className="text-lg font-bold">{unit.squareMeters || 0} m²</div>
          </div>
          <div className="border-l-4 border-black pl-2">
            <div className="text-xs text-muted-foreground uppercase">Giá Thuê</div>
            <div className="text-lg font-bold">{formatCurrency(unit.rentPrice || 0)}</div>
            <div className="text-xs text-muted-foreground">/ tháng</div>
          </div>
          <div className="border-l-4 border-black pl-2">
            <div className="text-xs text-muted-foreground uppercase">Ngày Thuê</div>
            <div className="text-sm font-bold">
              {profile.moveInDate ? formatDate(profile.moveInDate) : "N/A"}
            </div>
          </div>
          <div className="border-l-4 border-black pl-2">
            <div className="text-xs text-muted-foreground uppercase">Tiền Cọc</div>
            <div className="text-lg font-bold">{formatCurrency(unit.depositAmount || 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Room Details */}
        <div className="bg-card neo-card p-3 transition-all hover:neo-shadow hover:-translate-y-0.5">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span>📋</span> CHI TIẾT PHÒNG
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Số Phòng:</span>
              <span className="text-sm font-bold">{unit.unitNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Tòa Nhà:</span>
              <span className="text-sm font-bold">{unit.building}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Tầng:</span>
              <span className="text-sm font-bold">{unit.floor || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Diện Tích:</span>
              <span className="text-sm font-bold">{unit.squareMeters} m²</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Loại Phòng:</span>
              <span className="text-sm font-bold">{ROOM_TYPE_NAMES[unit.roomType] || unit.roomType}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Trạng Thái:</span>
              <span className="text-sm font-bold">{unit.status === 'occupied' ? 'Đang Ở' : unit.status}</span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-card neo-card p-3 transition-all hover:neo-shadow hover:-translate-y-0.5">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span>💰</span> THÔNG TIN TÀI CHÍNH
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Giá Thuê/Tháng:</span>
              <span className="text-sm font-bold">{formatCurrency(unit.rentPrice || 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Tiền Cọc:</span>
              <span className="text-sm font-bold">{formatCurrency(unit.depositAmount || 0)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Tiền Điện:</span>
              <span className="text-sm font-bold">{formatCurrency(unit.electricityRate || 3500)}/kWh</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-xs text-muted-foreground">Tiền Nước:</span>
              <span className="text-sm font-bold">{formatCurrency(unit.waterRate || 15000)}/m³</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Internet:</span>
              <span className="text-sm font-bold">{formatCurrency(unit.internetRate || 100000)}/tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-card neo-card p-3 transition-all hover:neo-shadow hover:-translate-y-0.5">
        <h3 className="text-sm font-black mb-2 flex items-center gap-2">
          <span>📝</span> THÔNG TIN HỢP ĐỒNG
        </h3>
        {contract ? (
          <div className="space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="border-l-4 border-black pl-2">
                <div className="text-xs text-muted-foreground uppercase">Mã Hợp Đồng</div>
                <div className="text-sm font-bold">{contract.contractNumber}</div>
              </div>
              <div className="border-l-4 border-black pl-2">
                <div className="text-xs text-muted-foreground uppercase">Ngày Bắt Đầu</div>
                <div className="text-sm font-bold">{formatDate(contract.startDate)}</div>
              </div>
              <div className="border-l-4 border-black pl-2">
                <div className="text-xs text-muted-foreground uppercase">Ngày Kết Thúc</div>
                <div className="text-sm font-bold">{formatDate(contract.endDate)}</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-3 pt-2 border-t-2 border-black">
              <div className="flex justify-between py-1.5 border-b border-gray-300">
                <span className="text-xs text-muted-foreground">Giá Thuê Hợp Đồng:</span>
                <span className="text-sm font-bold">{formatCurrency(contract.rentAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-300">
                <span className="text-xs text-muted-foreground">Tiền Cọc:</span>
                <span className="text-sm font-bold">{formatCurrency(contract.depositAmount)}</span>
              </div>
            </div>

            <div className="border-l-4 border-black pl-2">
              <div className="text-xs text-muted-foreground uppercase mb-1.5">Tiện Ích Trong Hợp Đồng</div>
              <div className="flex flex-wrap gap-1.5">
                {contract.utilities.electricity && (
                  <span className="px-1.5 py-0.5 bg-yellow-100 border-2 border-yellow-900 text-yellow-900 text-xs font-bold">
                    ⚡ ĐIỆN
                  </span>
                )}
                {contract.utilities.water && (
                  <span className="px-1.5 py-0.5 bg-blue-100 border-2 border-blue-900 text-blue-900 text-xs font-bold">
                    💧 NƯỚC
                  </span>
                )}
                {contract.utilities.internet && (
                  <span className="px-1.5 py-0.5 bg-purple-100 border-2 border-purple-900 text-purple-900 text-xs font-bold">
                    📡 INTERNET
                  </span>
                )}
                {contract.utilities.parking && (
                  <span className="px-1.5 py-0.5 bg-green-100 border-2 border-green-900 text-green-900 text-xs font-bold">
                    🅿️ BÃI ĐỖ XE
                  </span>
                )}
              </div>
            </div>

            <div className="border-l-4 border-black pl-2">
              <div className="text-xs text-muted-foreground uppercase">Trạng Thái Hợp Đồng</div>
              <div className={`inline-block px-1.5 py-0.5 neo-border text-xs font-bold mt-1 ${
                contract.status === 'active' 
                  ? 'bg-green-100 text-green-900 border-green-900' 
                  : contract.status === 'expired'
                  ? 'bg-red-100 text-red-900 border-red-900'
                  : 'bg-yellow-100 text-yellow-900 border-yellow-900'
              }`}>
                {contract.status === 'active' ? '✓ HOẠT ĐỘNG' : 
                 contract.status === 'expired' ? '⚠ HẾT HẠN' : 
                 contract.status === 'terminated' ? '❌ CHẤM DỨT' : 
                 '⏳ CHỜ DUYỆT'}
              </div>
            </div>

            {contract.landlord && (
              <div className="border-l-4 border-black pl-2">
                <div className="text-xs text-muted-foreground uppercase mb-1.5">Thông Tin Chủ Nhà</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{contract.landlord.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    📧 {contract.landlord.email}
                  </div>
                  {contract.landlord.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      📞 {contract.landlord.phone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <div className="text-2xl mb-1">📄</div>
            <div className="text-sm font-bold">Chưa Có Hợp Đồng</div>
            <div className="text-xs">Bạn chưa có hợp đồng thuê đang hoạt động</div>
          </div>
        )}
      </div>

      {/* Amenities */}
      {unit.amenities && unit.amenities.length > 0 && (
        <div className="bg-card neo-card p-3 transition-all hover:neo-shadow hover:-translate-y-0.5">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span>✨</span> TIỆN ÍCH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {unit.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-1.5 p-1.5 bg-muted neo-border text-xs">
                <span>✓</span>
                <span className="font-bold">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {unit.description && (
        <div className="bg-card neo-card p-3 transition-all hover:neo-shadow hover:-translate-y-0.5">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span>📝</span> MÔ TÃ
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {unit.description}
          </p>
        </div>
      )}

      {/* Actions - Compact */}
      <div className="grid md:grid-cols-2 gap-3">
        <button 
          onClick={() => router.push('/tenant/invoices')}
          className="bg-primary text-primary-foreground neo-button py-2 text-sm font-bold uppercase hover:neo-shadow hover:-translate-y-0.5 transition-all"
        >
          💰 Xem Hóa Đơn
        </button>
        <button 
          onClick={() => router.push('/tenant/maintenance?create=true')}
          className="bg-muted neo-button py-2 text-sm font-bold uppercase hover:neo-shadow hover:-translate-y-0.5 transition-all"
        >
          🔧 Báo Cáo Sự Cố
        </button>
      </div>
    </div>
  )
}

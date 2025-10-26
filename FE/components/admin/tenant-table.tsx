"use client"

import { useState } from "react"
import { type Tenant } from "@/lib/tenant-service"

interface TenantTableProps {
  tenants: Tenant[]
  onEdit: (tenant: Tenant) => void
  onDelete: (tenantId: string) => void
}

const statusMap = {
  "active": "Đang Thuê",
  "inactive": "Không Hoạt Động",
  "moved-out": "Đã Chuyển Đi",
}

const statusColors = {
  "active": "bg-accent text-accent-foreground",
  "inactive": "bg-muted text-foreground",
  "moved-out": "bg-secondary text-secondary-foreground",
}

export default function TenantTable({ tenants, onEdit, onDelete }: TenantTableProps) {
  const [viewingDocuments, setViewingDocuments] = useState<Tenant | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  const baseUrl = apiUrl.replace('/api', '')

  const getUserName = (tenant: Tenant): string => {
    if (typeof tenant.userId === 'object' && tenant.userId) {
      return tenant.userId.fullName || 'N/A'
    }
    return 'N/A'
  }

  const getUserEmail = (tenant: Tenant): string => {
    if (typeof tenant.userId === 'object' && tenant.userId) {
      return tenant.userId.email || 'N/A'
    }
    return 'N/A'
  }

  const getUnitNumber = (tenant: Tenant): string => {
    if (tenant.currentUnit) {
      if (typeof tenant.currentUnit === 'object') {
        return tenant.currentUnit.unitNumber || 'Chưa có'
      }
    }
    return 'Chưa có'
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const hasDocuments = (tenant: Tenant): boolean => {
    return !!(tenant.documents?.identityCardFront || tenant.documents?.identityCardBack || tenant.documents?.vneidImage)
  }

  if (tenants.length === 0) {
    return (
      <div className="neo-card bg-card p-8 text-center">
        <p className="text-xl font-bold text-muted-foreground">Không có người thuê nào</p>
      </div>
    )
  }

  return (
    <div className="neo-card bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-4 border-black bg-muted">
              <th className="px-4 py-3 text-left font-black text-xs">TÊN</th>
              <th className="px-4 py-3 text-left font-black text-xs">PHÒNG</th>
              <th className="px-4 py-3 text-left font-black text-xs">SĐT</th>
              <th className="px-4 py-3 text-left font-black text-xs">EMAIL</th>
              <th className="px-4 py-3 text-left font-black text-xs">NGÀY VÀO</th>
              <th className="px-4 py-3 text-left font-black text-xs">TRẠNG THÁI</th>
              <th className="px-4 py-3 text-left font-black text-xs">GIẤY TỜ</th>
              <th className="px-4 py-3 text-left font-black text-xs">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, index) => (
              <tr key={tenant._id} className={`border-b-2 border-black ${index % 2 === 0 ? "bg-card" : "bg-muted"}`}>
                <td className="px-4 py-3 font-bold text-sm">{getUserName(tenant)}</td>
                <td className="px-4 py-3 font-bold text-sm">{getUnitNumber(tenant)}</td>
                <td className="px-4 py-3 text-xs">{tenant.phone || 'N/A'}</td>
                <td className="px-4 py-3 text-xs">{getUserEmail(tenant)}</td>
                <td className="px-4 py-3 text-xs">{formatDate(tenant.moveInDate)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`neo-border px-2 py-1 font-bold text-xs ${statusColors[tenant.status]}`}
                  >
                    {statusMap[tenant.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {hasDocuments(tenant) ? (
                    <button 
                      onClick={() => setViewingDocuments(tenant)}
                      className="neo-button bg-blue-500 text-white px-2 py-1 text-xs hover:neo-shadow transition-all"
                    >
                      📄 Xem
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa có</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onEdit(tenant)}
                      className="neo-button bg-primary text-primary-foreground px-2 py-1 text-xs hover:neo-shadow transition-all"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => onDelete(tenant._id)}
                      className="neo-button bg-destructive text-destructive-foreground px-2 py-1 text-xs hover:neo-shadow transition-all"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Documents Modal */}
      {viewingDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingDocuments(null)}>
          <div className="bg-card neo-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">GIẤY TỜ TÙY THÂN - {getUserName(viewingDocuments)}</h2>
              <button 
                onClick={() => setViewingDocuments(null)}
                className="neo-button bg-destructive text-destructive-foreground px-3 py-2 text-sm hover:neo-shadow"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Identity Card Front */}
              <div className="neo-card bg-muted p-4">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span>📷</span> CCCD MẶT TRƯỚC
                </h3>
                {viewingDocuments.documents?.identityCardFront ? (
                  <div className="neo-border bg-white p-2">
                    <img 
                      src={`${baseUrl}${viewingDocuments.documents.identityCardFront}`}
                      alt="CCCD Mặt Trước"
                      className="w-full h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`${baseUrl}${viewingDocuments.documents?.identityCardFront}`, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="neo-border bg-muted p-8 text-center">
                    <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
                  </div>
                )}
              </div>

              {/* Identity Card Back */}
              <div className="neo-card bg-muted p-4">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span>📷</span> CCCD MẶT SAU
                </h3>
                {viewingDocuments.documents?.identityCardBack ? (
                  <div className="neo-border bg-white p-2">
                    <img 
                      src={`${baseUrl}${viewingDocuments.documents.identityCardBack}`}
                      alt="CCCD Mặt Sau"
                      className="w-full h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`${baseUrl}${viewingDocuments.documents?.identityCardBack}`, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="neo-border bg-muted p-8 text-center">
                    <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
                  </div>
                )}
              </div>

              {/* VNeID Image */}
              <div className="neo-card bg-muted p-4 md:col-span-2">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span>📱</span> HÌNH ẢNH VNEID
                </h3>
                {viewingDocuments.documents?.vneidImage ? (
                  <div className="neo-border bg-white p-2 max-w-md mx-auto">
                    <img 
                      src={`${baseUrl}${viewingDocuments.documents.vneidImage}`}
                      alt="VNeID"
                      className="w-full h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`${baseUrl}${viewingDocuments.documents?.vneidImage}`, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="neo-border bg-muted p-8 text-center">
                    <p className="text-sm text-muted-foreground">Chưa có hình ảnh</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
              💡 Click vào hình ảnh để xem kích thước đầy đủ trong tab mới
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

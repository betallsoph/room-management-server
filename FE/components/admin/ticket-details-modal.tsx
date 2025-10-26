"use client"

import { MaintenanceTicket, TICKET_STATUS_NAMES, PRIORITY_NAMES, CATEGORY_NAMES, formatDate } from "@/lib/admin-maintenance-service"

interface TicketDetailsModalProps {
  ticket: MaintenanceTicket
  onClose: () => void
}

export function TicketDetailsModal({ ticket, onClose }: TicketDetailsModalProps) {
  const statusColors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-900 border-blue-900',
    'assigned': 'bg-purple-100 text-purple-900 border-purple-900',
    'in-progress': 'bg-yellow-100 text-yellow-900 border-yellow-900',
    'completed': 'bg-green-100 text-green-900 border-green-900',
    'rejected': 'bg-red-100 text-red-900 border-red-900',
  }

  const priorityColors: Record<string, string> = {
    'urgent': 'bg-red-100 text-red-900 border-red-900',
    'high': 'bg-orange-100 text-orange-900 border-orange-900',
    'medium': 'bg-yellow-100 text-yellow-900 border-yellow-900',
    'low': 'bg-green-100 text-green-900 border-green-900',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card neo-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-black uppercase">Chi Tiết Yêu Cầu</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-lg">{ticket.ticketNumber}</span>
              <span className={`px-3 py-1 neo-border text-sm font-bold ${statusColors[ticket.status]}`}>
                {TICKET_STATUS_NAMES[ticket.status]}
              </span>
              <span className={`px-3 py-1 neo-border text-sm font-bold ${priorityColors[ticket.priority]}`}>
                {PRIORITY_NAMES[ticket.priority]}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{ticket.title}</h3>
            <div className="neo-border bg-muted p-4">
              <p className="text-sm">{ticket.description}</p>
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="neo-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Loại Sự Cố</div>
              <div className="font-bold">{CATEGORY_NAMES[ticket.category]}</div>
            </div>
            <div className="neo-border p-4">
              <div className="text-sm text-muted-foreground mb-1">Độ Ưu Tiên</div>
              <div className="font-bold">{PRIORITY_NAMES[ticket.priority]}</div>
            </div>
          </div>

          {/* Location */}
          <div className="neo-border p-4">
            <div className="text-sm text-muted-foreground mb-2">Vị Trí</div>
            <div className="space-y-1">
              <div>
                <span className="text-sm text-muted-foreground">Tòa nhà:</span>
                <span className="ml-2 font-bold">{ticket.unit.building}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phòng:</span>
                <span className="ml-2 font-bold">{ticket.unit.unitNumber}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Tầng:</span>
                <span className="ml-2 font-bold">{ticket.unit.floor}</span>
              </div>
            </div>
          </div>

          {/* Tenant Info */}
          <div className="neo-border p-4">
            <div className="text-sm text-muted-foreground mb-2">Thông Tin Khách Thuê</div>
            <div className="space-y-1">
              <div>
                <span className="text-sm text-muted-foreground">Họ tên:</span>
                <span className="ml-2 font-bold">{ticket.tenant.userId.fullName}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="ml-2 font-bold">{ticket.tenant.userId.email}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">SĐT:</span>
                <span className="ml-2 font-bold">{ticket.tenant.phone}</span>
              </div>
            </div>
          </div>

          {/* Contract */}
          <div className="neo-border p-4">
            <div className="text-sm text-muted-foreground mb-1">Hợp Đồng</div>
            <div className="font-bold">{ticket.contract.contractNumber}</div>
          </div>

          {/* Assigned To */}
          {ticket.assignedTo && (
            <div className="neo-border p-4 bg-accent/10">
              <div className="text-sm text-muted-foreground mb-2">Người Xử Lý</div>
              <div className="space-y-1">
                <div>
                  <span className="text-sm text-muted-foreground">Họ tên:</span>
                  <span className="ml-2 font-bold">{ticket.assignedTo.fullName}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="ml-2 font-bold">{ticket.assignedTo.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {ticket.resolutionNotes && (
            <div className="neo-border p-4 bg-green-50">
              <div className="text-sm text-muted-foreground mb-2">Ghi Chú Xử Lý</div>
              <p className="text-sm">{ticket.resolutionNotes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Ngày Tạo</div>
              <div className="font-bold">{formatDate(ticket.createdAt)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Cập Nhật Lần Cuối</div>
              <div className="font-bold">{formatDate(ticket.updatedAt)}</div>
            </div>
            {ticket.resolvedAt && (
              <div className="col-span-2">
                <div className="text-muted-foreground mb-1">Ngày Hoàn Thành</div>
                <div className="font-bold">{formatDate(ticket.resolvedAt)}</div>
              </div>
            )}
          </div>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="neo-border p-4">
              <div className="text-sm text-muted-foreground mb-2">Hình Ảnh</div>
              <div className="grid grid-cols-3 gap-2">
                {ticket.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover neo-border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full neo-button bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
        >
          ĐÓNG
        </button>
      </div>
    </div>
  )
}

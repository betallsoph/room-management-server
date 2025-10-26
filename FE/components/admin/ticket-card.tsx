"use client"

import { MaintenanceTicket, TICKET_STATUS_NAMES, PRIORITY_NAMES, CATEGORY_NAMES, formatDate } from "@/lib/admin-maintenance-service"

interface TicketCardProps {
  ticket: MaintenanceTicket
  onViewDetails: () => void
  onUpdateStatus: () => void
}

export function TicketCard({ ticket, onViewDetails, onUpdateStatus }: TicketCardProps) {
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
    <div className="bg-card neo-card p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-muted-foreground">{ticket.ticketNumber}</span>
              <span className={`px-2 py-1 neo-border text-xs font-bold ${statusColors[ticket.status]}`}>
                {TICKET_STATUS_NAMES[ticket.status]}
              </span>
              <span className={`px-2 py-1 neo-border text-xs font-bold ${priorityColors[ticket.priority]}`}>
                {PRIORITY_NAMES[ticket.priority]}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Phòng:</span>
            <span className="ml-2 font-bold">{ticket.unit.building}-{ticket.unit.unitNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Loại:</span>
            <span className="ml-2 font-bold">{CATEGORY_NAMES[ticket.category]}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Khách thuê:</span>
            <span className="ml-2 font-bold">{ticket.tenant.userId.fullName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">SĐT:</span>
            <span className="ml-2 font-bold">{ticket.tenant.phone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Ngày tạo:</span>
            <span className="ml-2 font-bold">{formatDate(ticket.createdAt)}</span>
          </div>
          {ticket.assignedTo && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Người xử lý:</span>
              <span className="ml-2 font-bold">{ticket.assignedTo.fullName}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onViewDetails}
            className="flex-1 neo-button bg-primary text-primary-foreground hover:bg-primary/90"
          >
            XEM CHI TIẾT
          </button>
          <button
            onClick={onUpdateStatus}
            className="flex-1 neo-button bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            CẬP NHẬT
          </button>
        </div>
      </div>
    </div>
  )
}

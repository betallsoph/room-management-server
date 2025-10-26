"use client"

import { useState } from "react"
import { MaintenanceTicket, TICKET_STATUS_NAMES, updateTicketStatus } from "@/lib/admin-maintenance-service"

interface UpdateStatusModalProps {
  ticket: MaintenanceTicket
  onClose: () => void
  onSuccess: () => void
}

export function UpdateStatusModal({ ticket, onClose, onSuccess }: UpdateStatusModalProps) {
  const [status, setStatus] = useState(ticket.status)
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (!token) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const result = await updateTicketStatus(token, ticket._id, status, resolutionNotes)
      console.log('Update success:', result)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Update error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card neo-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black uppercase mb-4">Cập Nhật Trạng Thái</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Ticket: {ticket.ticketNumber}</label>
            <p className="text-sm text-muted-foreground">{ticket.title}</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Trạng Thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full neo-input"
              disabled={loading}
            >
              <option value="new">Mới</option>
              <option value="assigned">Đã Gán</option>
              <option value="in-progress">Đang Xử Lý</option>
              <option value="completed">Hoàn Thành</option>
              <option value="rejected">Từ Chối</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Ghi Chú Xử Lý</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full neo-input min-h-[100px]"
              placeholder="Nhập ghi chú về việc xử lý..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="neo-border border-destructive bg-destructive/10 p-3">
              <p className="text-destructive font-bold text-sm uppercase">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 neo-button bg-muted text-muted-foreground hover:bg-muted/80"
              disabled={loading}
            >
              HỦY
            </button>
            <button
              type="submit"
              className="flex-1 neo-button bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'ĐANG LƯU...' : 'LƯU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { InvoiceCard } from "@/components/tenant/invoice-card"
import {
  getTenantInvoices,
  formatCurrency,
  formatDate,
  INVOICE_STATUS_NAMES,
  type Invoice,
} from "@/lib/tenant-portal-service"

export default function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  const tabs = [
    { id: "unpaid", label: "Chưa Thanh Toán", status: "pending" },
    { id: "paid", label: "Đã Thanh Toán", status: "paid" },
    { id: "overdue", label: "Quá Hạn", status: "overdue" },
    { id: "all", label: "Tất Cả", status: undefined },
  ]

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "tenant") {
      router.push("/login")
      return
    }

    loadInvoices(token)
  }, [router, activeTab])

  async function loadInvoices(token: string) {
    try {
      setLoading(true)
      setError(null)

      const currentTab = tabs.find(t => t.id === activeTab)
      const data = await getTenantInvoices(token, currentTab?.status)
      
      setInvoices(data)
    } catch (err: any) {
      console.error("Load invoices error:", err)
      setError(err.message || "Không thể tải danh sách hóa đơn")
      
      if (err.message?.includes("Unauthorized")) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  // Get unique months from invoices
  const availableMonths = Array.from(
    new Set(invoices.map(inv => `${inv.month}/${inv.year}`))
  ).sort((a, b) => {
    const [aMonth, aYear] = a.split('/').map(Number)
    const [bMonth, bYear] = b.split('/').map(Number)
    if (aYear !== bYear) return bYear - aYear
    return bMonth - aMonth
  })

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        invoice._id.toLowerCase().includes(query) ||
        `${invoice.month}/${invoice.year}`.includes(query) ||
        invoice.totalAmount.toString().includes(query)
      if (!matchesSearch) return false
    }

    // Month filter
    if (selectedMonth !== "all") {
      const [month, year] = selectedMonth.split('/').map(Number)
      if (invoice.month !== month || invoice.year !== year) return false
    }

    return true
  })

  function getInvoiceType(invoice: Invoice): string {
    const parts = ["Tiền Phòng"]
    if (invoice.utilities?.electricity?.cost) parts.push("Điện")
    if (invoice.utilities?.water?.cost) parts.push("Nước")
    if (invoice.utilities?.internet?.cost) parts.push("Internet")
    return parts.join(" + ")
  }

  function handleViewInvoice(invoiceId: string) {
    // TODO: Open invoice detail modal or navigate to detail page
    console.log("View invoice:", invoiceId)
  }

  function handlePayInvoice(invoiceId: string) {
    // TODO: Navigate to payment page or open payment modal
    router.push(`/tenant/payments?invoice=${invoiceId}`)
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
      {/* Filters */}
      <section>
        <h2 className="text-xl font-bold uppercase mb-3">Hóa Đơn</h2>
        <div className="flex flex-col gap-3">
          {/* Tabs */}
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

          {/* Search and Filter */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tìm kiếm hóa đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm neo-input bg-card text-foreground placeholder-muted-foreground"
            />
            <select 
              className="px-3 py-2 text-sm neo-input bg-card text-foreground"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">Tất Cả Tháng</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 neo-card p-3">
          <div className="text-destructive text-sm font-bold uppercase mb-1">Lỗi</div>
          <div className="text-xs text-muted-foreground">{error}</div>
        </div>
      )}

      {/* Invoice List */}
      <section>
        {filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvoices.map((invoice) => {
              let displayStatus: 'unpaid' | 'paid' | 'overdue' = 'unpaid'
              if (invoice.status === 'paid') displayStatus = 'paid'
              else if (invoice.status === 'overdue') displayStatus = 'overdue'
              else if (invoice.status === 'issued' || invoice.status === 'draft') displayStatus = 'unpaid'
              
              return (
                <InvoiceCard
                  key={invoice._id}
                  invoiceNumber={invoice._id.slice(-8).toUpperCase()}
                  month={`Tháng ${String(invoice.month).padStart(2, '0')}/${invoice.year}`}
                  type={getInvoiceType(invoice)}
                  amount={invoice.totalAmount}
                  dueDate={formatDate(invoice.dueDate)}
                  status={displayStatus}
                  onView={() => handleViewInvoice(invoice._id)}
                  onPay={invoice.status !== 'paid' ? () => handlePayInvoice(invoice._id) : undefined}
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-card neo-card p-4 text-center text-sm text-muted-foreground">
            {searchQuery || selectedMonth !== "all" 
              ? "Không tìm thấy hóa đơn phù hợp" 
              : "Chưa có hóa đơn nào"}
          </div>
        )}
      </section>
    </div>
  )
}

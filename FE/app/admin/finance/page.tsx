'use client';

import { useState, useEffect } from 'react';
import { invoiceService, Invoice } from '@/lib/invoice-service';
import { Plus, Search, Filter, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import CreateInvoiceModal from '@/components/admin/create-invoice-modal';

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<number>(0); // 0 = All months
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, monthFilter, yearFilter, buildingFilter, currentPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is logged in
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') ||
                      localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('🔐 Token status:', token ? 'Present ✅' : 'Missing ❌');
        
        if (!token) {
          setError('Bạn cần đăng nhập để xem hóa đơn');
          setLoading(false);
          return;
        }
      }
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (statusFilter) params.status = statusFilter;
      if (monthFilter && monthFilter > 0) params.month = monthFilter; // Only filter if month > 0
      if (yearFilter) params.year = yearFilter;
      if (buildingFilter) params.building = buildingFilter;

      const data = await invoiceService.getInvoices(params);
      setInvoices(data.invoices);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách hóa đơn');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    try {
      await invoiceService.confirmPayment(invoiceId, {
        status: 'paid',
      });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Không thể xác nhận thanh toán');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { text: 'Nháp', class: 'bg-gray-100 text-gray-800 border-gray-800' },
      issued: { text: 'Đã gửi', class: 'bg-blue-100 text-blue-800 border-blue-800' },
      paid: { text: 'Đã thanh toán', class: 'bg-green-100 text-green-800 border-green-800' },
      overdue: { text: 'Quá hạn', class: 'bg-red-100 text-red-800 border-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`px-3 py-1 text-sm font-bold border-2 ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'issued':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTenantName = (invoice: Invoice) => {
    if (typeof invoice.tenant === 'object') {
      return invoice.tenant.userId?.fullName || invoice.tenant.name || 'N/A';
    }
    return 'N/A';
  };

  const getUnitInfo = (invoice: Invoice) => {
    if (typeof invoice.unit === 'object') {
      return `${invoice.unit.building}${invoice.unit.unitNumber}`;
    }
    return 'N/A';
  };

  // Statistics
  const stats = {
    total: total,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'issued').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalRevenue: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.paidAmount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">QUẢN LÝ HÓA ĐƠN</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý hóa đơn cho khách thuê</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neo-button bg-yellow-400 border-black px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo hóa đơn mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="neo-card bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-bold">TỔNG HÓA ĐƠN</p>
              <p className="text-2xl font-black mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <div className="neo-card bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-bold">ĐÃ THANH TOÁN</p>
              <p className="text-2xl font-black mt-1">{stats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="neo-card bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-bold">CHỜ THANH TOÁN</p>
              <p className="text-2xl font-black mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="neo-card bg-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800 font-bold">QUÁ HẠN</p>
              <p className="text-2xl font-black mt-1">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="neo-card bg-yellow-100 p-4">
          <div>
            <p className="text-sm text-yellow-800 font-bold">DOANH THU</p>
            <p className="text-lg font-black mt-1">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="neo-card bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-black">BỘ LỌC</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-bold mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="neo-input w-full"
            >
              <option value="">Tất cả</option>
              <option value="draft">Nháp</option>
              <option value="issued">Đã gửi</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Tháng</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="neo-input w-full"
            >
              <option value={0}>Tất cả</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Năm</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="neo-input w-full"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Tòa</label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="neo-input w-full"
            >
              <option value="">Tất cả</option>
              <option value="A">Tòa A</option>
              <option value="B">Tòa B</option>
              <option value="C">Tòa C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Số hóa đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neo-input w-full pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="neo-card bg-red-100 border-red-500 p-4">
          <p className="text-red-800 font-bold">{error}</p>
          {error.includes('đăng nhập') && (
            <a href="/login" className="neo-button bg-blue-400 mt-3 inline-block px-4 py-2">
              Đăng nhập lại
            </a>
          )}
        </div>
      )}

      {/* Invoice Table */}
      <div className="neo-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-black">
                <th className="px-4 py-3 text-left font-black text-sm">SỐ HÓA ĐƠN</th>
                <th className="px-4 py-3 text-left font-black text-sm">PHÒNG</th>
                <th className="px-4 py-3 text-left font-black text-sm">KHÁCH THUÊ</th>
                <th className="px-4 py-3 text-left font-black text-sm">THÁNG/NĂM</th>
                <th className="px-4 py-3 text-right font-black text-sm">TỔNG TIỀN</th>
                <th className="px-4 py-3 text-left font-black text-sm">HẠN TT</th>
                <th className="px-4 py-3 text-center font-black text-sm">TRẠNG THÁI</th>
                <th className="px-4 py-3 text-center font-black text-sm">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Không có hóa đơn nào
                  </td>
                </tr>
              ) : (
                invoices
                  .filter(
                    (inv) =>
                      !searchQuery ||
                      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((invoice, index) => (
                    <tr
                      key={invoice._id}
                      className={`border-b-2 border-black hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span className="font-bold text-sm">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm">{getUnitInfo(invoice)}</td>
                      <td className="px-4 py-3 text-sm">{getTenantName(invoice)}</td>
                      <td className="px-4 py-3 font-bold text-sm">
                        {invoice.month}/{invoice.year}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sm text-blue-600">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(invoice.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentModal(true);
                            }}
                            className="neo-button bg-white px-3 py-1 text-sm"
                          >
                            Chi tiết
                          </button>
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => handleConfirmPayment(invoice._id)}
                              className="neo-button bg-green-400 px-3 py-1 text-sm"
                            >
                              Xác nhận
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t-4 border-black p-4 flex items-center justify-between">
            <p className="text-sm font-bold">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="neo-button bg-white px-4 py-2 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="neo-button bg-white px-4 py-2 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="neo-card bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b-4 border-black p-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">CHI TIẾT HÓA ĐƠN</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                }}
                className="neo-button bg-red-400 px-4 py-2"
              >
                Đóng
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-bold">Số hóa đơn</p>
                  <p className="text-lg font-black">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Phòng</p>
                  <p className="text-lg font-black">{getUnitInfo(selectedInvoice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Khách thuê</p>
                  <p className="text-lg font-black">{getTenantName(selectedInvoice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Kỳ hóa đơn</p>
                  <p className="text-lg font-black">
                    {selectedInvoice.month}/{selectedInvoice.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Ngày phát hành</p>
                  <p className="text-lg font-black">{formatDate(selectedInvoice.issuedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">Hạn thanh toán</p>
                  <p className="text-lg font-black text-red-600">
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-sm text-gray-600 font-bold">Ngày thanh toán</p>
                    <p className="text-lg font-black text-green-600">
                      {formatDate(selectedInvoice.paidDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-black pt-4">
                <h3 className="text-lg font-black mb-3">CHI TIẾT THANH TOÁN</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Tiền thuê phòng:</span>
                    <span className="font-black">{formatCurrency(selectedInvoice.rentAmount)}</span>
                  </div>
                  {selectedInvoice.utilities?.electricity?.cost && selectedInvoice.utilities.electricity.cost > 0 && (
                    <div className="flex justify-between">
                      <span className="font-bold">Tiền điện:</span>
                      <span className="font-black">
                        {formatCurrency(selectedInvoice.utilities.electricity.cost)}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.utilities?.water?.cost && selectedInvoice.utilities.water.cost > 0 && (
                    <div className="flex justify-between">
                      <span className="font-bold">Tiền nước:</span>
                      <span className="font-black">
                        {formatCurrency(selectedInvoice.utilities.water.cost)}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.utilities?.internet?.cost && selectedInvoice.utilities.internet.cost > 0 && (
                    <div className="flex justify-between">
                      <span className="font-bold">Tiền internet:</span>
                      <span className="font-black">
                        {formatCurrency(selectedInvoice.utilities.internet.cost)}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-black pt-2 flex justify-between text-xl">
                    <span className="font-black">TỔNG CỘNG:</span>
                    <span className="font-black text-blue-600">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  {selectedInvoice.paidAmount > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="font-black">ĐÃ THANH TOÁN:</span>
                      <span className="font-black text-green-600">
                        {formatCurrency(selectedInvoice.paidAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="border-t-2 border-black pt-4">
                  <h3 className="text-lg font-black mb-2">GHI CHÚ</h3>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              {selectedInvoice.status !== 'paid' && (
                <div className="border-t-2 border-black pt-4">
                  <button
                    onClick={() => handleConfirmPayment(selectedInvoice._id)}
                    className="neo-button bg-green-400 w-full py-3 text-lg font-black"
                  >
                    XÁC NHẬN ĐÃ THANH TOÁN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { contractService, Contract } from '@/lib/contract-service';
import { invoiceService } from '@/lib/invoice-service';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricityUsage: 0,
    electricityUnitPrice: 3500,
    waterUsage: 0,
    waterUnitPrice: 15000,
    internetCost: 100000,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
    }
  }, [isOpen]);

  const fetchContracts = async () => {
    try {
      const data = await contractService.getContracts();
      
      // Filter only active contracts
      const activeContracts = data.contracts?.filter((c: Contract) => c.status === 'active') || [];
      
      setContracts(activeContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      alert('Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContract) {
      alert('Vui lòng chọn hợp đồng');
      return;
    }

    setLoading(true);
    try {
      const contract = contracts.find(c => c._id === selectedContract);
      if (!contract) return;

      await invoiceService.createInvoice({
        contract: selectedContract,
        unit: typeof contract.unit === 'object' ? contract.unit._id : contract.unit,
        tenant: typeof contract.tenant === 'object' ? contract.tenant._id : contract.tenant,
        month: formData.month,
        year: formData.year,
        electricity: {
          usage: formData.electricityUsage,
          unitPrice: formData.electricityUnitPrice,
        },
        water: {
          usage: formData.waterUsage,
          unitPrice: formData.waterUnitPrice,
        },
        internet: {
          cost: formData.internetCost,
        },
        notes: formData.notes,
      });

      alert('Tạo hóa đơn thành công!');
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedContract('');
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electricityUsage: 0,
        electricityUnitPrice: 3500,
        waterUsage: 0,
        waterUnitPrice: 15000,
        internetCost: 100000,
        notes: '',
      });
    } catch (error: any) {
      alert(error.message || 'Không thể tạo hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const getContractInfo = (contract: Contract) => {
    const unit = typeof contract.unit === 'object' 
      ? `${contract.unit.building}${contract.unit.unitNumber}` 
      : 'N/A';
    const tenant = typeof contract.tenant === 'object'
      ? contract.tenant.userId?.fullName || contract.tenant.name || 'N/A'
      : 'N/A';
    return `${contract.contractNumber} - Phòng ${unit} - ${tenant}`;
  };

  const calculateTotal = () => {
    const contract = contracts.find(c => c._id === selectedContract);
    const rentAmount = contract?.rentAmount || 0;
    const electricityCost = formData.electricityUsage * formData.electricityUnitPrice;
    const waterCost = formData.waterUsage * formData.waterUnitPrice;
    const internetCost = formData.internetCost;
    return rentAmount + electricityCost + waterCost + internetCost;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="neo-card bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b-4 border-black p-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black">TẠO HÓA ĐƠN MỚI</h2>
          <button
            onClick={onClose}
            className="neo-button bg-red-400 px-4 py-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contract Selection */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Chọn hợp đồng <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="neo-input w-full"
              required
            >
              <option value="">-- Chọn hợp đồng --</option>
              {contracts.length === 0 && (
                <option disabled>Không có hợp đồng đang hoạt động</option>
              )}
              {contracts.map((contract) => (
                <option key={contract._id} value={contract._id}>
                  {getContractInfo(contract)}
                </option>
              ))}
            </select>
            {contracts.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Không có hợp đồng nào đang hoạt động. Vui lòng tạo hợp đồng trước.
              </p>
            )}
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Tháng <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="neo-input w-full"
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Năm <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="neo-input w-full"
                required
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Electricity */}
          <div className="neo-card bg-blue-50 p-4">
            <h3 className="font-black mb-3">TIỀN ĐIỆN</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Số điện sử dụng (kWh)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.electricityUsage}
                  onChange={(e) => setFormData({ ...formData, electricityUsage: Number(e.target.value) })}
                  className="neo-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Đơn giá (VND/kWh)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.electricityUnitPrice}
                  onChange={(e) => setFormData({ ...formData, electricityUnitPrice: Number(e.target.value) })}
                  className="neo-input w-full"
                />
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-sm font-bold">Thành tiền: </span>
              <span className="text-lg font-black text-blue-600">
                {formatCurrency(formData.electricityUsage * formData.electricityUnitPrice)}
              </span>
            </div>
          </div>

          {/* Water */}
          <div className="neo-card bg-green-50 p-4">
            <h3 className="font-black mb-3">TIỀN NƯỚC</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Số nước sử dụng (m³)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.waterUsage}
                  onChange={(e) => setFormData({ ...formData, waterUsage: Number(e.target.value) })}
                  className="neo-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Đơn giá (VND/m³)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.waterUnitPrice}
                  onChange={(e) => setFormData({ ...formData, waterUnitPrice: Number(e.target.value) })}
                  className="neo-input w-full"
                />
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-sm font-bold">Thành tiền: </span>
              <span className="text-lg font-black text-green-600">
                {formatCurrency(formData.waterUsage * formData.waterUnitPrice)}
              </span>
            </div>
          </div>

          {/* Internet */}
          <div className="neo-card bg-yellow-50 p-4">
            <h3 className="font-black mb-3">TIỀN INTERNET</h3>
            <div>
              <label className="block text-sm font-bold mb-2">Chi phí internet (VND)</label>
              <input
                type="number"
                min="0"
                value={formData.internetCost}
                onChange={(e) => setFormData({ ...formData, internetCost: Number(e.target.value) })}
                className="neo-input w-full"
              />
            </div>
          </div>

          {/* Rent Amount Display */}
          {selectedContract && (
            <div className="neo-card bg-purple-50 p-4">
              <div className="flex justify-between items-center">
                <span className="font-black">TIỀN THUÊ PHÒNG:</span>
                <span className="text-xl font-black text-purple-600">
                  {formatCurrency(contracts.find(c => c._id === selectedContract)?.rentAmount || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Total */}
          {selectedContract && (
            <div className="neo-card bg-orange-100 p-4 border-4 border-orange-500">
              <div className="flex justify-between items-center">
                <span className="text-xl font-black">TỔNG CỘNG:</span>
                <span className="text-2xl font-black text-orange-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold mb-2">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="neo-input w-full h-24"
              placeholder="Nhập ghi chú cho hóa đơn..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !selectedContract}
              className="neo-button bg-green-400 flex-1 py-3 text-lg font-black disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : 'TẠO & GỬI HÓA ĐƠN'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="neo-button bg-gray-200 px-6 py-3"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

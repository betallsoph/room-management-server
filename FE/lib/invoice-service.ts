import { authFetch } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  contract: {
    _id: string;
    contractNumber: string;
    rentAmount: number;
  } | string;
  unit: {
    _id: string;
    unitNumber: string;
    building: string;
  } | string;
  tenant: {
    _id: string;
    name?: string;
    identityCard?: string;
    userId?: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
  } | string;
  month: number;
  year: number;
  rentAmount: number;
  utilities?: {
    electricity?: {
      reading?: number;
      cost?: number;
    };
    water?: {
      reading?: number;
      cost?: number;
    };
    internet?: {
      cost?: number;
    };
    other?: number;
  };
  totalAmount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  issuedDate: string;
  dueDate: string;
  paidDate?: string | null;
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export interface CreateInvoiceData {
  contract: string;
  unit: string;
  tenant: string;
  month: number;
  year: number;
  electricity?: {
    usage: number;
    unitPrice: number;
  };
  water?: {
    usage: number;
    unitPrice: number;
  };
  internet?: {
    cost: number;
  };
  notes?: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const invoiceService = {
  // [Admin] Lấy danh sách hóa đơn
  async getInvoices(params?: {
    status?: string;
    building?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<InvoiceListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.building) queryParams.append('building', params.building);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    console.log('🔍 Fetching invoices from:', `${API_URL}/invoices?${queryParams.toString()}`);

    const response = await authFetch(`${API_URL}/invoices?${queryParams.toString()}`);
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error('Failed to fetch invoices');
    }
    
    const data = await response.json();
    console.log('✅ Invoices data:', data);
    
    return data;
  },

  // [Admin] Tạo hóa đơn mới
  async createInvoice(data: CreateInvoiceData): Promise<{ message: string; invoice: Invoice }> {
    const response = await authFetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return response.json();
  },

  // [Admin] Lấy chi tiết hóa đơn
  async getInvoiceDetails(invoiceId: string): Promise<Invoice> {
    const response = await authFetch(`${API_URL}/invoices/${invoiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoice details');
    }
    return response.json();
  },

  // [Admin] Xác nhận thanh toán
  async confirmPayment(
    invoiceId: string,
    data: {
      paidAmount?: number;
      paymentNotes?: string;
      status?: 'paid' | 'overdue' | 'partial';
    }
  ): Promise<{ message: string; invoice: Invoice }> {
    const response = await authFetch(`${API_URL}/invoices/${invoiceId}/confirm-payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm payment');
    }

    return response.json();
  },

  // [Admin] Cập nhật hóa đơn
  async updateInvoice(
    invoiceId: string,
    data: Partial<CreateInvoiceData>
  ): Promise<{ message: string; invoice: Invoice }> {
    const response = await authFetch(`${API_URL}/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update invoice');
    }

    return response.json();
  },

  // [Admin] Xóa hóa đơn
  async deleteInvoice(invoiceId: string): Promise<{ message: string }> {
    const response = await authFetch(`${API_URL}/invoices/${invoiceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete invoice');
    }

    return response.json();
  },
};

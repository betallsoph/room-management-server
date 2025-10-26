// Admin Maintenance Service - API calls for admin maintenance management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface MaintenanceTicket {
  _id: string;
  ticketNumber: string;
  unit: {
    _id: string;
    unitNumber: string;
    building: string;
    floor: number;
  };
  tenant: {
    _id: string;
    userId: {
      fullName: string;
      email: string;
      phone?: string;
    };
    phone: string;
  };
  contract: {
    _id: string;
    contractNumber: string;
  };
  category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'ventilation' | 'door-lock' | 'paint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
  title: string;
  description: string;
  images?: string[];
  assignedTo?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface TicketListResponse {
  tickets: MaintenanceTicket[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  statistics: {
    total: number;
    new: number;
    assigned: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
}

/**
 * Get all maintenance tickets (Admin)
 */
export async function getAllMaintenanceTickets(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }
): Promise<TicketListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_URL}/maintenance-tickets?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Get maintenance tickets error:', error);
    throw error;
  }
}

/**
 * Get ticket details
 */
export async function getTicketDetails(token: string, ticketId: string): Promise<MaintenanceTicket> {
  try {
    const response = await fetch(`${API_URL}/maintenance-tickets/${ticketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch ticket details');
    }

    return await response.json();
  } catch (error) {
    console.error('Get ticket details error:', error);
    throw error;
  }
}

/**
 * Assign ticket to admin user
 */
export async function assignTicket(
  token: string,
  ticketId: string,
  assignedTo: string
): Promise<{ message: string; ticket: MaintenanceTicket }> {
  try {
    const response = await fetch(`${API_URL}/maintenance-tickets/${ticketId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ assignedTo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign ticket');
    }

    return await response.json();
  } catch (error) {
    console.error('Assign ticket error:', error);
    throw error;
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  token: string,
  ticketId: string,
  status: 'new' | 'assigned' | 'in-progress' | 'completed' | 'rejected',
  resolutionNotes?: string
): Promise<{ message: string; ticket: MaintenanceTicket }> {
  try {
    const response = await fetch(`${API_URL}/maintenance-tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, resolutionNotes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update ticket status');
    }

    return data;
  } catch (error) {
    console.error('Update ticket status error:', error);
    throw error;
  }
}

/**
 * Status display names
 */
export const TICKET_STATUS_NAMES: Record<string, string> = {
  'new': 'Mới',
  'assigned': 'Đã Gán',
  'in-progress': 'Đang Xử Lý',
  'completed': 'Hoàn Thành',
  'rejected': 'Từ Chối',
};

/**
 * Priority display names
 */
export const PRIORITY_NAMES: Record<string, string> = {
  'low': 'Thấp',
  'medium': 'Trung Bình',
  'high': 'Cao',
  'urgent': 'Khẩn Cấp',
};

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<string, string> = {
  'plumbing': 'Ống Nước',
  'electrical': 'Điện',
  'structural': 'Kết Cấu',
  'appliance': 'Thiết Bị',
  'ventilation': 'Thông Gió',
  'door-lock': 'Cửa/Khóa',
  'paint': 'Sơn',
  'other': 'Khác',
};

/**
 * Format date helper
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

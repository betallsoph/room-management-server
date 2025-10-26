// Tenant Portal Service - API calls for tenant user functionality

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// TypeScript interfaces
export interface TenantProfile {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  identityCard: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
  documents?: {
    identityCardFront?: string | null;
    identityCardBack?: string | null;
    vneidImage?: string | null;
  };
  currentUnit?: {
    _id: string;
    unitNumber: string;
    building: string;
    floor: number;
    squareMeters: number;
    roomType: string;
    rentPrice: number;
    depositAmount: number;
    amenities: string[];
    description?: string;
    status?: string;
    electricityRate?: number;
    waterRate?: number;
    internetRate?: number;
  } | null;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  status: 'active' | 'inactive' | 'moved-out';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  tenant: string;
  unit: string;
  month: number;
  year: number;
  rentAmount: number;
  utilities?: {
    electricity?: {
      reading: number;
      cost: number;
    };
    water?: {
      reading: number;
      cost: number;
    };
    internet?: {
      cost: number;
    };
  };
  totalAmount: number;
  dueDate: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  paidDate?: string | null;
  paidAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  _id: string;
  tenant: string;
  unit: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'ventilation' | 'door-lock' | 'paint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in-progress' | 'completed' | 'rejected';
  images?: string[];
  assignedTo?: string;
  completedDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'invoice' | 'maintenance' | 'announcement' | 'payment' | 'contract';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
  };
  recipient: {
    _id: string;
    fullName: string;
    email: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
  status: 'sent' | 'delivered' | 'read';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  conversationId: string;
  unit?: string;
  contract?: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  unit: {
    _id: string;
    unitNumber: string;
    building: string;
  };
  tenant: string;
  landlord: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  utilities: {
    electricity: boolean;
    water: boolean;
    internet: boolean;
    parking: boolean;
  };
  status: 'active' | 'expired' | 'terminated' | 'pending';
  createdAt: string;
  updatedAt: string;
}

/**
 * Get tenant profile
 */
export async function getTenantProfile(token: string): Promise<TenantProfile> {
  try {
    const response = await fetch(`${API_URL}/tenants/my-profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (response.status === 404) {
      throw new Error('Tenant profile not found');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tenant profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get tenant profile error:', error);
    throw error;
  }
}

/**
 * Update emergency contact
 */
export async function updateEmergencyContact(
  token: string,
  contact: { name: string; phone: string; relationship?: string }
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tenants/my-profile/emergency-contact`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update emergency contact');
    }
  } catch (error) {
    console.error('Update emergency contact error:', error);
    throw error;
  }
}

/**
 * Upload tenant identity documents (CCCD, VNeID) - with file upload
 */
export async function uploadDocuments(
  token: string,
  files: {
    identityCardFront?: File;
    identityCardBack?: File;
    vneidImage?: File;
  }
): Promise<{ message: string; documents: any }> {
  try {
    console.log('=== Upload Documents Frontend ===');
    console.log('Files to upload:', {
      identityCardFront: files.identityCardFront?.name,
      identityCardBack: files.identityCardBack?.name,
      vneidImage: files.vneidImage?.name
    });

    const formData = new FormData();
    
    if (files.identityCardFront) {
      formData.append('identityCardFront', files.identityCardFront);
      console.log('Appended identityCardFront:', files.identityCardFront.name);
    }
    if (files.identityCardBack) {
      formData.append('identityCardBack', files.identityCardBack);
      console.log('Appended identityCardBack:', files.identityCardBack.name);
    }
    if (files.vneidImage) {
      formData.append('vneidImage', files.vneidImage);
      console.log('Appended vneidImage:', files.vneidImage.name);
    }

    console.log('Sending request to:', `${API_URL}/tenants/my-profile/documents`);

    const response = await fetch(`${API_URL}/tenants/my-profile/documents`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let browser set it with boundary for multipart/form-data
      },
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Upload failed:', error);
      throw new Error(error.message || 'Failed to upload documents');
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload documents error:', error);
    throw error;
  }
}

/**
 * Get tenant's current contract
 */
export async function getTenantContract(token: string): Promise<Contract | null> {
  try {
    const response = await fetch(`${API_URL}/contracts/my/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null; // No active contract
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch contract');
    }

    return await response.json();
  } catch (error) {
    console.error('Get tenant contract error:', error);
    throw error;
  }
}

/**
 * Get tenant invoices
 */
export async function getTenantInvoices(
  token: string,
  status?: string,
  month?: number,
  year?: number
): Promise<Invoice[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const response = await fetch(`${API_URL}/invoices/my/list?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch invoices');
    }

    const data = await response.json();
    return data.invoices || [];
  } catch (error) {
    console.error('Get tenant invoices error:', error);
    throw error;
  }
}

/**
 * Get invoice details
 */
export async function getInvoiceDetails(token: string, invoiceId: string): Promise<Invoice> {
  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch invoice details');
    }

    const data = await response.json();
    return data.invoice;
  } catch (error) {
    console.error('Get invoice details error:', error);
    throw error;
  }
}

/**
 * Get tenant maintenance tickets
 */
export async function getTenantMaintenanceTickets(
  token: string,
  status?: string
): Promise<MaintenanceTicket[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await fetch(`${API_URL}/maintenance-tickets/my/tickets?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch maintenance tickets');
    }

    const data = await response.json();
    return data.tickets || [];
  } catch (error) {
    console.error('Get tenant maintenance tickets error:', error);
    throw error;
  }
}

/**
 * Create maintenance ticket
 */
export async function createMaintenanceTicket(
  token: string,
  ticketData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    images?: string[];
  }
): Promise<MaintenanceTicket> {
  try {
    const response = await fetch(`${API_URL}/maintenance-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create maintenance ticket');
    }

    const data = await response.json();
    return data.ticket;
  } catch (error) {
    console.error('Create maintenance ticket error:', error);
    throw error;
  }
}

/**
 * Get tenant notifications
 */
export async function getTenantNotifications(
  token: string,
  limit: number = 20
): Promise<Notification[]> {
  try {
    const response = await fetch(`${API_URL}/notifications/my/list?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch notifications');
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Get tenant notifications error:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  token: string,
  notificationId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

/**
 * Get time ago
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 4) return `${weeks} tuần trước`;
  return formatDate(dateString);
}

/**
 * Room type display names
 */
export const ROOM_TYPE_NAMES: Record<string, string> = {
  'studio': 'Studio',
  'one-bedroom': '1 Phòng Ngủ',
  'two-bedroom': '2 Phòng Ngủ',
  'three-bedroom': '3 Phòng Ngủ',
};

/**
 * Status display names
 */
export const STATUS_NAMES: Record<string, string> = {
  'active': 'Hoạt Động',
  'inactive': 'Không Hoạt Động',
  'moved-out': 'Đã Chuyển Đi',
};

/**
 * Invoice status names
 */
export const INVOICE_STATUS_NAMES: Record<string, string> = {
  'draft': 'Bản Nháp',
  'issued': 'Chưa Thanh Toán',
  'paid': 'Đã Thanh Toán',
  'overdue': 'Quá Hạn',
};

/**
 * Maintenance ticket status names
 */
export const TICKET_STATUS_NAMES: Record<string, string> = {
  'new': 'Mới',
  'assigned': 'Đã Gán',
  'in-progress': 'Đang Xử Lý',
  'completed': 'Hoàn Thành',
  'rejected': 'Từ Chối',
};

/**
 * Priority names
 */
export const PRIORITY_NAMES: Record<string, string> = {
  'low': 'Thấp',
  'medium': 'Trung Bình',
  'high': 'Cao',
  'urgent': 'Khẩn Cấp',
};

/**
 * Category names
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
 * Get conversations list
 */
export async function getConversations(token: string): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_URL}/messages/my/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  token: string,
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ messages: Message[]; total: number }> {
  try {
    const params = new URLSearchParams({
      conversationId,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_URL}/messages/conversation/${conversationId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch conversation history');
    }

    const data = await response.json();
    return {
      messages: data.messages || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Get conversation history error:', error);
    throw error;
  }
}

/**
 * Send message
 */
export async function sendMessage(
  token: string,
  messageData: {
    recipient: string;
    content: string;
    messageType?: string;
    attachments?: string[];
    unit?: string;
    contract?: string;
  }
): Promise<Message> {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(token: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/messages/unread/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch unread count');
    }

    const data = await response.json();
    return data.unreadCount || 0;
  } catch (error) {
    console.error('Get unread message count error:', error);
    throw error;
  }
}

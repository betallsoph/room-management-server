// Tenant Service - API calls for tenant management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// TypeScript interfaces
export interface TenantUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface TenantUnit {
  _id: string;
  unitNumber: string;
  building: string;
  floor: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface Tenant {
  _id: string;
  userId: TenantUser | string;
  identityCard: string;
  phone: string;
  emergencyContact?: EmergencyContact;
  documents?: {
    identityCardFront?: string | null;
    identityCardBack?: string | null;
    vneidImage?: string | null;
  };
  currentUnit?: TenantUnit | string | null;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  status: 'active' | 'inactive' | 'moved-out';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  userId: string;
  identityCard: string;
  phone: string;
  emergencyContact?: EmergencyContact;
  currentUnit?: string;
}

export interface UpdateTenantRequest {
  identityCard?: string;
  phone?: string;
  emergencyContact?: EmergencyContact;
  currentUnit?: string | null;
  moveInDate?: string | null;
  moveOutDate?: string | null;
  status?: 'active' | 'inactive' | 'moved-out';
}

export interface TenantsResponse {
  tenants: Tenant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Get list of tenants with pagination and filters
 */
export async function getTenants(
  token: string,
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<TenantsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await fetch(`${API_URL}/tenants?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (response.status === 403) {
      throw new Error('Forbidden - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tenants');
    }

    return await response.json();
  } catch (error) {
    console.error('Get tenants error:', error);
    throw error;
  }
}

/**
 * Get tenant details by ID
 */
export async function getTenantById(token: string, tenantId: string): Promise<Tenant> {
  try {
    const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
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
      throw new Error('Tenant not found');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tenant details');
    }

    const data = await response.json();
    return data.tenant;
  } catch (error) {
    console.error('Get tenant by ID error:', error);
    throw error;
  }
}

/**
 * Create new tenant
 */
export async function createTenant(
  token: string,
  tenantData: CreateTenantRequest
): Promise<Tenant> {
  try {
    const response = await fetch(`${API_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(tenantData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create tenant');
    }

    return data.tenant;
  } catch (error) {
    console.error('Create tenant error:', error);
    throw error;
  }
}

/**
 * Update tenant by ID
 */
export async function updateTenant(
  token: string,
  tenantId: string,
  updates: UpdateTenantRequest
): Promise<Tenant> {
  try {
    const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update tenant');
    }

    return data.tenant;
  } catch (error) {
    console.error('Update tenant error:', error);
    throw error;
  }
}

/**
 * Delete tenant by ID
 */
export async function deleteTenant(token: string, tenantId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (response.status === 404) {
      throw new Error('Tenant not found');
    }

    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Cannot delete tenant');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tenant');
    }
  } catch (error) {
    console.error('Delete tenant error:', error);
    throw error;
  }
}

/**
 * Get available units for tenant assignment
 */
export async function getAvailableUnits(token: string): Promise<TenantUnit[]> {
  try {
    const response = await fetch(`${API_URL}/units?status=available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available units');
    }

    const data = await response.json();
    return data.units || [];
  } catch (error) {
    console.error('Get available units error:', error);
    return [];
  }
}

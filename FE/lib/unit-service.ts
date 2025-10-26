// Unit Service - API calls for room/unit management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// TypeScript interfaces
export interface Unit {
  _id: string;
  unitNumber: string;
  building: string;
  floor: number;
  squareMeters: number;
  roomType: 'studio' | 'one-bedroom' | 'two-bedroom' | 'three-bedroom';
  rentPrice: number;
  depositAmount: number;
  amenities: string[];
  description?: string;
  images?: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'rented-out';
  landlord: {
    _id: string;
    fullName: string;
    email: string;
  };
  currentTenant?: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      email: string;
      phone: string;
    };
    phone: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  unitNumber: string;
  building: string;
  floor: number;
  squareMeters: number;
  roomType: 'studio' | 'one-bedroom' | 'two-bedroom' | 'three-bedroom';
  rentPrice: number;
  depositAmount: number;
  amenities?: string[];
  description?: string;
  images?: string[];
}

export interface UpdateUnitRequest {
  unitNumber?: string;
  building?: string;
  floor?: number;
  squareMeters?: number;
  roomType?: 'studio' | 'one-bedroom' | 'two-bedroom' | 'three-bedroom';
  rentPrice?: number;
  depositAmount?: number;
  amenities?: string[];
  description?: string;
  images?: string[];
  status?: 'available' | 'occupied' | 'maintenance' | 'rented-out';
  currentTenant?: string | null;
}

export interface UnitsResponse {
  units: Unit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Get list of units with pagination and filters
 */
export async function getUnits(
  token: string,
  page: number = 1,
  limit: number = 20,
  building?: string,
  status?: string,
  floor?: number,
  roomType?: string
): Promise<UnitsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (building) params.append('building', building);
    if (status) params.append('status', status);
    if (floor !== undefined) params.append('floor', floor.toString());
    if (roomType) params.append('roomType', roomType);

    const response = await fetch(`${API_URL}/units?${params.toString()}`, {
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
      throw new Error(error.message || 'Failed to fetch units');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get units error:', error);
    throw error;
  }
}

/**
 * Get unit details by ID
 */
export async function getUnitById(token: string, unitId: string): Promise<Unit> {
  try {
    const response = await fetch(`${API_URL}/units/${unitId}`, {
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
      throw new Error('Unit not found');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch unit details');
    }

    return await response.json();
  } catch (error) {
    console.error('Get unit by ID error:', error);
    throw error;
  }
}

/**
 * Create new unit
 */
export async function createUnit(
  token: string,
  unitData: CreateUnitRequest
): Promise<Unit> {
  try {
    console.log('Creating unit:', unitData);

    const response = await fetch(`${API_URL}/units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(unitData),
    });

    const data = await response.json();
    console.log('Create unit response:', response.status, data);

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (response.status === 400) {
      throw new Error(data.message || 'Invalid unit data');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create unit');
    }

    console.log('Create unit success:', data);
    return data.unit;
  } catch (error) {
    console.error('Create unit error:', error);
    throw error;
  }
}

/**
 * Update unit by ID
 */
export async function updateUnit(
  token: string,
  unitId: string,
  updates: UpdateUnitRequest
): Promise<Unit> {
  try {
    console.log('Updating unit:', unitId, updates);

    const response = await fetch(`${API_URL}/units/${unitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    console.log('Update unit response:', response.status, data);

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (response.status === 404) {
      throw new Error(data.message || 'Unit not found');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update unit');
    }

    console.log('Update unit success:', data);
    return data.unit;
  } catch (error) {
    console.error('Update unit error:', error);
    throw error;
  }
}

/**
 * Delete unit by ID (soft delete - set status to maintenance)
 */
export async function deleteUnit(token: string, unitId: string): Promise<void> {
  try {
    console.log('Deleting unit:', unitId);

    const response = await fetch(`${API_URL}/units/${unitId}`, {
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
      throw new Error('Unit not found');
    }

    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || 'Cannot delete unit');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete unit');
    }
  } catch (error) {
    console.error('Delete unit error:', error);
    throw error;
  }
}

/**
 * Get available units for listing
 */
export async function getAvailableUnits(token: string, building?: string): Promise<Unit[]> {
  try {
    const params = new URLSearchParams();
    if (building) params.append('building', building);

    const response = await fetch(`${API_URL}/units/available/listing?${params.toString()}`, {
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

/**
 * Room type display names
 */
export const ROOM_TYPE_NAMES = {
  'studio': 'Studio',
  'one-bedroom': '1 Phòng Ngủ',
  'two-bedroom': '2 Phòng Ngủ',
  'three-bedroom': '3 Phòng Ngủ',
};

/**
 * Status display names
 */
export const STATUS_NAMES = {
  'available': 'Trống',
  'occupied': 'Có Người',
  'maintenance': 'Bảo Trì',
  'rented-out': 'Đã Cho Thuê',
};

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

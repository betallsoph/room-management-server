// User Profile Service
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'tenant';
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get current user profile
 */
export async function getProfile(token: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/users/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

/**
 * Update current user profile
 */
export async function updateProfile(
  token: string,
  data: UpdateProfileRequest
): Promise<{ message: string; user: User }> {
  try {
    const response = await fetch(`${API_URL}/users/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Change password
 */
export async function changePassword(
  token: string,
  data: ChangePasswordRequest
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/users/profile/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

// Dashboard service - Get statistics and data for admin dashboard
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface DashboardStatistics {
  units: {
    total: number
    available: number
    occupied: number
    maintenance: number
    occupancyRate: string
  }
  tenants: {
    total: number
    active: number
    inactive: number
  }
  contracts: {
    total: number
    active: number
    expiringSoon: number
  }
  invoices: {
    total: number
    paid: number
    unpaid: number
    overdue: number
  }
  revenue: {
    monthly: number
    total: number
    byMonth: Array<{
      _id: { year: number; month: number }
      total: number
      count: number
    }>
  }
  maintenanceTickets: {
    total: number
    new: number
    assigned: number
    inProgress: number
    completed: number
    rejected: number
  }
  utilityReadings: {
    pendingApproval: number
  }
}

export interface Activity {
  type: 'payment' | 'maintenance' | 'contract'
  title: string
  description: string
  user: string
  timestamp: string
  status: string
  priority?: string
}

// Get dashboard statistics
export async function getDashboardStatistics(token: string): Promise<DashboardStatistics> {
  try {
    const response = await fetch(`${API_URL}/dashboard/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again')
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin access required')
      }
      throw new Error('Failed to fetch dashboard statistics')
    }

    const data = await response.json()
    return data.statistics
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
    throw error
  }
}

// Get recent activities
export async function getRecentActivities(token: string, limit: number = 10): Promise<Activity[]> {
  try {
    const response = await fetch(`${API_URL}/dashboard/activities?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again')
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin access required')
      }
      throw new Error('Failed to fetch activities')
    }

    const data = await response.json()
    return data.activities
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

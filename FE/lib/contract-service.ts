import { authFetch } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Contract {
  _id: string;
  contractNumber: string;
  unit: {
    _id: string;
    unitNumber: string;
    building: string;
  } | string;
  tenant: {
    _id: string;
    name?: string;
    userId?: {
      fullName: string;
      email: string;
    };
  } | string;
  landlord: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: 'active' | 'expired' | 'terminated';
}

export const contractService = {
  // [Admin] Lấy danh sách hợp đồng
  async getContracts(): Promise<{ contracts: Contract[] }> {
    const response = await authFetch(`${API_URL}/contracts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch contracts');
    }
    
    return await response.json();
  },
};

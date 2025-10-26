// Real authentication service - Connected to backend API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Debug log to verify API URL
console.log('🔗 API URL:', API_URL)

// Helper function for authenticated fetch requests
export async function authFetch(url: string, options: RequestInit = {}) {
  // Check if we're in the browser before accessing localStorage
  if (typeof window === 'undefined') {
    return fetch(url, options);
  }
  
  // Try to get token from both localStorage and sessionStorage with correct key name
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || 
                localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('🔑 Auth token:', token ? 'Present ✅' : 'Missing ❌');
  console.log('📍 Token found in:', 
    localStorage.getItem('authToken') ? 'localStorage.authToken' : 
    sessionStorage.getItem('authToken') ? 'sessionStorage.authToken' : 
    localStorage.getItem('token') ? 'localStorage.token' : 
    sessionStorage.getItem('token') ? 'sessionStorage.token' : 'none');
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: "admin" | "tenant"
  }
}

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    console.log('🔐 Login attempt with:', credentials.email)
    console.log('📡 Calling API:', `${API_URL}/auth/login`)
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    console.log('📥 Response status:', response.status)
    const data = await response.json()
    console.log('📦 Response data:', data)

    if (!response.ok) {
      // Handle different error responses from backend
      if (response.status === 401) {
        throw new Error('Sai email hoặc mật khẩu')
      }
      if (response.status === 403) {
        throw new Error('Tài khoản đã bị vô hiệu hóa')
      }
      if (response.status === 400) {
        throw new Error('Vui lòng nhập đầy đủ thông tin')
      }
      throw new Error(data.message || 'Lỗi server, vui lòng thử lại sau')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Không thể kết nối đến server')
  }
}

// Signup interfaces
export interface SignupRequest {
  fullName: string
  email: string
  password: string
  role?: "admin" | "tenant"
}

export interface SignupResponse {
  message: string
  token: string
  user: {
    id: string
    fullName: string
    email: string
    role: "admin" | "tenant"
  }
}

export async function signupUser(credentials: SignupRequest): Promise<SignupResponse> {
  try {
    console.log('📝 Signup attempt with:', credentials.email)
    console.log('📡 Calling API:', `${API_URL}/auth/signup`)
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    console.log('📥 Response status:', response.status)
    const data = await response.json()
    console.log('📦 Response data:', data)

    if (!response.ok) {
      // Handle different error responses from backend
      if (response.status === 409) {
        throw new Error('Email đã được sử dụng')
      }
      if (response.status === 400) {
        throw new Error('Vui lòng nhập đầy đủ thông tin')
      }
      throw new Error(data.message || 'Lỗi server, vui lòng thử lại sau')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Không thể kết nối đến server')
  }
}

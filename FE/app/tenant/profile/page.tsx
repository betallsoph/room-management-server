"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile, updateProfile, changePassword, type User } from "@/lib/user-service"
import { getTenantProfile, uploadDocuments, type TenantProfile } from "@/lib/tenant-portal-service"

export default function TenantProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tenantProfile, setTenantProfile] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  })
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Documents upload
  const [documentsFiles, setDocumentsFiles] = useState<{
    identityCardFront?: File;
    identityCardBack?: File;
    vneidImage?: File;
  }>({})
  const [documentsPreview, setDocumentsPreview] = useState<{
    identityCardFront?: string;
    identityCardBack?: string;
    vneidImage?: string;
  }>({})
  const [documentsLoading, setDocumentsLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "tenant") {
      router.push("/login")
      return
    }

    loadProfile(token)
  }, [router])

  const loadProfile = async (token: string) => {
    try {
      setLoading(true)
      const [userData, tenantData] = await Promise.all([
        getProfile(token),
        getTenantProfile(token)
      ])
      
      setUser(userData)
      setTenantProfile(tenantData)
      
      setProfileForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      })

      // Load existing documents as preview URLs
      if (tenantData.documents) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const baseUrl = apiUrl.replace('/api', '');
        
        setDocumentsPreview({
          identityCardFront: tenantData.documents.identityCardFront 
            ? `${baseUrl}${tenantData.documents.identityCardFront}`
            : undefined,
          identityCardBack: tenantData.documents.identityCardBack
            ? `${baseUrl}${tenantData.documents.identityCardBack}`
            : undefined,
          vneidImage: tenantData.documents.vneidImage
            ? `${baseUrl}${tenantData.documents.vneidImage}`
            : undefined,
        })
      }
    } catch (err: any) {
      console.error("Failed to load profile:", err)
      setError(err.message || "Lỗi tải thông tin tài khoản")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) return

    try {
      setProfileLoading(true)
      const response = await updateProfile(token, {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      })
      
      setSuccessMessage(response.message)
      setUser(response.user)
      
      // Update localStorage if name changed
      if (response.user.fullName) {
        localStorage.setItem("userName", response.user.fullName)
      }
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật thông tin")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }
    
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) return

    try {
      setPasswordLoading(true)
      const response = await changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      
      setSuccessMessage(response.message)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Lỗi đổi mật khẩu")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleFileChange = (fieldName: 'identityCardFront' | 'identityCardBack' | 'vneidImage', file: File | null) => {
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setDocumentsFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));

    setDocumentsPreview(prev => ({
      ...prev,
      [fieldName]: previewUrl
    }));
  };

  const handleDocumentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    
    if (!documentsFiles.identityCardFront && !documentsFiles.identityCardBack && !documentsFiles.vneidImage) {
      setError("Vui lòng chọn ít nhất một file để upload")
      return
    }
    
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    if (!token) return

    try {
      setDocumentsLoading(true)
      const response = await uploadDocuments(token, documentsFiles)
      
      setSuccessMessage(response.message)
      
      // Clear file inputs
      setDocumentsFiles({})
      
      // Reload tenant profile to get updated data
      const updatedTenantData = await getTenantProfile(token)
      setTenantProfile(updatedTenantData)
      
      // Update preview with new URLs from server
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const baseUrl = apiUrl.replace('/api', '');
      
      if (updatedTenantData.documents) {
        setDocumentsPreview({
          identityCardFront: updatedTenantData.documents.identityCardFront 
            ? `${baseUrl}${updatedTenantData.documents.identityCardFront}`
            : undefined,
          identityCardBack: updatedTenantData.documents.identityCardBack
            ? `${baseUrl}${updatedTenantData.documents.identityCardBack}`
            : undefined,
          vneidImage: updatedTenantData.documents.vneidImage
            ? `${baseUrl}${updatedTenantData.documents.vneidImage}`
            : undefined,
        })
      }
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Lỗi tải lên giấy tờ")
    } finally {
      setDocumentsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neo-card bg-card p-6">
          <p className="font-bold">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-black mb-4">HỒ SƠ CỦA TÔI</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="neo-card bg-green-50 border-green-400 p-3">
          <p className="text-sm text-green-700 font-bold">✓ {successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="neo-card bg-red-50 border-red-400 p-3">
          <p className="text-sm text-red-700 font-bold">✗ {error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Profile Information */}
        <div className="neo-card bg-card p-4">
          <h3 className="text-base font-black mb-4">THÔNG TIN CÁ NHÂN</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-bold mb-1">Tên Đầy Đủ</label>
              <input 
                type="text" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input 
                type="email" 
                className="neo-input w-full px-3 py-2 text-sm bg-input opacity-50 cursor-not-allowed" 
                value={profileForm.email}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Số Điện Thoại</label>
              <input 
                type="tel" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <button 
              type="submit" 
              className="neo-button bg-primary text-primary-foreground px-4 py-2 text-sm w-full disabled:opacity-50 hover:neo-shadow transition-all"
              disabled={profileLoading}
            >
              {profileLoading ? "Đang Lưu..." : "Cập Nhật Thông Tin"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="neo-card bg-card p-4">
          <h3 className="text-base font-black mb-4">ĐỔI MẬT KHẨU</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-bold mb-1">Mật Khẩu Hiện Tại</label>
              <input 
                type="password" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Mật Khẩu Mới</label>
              <input 
                type="password" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Tối thiểu 6 ký tự</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Xác Nhận Mật Khẩu Mới</label>
              <input 
                type="password" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button 
              type="submit" 
              className="neo-button bg-primary text-primary-foreground px-4 py-2 text-sm w-full disabled:opacity-50 hover:neo-shadow transition-all"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Đang Cập Nhật..." : "Đổi Mật Khẩu"}
            </button>
          </form>
        </div>
      </div>

      {/* Identity Documents Upload */}
      <div className="neo-card bg-card p-4">
        <h3 className="text-base font-black mb-3 flex items-center gap-2">
          <span>📄</span> GIẤY TỜ TÙY THÂN
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Chọn và upload hình ảnh CCCD (mặt trước, mặt sau) và ảnh chụp VNeID của bạn từ máy tính.
          <br />
          <span className="text-yellow-600">⚠️ Chấp nhận file: JPG, PNG, GIF, WEBP. Tối đa 5MB/file.</span>
        </p>
        
        <form onSubmit={handleDocumentsSubmit} className="space-y-3">
          {/* Identity Card Front */}
          <div>
            <label className="block text-sm font-bold mb-1">
              📷 CCCD Mặt Trước {tenantProfile?.documents?.identityCardFront && <span className="text-green-600">✓</span>}
            </label>
            <input 
              type="file" 
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="neo-input w-full px-3 py-2 text-sm bg-input file:mr-4 file:py-1 file:px-3 file:neo-border file:bg-primary file:text-primary-foreground file:font-bold file:text-xs hover:file:neo-shadow" 
              onChange={(e) => handleFileChange('identityCardFront', e.target.files?.[0] || null)}
            />
            {documentsPreview.identityCardFront && (
              <div className="mt-2 neo-border p-2 bg-muted">
                <img 
                  src={documentsPreview.identityCardFront} 
                  alt="CCCD Mặt Trước" 
                  className="w-full h-40 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E❌ Lỗi%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
            )}
          </div>

          {/* Identity Card Back */}
          <div>
            <label className="block text-sm font-bold mb-1">
              📷 CCCD Mặt Sau {tenantProfile?.documents?.identityCardBack && <span className="text-green-600">✓</span>}
            </label>
            <input 
              type="file" 
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="neo-input w-full px-3 py-2 text-sm bg-input file:mr-4 file:py-1 file:px-3 file:neo-border file:bg-primary file:text-primary-foreground file:font-bold file:text-xs hover:file:neo-shadow" 
              onChange={(e) => handleFileChange('identityCardBack', e.target.files?.[0] || null)}
            />
            {documentsPreview.identityCardBack && (
              <div className="mt-2 neo-border p-2 bg-muted">
                <img 
                  src={documentsPreview.identityCardBack} 
                  alt="CCCD Mặt Sau" 
                  className="w-full h-40 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E❌ Lỗi%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
            )}
          </div>

          {/* VNeID Image */}
          <div>
            <label className="block text-sm font-bold mb-1">
              📱 Hình Ảnh VNeID {tenantProfile?.documents?.vneidImage && <span className="text-green-600">✓</span>}
            </label>
            <input 
              type="file" 
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="neo-input w-full px-3 py-2 text-sm bg-input file:mr-4 file:py-1 file:px-3 file:neo-border file:bg-primary file:text-primary-foreground file:font-bold file:text-xs hover:file:neo-shadow" 
              onChange={(e) => handleFileChange('vneidImage', e.target.files?.[0] || null)}
            />
            {documentsPreview.vneidImage && (
              <div className="mt-2 neo-border p-2 bg-muted">
                <img 
                  src={documentsPreview.vneidImage} 
                  alt="VNeID" 
                  className="w-full h-40 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E❌ Lỗi%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
            )}
          </div>

          {/* Document Status */}
          <div className="flex items-center gap-2 p-2 bg-muted neo-border text-xs">
            <span className="font-bold">Trạng Thái:</span>
            <span>
              CCCD Trước: {tenantProfile?.documents?.identityCardFront ? "✅" : "⏳"}
            </span>
            <span>
              CCCD Sau: {tenantProfile?.documents?.identityCardBack ? "✅" : "⏳"}
            </span>
            <span>
              VNeID: {tenantProfile?.documents?.vneidImage ? "✅" : "⏳"}
            </span>
          </div>

          <button 
            type="submit" 
            className="neo-button bg-primary text-primary-foreground px-4 py-2 text-sm w-full disabled:opacity-50 hover:neo-shadow transition-all"
            disabled={documentsLoading}
          >
            {documentsLoading ? "Đang Tải Lên..." : "Lưu Giấy Tờ"}
          </button>
        </form>
      </div>
    </div>
  )
}

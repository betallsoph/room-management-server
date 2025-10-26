"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile, updateProfile, changePassword, type User } from "@/lib/user-service"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (!token || role !== "admin") {
      router.push("/login")
      return
    }

    loadProfile(token)
  }, [router])

  const loadProfile = async (token: string) => {
    try {
      setLoading(true)
      const userData = await getProfile(token)
      setUser(userData)
      setProfileForm({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      })
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
      <h1 className="text-2xl font-black mb-4">CÀI ĐẶT</h1>

      {/* Messages */}
      {successMessage && (
        <div className="neo-card bg-green-50 border-green-400 p-3">
          <p className="text-sm text-green-700 font-bold">✓ {successMessage}</p>
        </div>
      )}

      {error && (
        <div className="neo-card bg-red-50 border-red-400 p-3">
          <p className="text-sm text-red-700 font-bold">✗ {error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Profile Information */}
        <div className="neo-card bg-card p-4">
          <h3 className="text-base font-black mb-4">THÔNG TIN TÀI KHOẢN</h3>
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
              <label className="block text-sm font-bold mb-1">Điện Thoại</label>
              <input 
                type="tel" 
                className="neo-input w-full px-3 py-2 text-sm bg-input" 
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <button 
              type="submit" 
              className="neo-button bg-primary text-primary-foreground px-4 py-2 text-sm w-full disabled:opacity-50"
              disabled={profileLoading}
            >
              {profileLoading ? "Đang Lưu..." : "Lưu Thay Đổi"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="neo-card bg-card p-4">
          <h3 className="text-base font-black mb-4">THAY ĐỔI MẬT KHẨU</h3>
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
              <label className="block text-sm font-bold mb-1">Xác Nhận Mật Khẩu</label>
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
              className="neo-button bg-primary text-primary-foreground px-4 py-2 text-sm w-full disabled:opacity-50"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Đang Cập Nhật..." : "Cập Nhật Mật Khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { signupUser } from "@/lib/auth-service"
import { NeoButton } from "./neo-button"
import { NeoInput } from "./neo-input"
import { NeoCard } from "./neo-card"
import Link from "next/link"

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  general?: string
}

export function SignupForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"admin" | "tenant">("tenant")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên"
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Họ và tên phải có ít nhất 3 ký tự"
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ"
    }

    // Password validation
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      const response = await signupUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      })

      setSuccessMessage(`Đăng ký thành công! Chào mừng ${response.user.fullName}`)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi server, vui lòng thử lại sau"
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <NeoCard className="w-full max-w-md animate-bounce-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">ĐĂNG KÝ</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Tạo tài khoản mới</p>
        </div>

        {errors.general && (
          <div className="neo-border border-destructive bg-destructive/10 p-3 animate-shake">
            <p className="text-destructive font-bold text-xs md:text-sm uppercase">{errors.general}</p>
          </div>
        )}

        {successMessage && (
          <div className="neo-border border-accent bg-accent/10 p-3 animate-bounce-in">
            <p className="text-accent font-bold text-xs md:text-sm uppercase">{successMessage}</p>
          </div>
        )}

        <NeoInput
          type="text"
          label="Họ và tên"
          placeholder="Nhập họ và tên đầy đủ"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          disabled={loading}
          autoComplete="name"
        />

        <NeoInput
          type="email"
          label="Email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
          autoComplete="email"
        />

        <div className="relative">
          <NeoInput
            type={showPassword ? "text" : "password"}
            label="Mật khẩu"
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-muted-foreground hover:text-foreground font-bold text-xs uppercase transition-colors"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        <div className="relative">
          <NeoInput
            type={showConfirmPassword ? "text" : "password"}
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-10 text-muted-foreground hover:text-foreground font-bold text-xs uppercase transition-colors"
          >
            {showConfirmPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-bold uppercase mb-2">Loại tài khoản</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("tenant")}
              disabled={loading}
              className={`neo-button p-3 text-xs md:text-sm font-black uppercase transition-all ${
                role === "tenant"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              <span className="block text-lg mb-1">🏠</span>
              Khách Thuê
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              disabled={loading}
              className={`neo-button p-3 text-xs md:text-sm font-black uppercase transition-all ${
                role === "admin"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              <span className="block text-lg mb-1">👨‍💼</span>
              Quản Lý
            </button>
          </div>
          {errors.role && <p className="text-destructive text-xs font-bold mt-1 uppercase">{errors.role}</p>}
        </div>

        <NeoButton type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Đăng Ký Ngay
        </NeoButton>

        <div className="text-center pt-2">
          <p className="text-xs md:text-sm mb-2">Đã có tài khoản?</p>
          <Link href="/login">
            <button
              type="button"
              className="neo-button bg-accent text-accent-foreground px-6 py-2 w-full text-xs md:text-sm font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              Đăng Nhập Ngay
            </button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          <p className="font-bold mb-1">💡 Lưu ý:</p>
          <p>Chọn "Khách Thuê" nếu bạn là người thuê phòng</p>
          <p>Chọn "Quản Lý" nếu bạn quản lý tòa nhà</p>
        </div>
      </form>
    </NeoCard>
  )
}

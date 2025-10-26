"use client"

import type React from "react"

import { useState } from "react"
import { loginUser } from "@/lib/auth-service"
import { NeoButton } from "./neo-button"
import { NeoInput } from "./neo-input"
import { NeoCheckbox } from "./neo-checkbox"
import { NeoCard } from "./neo-card"
import Link from "next/link"

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
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
      const response = await loginUser({ email, password })

      // Store token based on remember me preference
      if (rememberMe) {
        localStorage.setItem("authToken", response.token)
        localStorage.setItem("userRole", response.user.role)
        localStorage.setItem("userName", response.user.fullName)
        localStorage.setItem("userEmail", response.user.email)
      } else {
        sessionStorage.setItem("authToken", response.token)
        sessionStorage.setItem("userRole", response.user.role)
        sessionStorage.setItem("userName", response.user.fullName)
        sessionStorage.setItem("userEmail", response.user.email)
      }

      setSuccessMessage(`Đăng nhập thành công! Chào mừng ${response.user.fullName}`)

      // Redirect based on role
      setTimeout(() => {
        const redirectUrl = response.user.role === "admin" ? "/admin" : "/tenant/dashboard"
        window.location.href = redirectUrl
      }, 1500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi server, vui lòng thử lại sau"
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <NeoCard className="w-full max-w-md animate-bounce-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">ĐĂNG NHẬP</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Hệ thống quản lý phòng trọ</p>
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
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-muted-foreground hover:text-foreground font-bold text-xs uppercase transition-colors"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>

        <NeoCheckbox
          label="Ghi nhớ đăng nhập"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading}
        />

        <NeoButton type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Đăng Nhập
        </NeoButton>

        <div className="text-center">
          <p className="text-xs md:text-sm mb-2">Chưa có tài khoản?</p>
          <Link href="/signup">
            <button
              type="button"
              className="neo-button bg-secondary text-secondary-foreground px-4 py-2 w-full text-xs md:text-sm font-black uppercase hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              Đăng Ký Ngay
            </button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          <p className="font-bold mb-1">Hướng dẫn test:</p>
          <p>Đăng nhập bằng email và password đã tạo trong database</p>
          <p className="text-[10px] mt-1">Backend API: http://localhost:3000/api</p>
        </div>
      </form>
    </NeoCard>
  )
}

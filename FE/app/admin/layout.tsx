"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("userRole")
    sessionStorage.removeItem("userName")
    sessionStorage.removeItem("userEmail")
    
    // Redirect to login
    router.push("/login")
  }

  const menuItems = [
    { label: "Bảng Điều Khiển", href: "/admin", icon: "📊" },
    { label: "Quản Lý Phòng", href: "/admin/rooms", icon: "🏠" },
    { label: "Quản Lý Người Thuê", href: "/admin/tenants", icon: "👥" },
    { label: "Quản Lý Bảo Trì", href: "/admin/maintenance", icon: "🔧" },
    { label: "Tài Chính", href: "/admin/finance", icon: "💰" },
    { label: "Báo Cáo", href: "/admin/reports", icon: "📈" },
    { label: "Cài Đặt", href: "/admin/settings", icon: "⚙️" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r-4 border-black transition-all duration-300 flex flex-col overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b-4 border-black">
          <div className="neo-card bg-primary p-4 text-center">
            <h1 className="text-xl font-black text-primary-foreground">{sidebarOpen ? "QUẢN LÝ" : "QL"}</h1>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 neo-border transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground neo-shadow"
                    : "bg-sidebar text-sidebar-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t-4 border-black">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full neo-button bg-secondary text-secondary-foreground py-2 text-xs"
          >
            {sidebarOpen ? "<<" : ">>"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b-4 border-black p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black">TRUNG TÂM CHỦ NHÀ</h2>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="neo-button bg-accent text-accent-foreground px-4 py-2 text-sm">Đăng Xuất</button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

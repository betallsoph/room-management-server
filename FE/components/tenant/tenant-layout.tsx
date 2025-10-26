"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Bell, LogOut } from "lucide-react"

const menuItems = [
  { label: "Bảng Điều Khiển", href: "/tenant/dashboard", icon: "📊" },
  { label: "Phòng Của Tôi", href: "/tenant/room", icon: "🏠" },
  { label: "Hóa Đơn", href: "/tenant/invoices", icon: "💰" },
  { label: "Bảo Trì", href: "/tenant/maintenance", icon: "🔧" },
  { label: "Tin Nhắn", href: "/tenant/messages", icon: "💬" },
  { label: "Hồ Sơ", href: "/tenant/profile", icon: "👤" },
  { label: "Thanh Toán", href: "/tenant/payments", icon: "💳" },
]

export function TenantLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userName, setUserName] = useState("Người Thuê")
  const [userInitials, setUserInitials] = useState("NT")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem("userName") || sessionStorage.getItem("userName")
    if (name) {
      setUserName(name)
      // Generate initials from name
      const nameParts = name.split(" ")
      if (nameParts.length >= 2) {
        setUserInitials(nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0))
      } else {
        setUserInitials(name.substring(0, 2).toUpperCase())
      }
    }
  }, [])

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("userRole")
    sessionStorage.removeItem("userId")
    sessionStorage.removeItem("userEmail")
    
    // Redirect to login
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r-4 border-black transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center font-bold text-sm">TP</div>
            {sidebarOpen && (
              <div className="text-sm font-bold uppercase">
                <div>Tenant</div>
                <div className="text-xs">Portal</div>
              </div>
            )}
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
                className={`flex items-center gap-3 px-4 py-3 neo-border transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground neo-shadow"
                    : "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-bold uppercase">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t-4 border-black">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-destructive text-destructive-foreground neo-border font-bold uppercase text-sm hover:bg-opacity-90 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && "Đăng Xuất"}
          </button>
        </div>

        {/* Toggle Button */}
        <div className="p-4 border-t-4 border-black">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 bg-muted neo-border font-bold hover:bg-muted/80"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold uppercase">Cổng Thông Tin Người Thuê</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 neo-border bg-muted hover:bg-muted/80">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l-4 border-black">
              <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center font-bold text-sm">
                {userInitials}
              </div>
              <div className="text-sm">
                <div className="font-bold">{userName}</div>
                <div className="text-xs text-muted-foreground">Người Thuê</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

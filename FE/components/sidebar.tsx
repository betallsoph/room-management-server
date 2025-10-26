"use client"

const menuItems = [
  { label: "Bảng Điều Khiển", icon: "📊", active: true },
  { label: "Phòng", icon: "🏠", active: false },
  { label: "Người Thuê", icon: "👥", active: false },
  { label: "Tài Chính", icon: "💰", active: false },
  { label: "Cài Đặt", icon: "⚙️", active: false },
]

export default function Sidebar() {
  return (
    <aside className="w-64 neo-border border-r-4 border-black bg-white p-6 flex flex-col gap-8">
      <div className="neo-border border-4 border-black bg-secondary rounded-lg p-4 text-center">
        <p className="font-black text-lg">QUẢN LÝ TÀI SẢN</p>
      </div>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`neo-border border-3 rounded-lg p-4 text-left font-bold transition-all ${
              item.active ? "border-black bg-primary text-black" : "border-black bg-white text-black hover:bg-muted"
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto neo-border border-3 border-black bg-accent rounded-lg p-4 text-center">
        <p className="font-black text-white text-sm">GÓI PREMIUM</p>
        <p className="text-xs text-white mt-1">Tài Sản Không Giới Hạn</p>
      </div>
    </aside>
  )
}

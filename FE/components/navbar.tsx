export default function Navbar() {
  return (
    <nav className="neo-border border-b-4 border-black bg-white px-8 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-black">TRUNG TÂM CHỦ NHÀ</h1>
        <p className="text-sm text-muted-foreground font-semibold">Hệ Thống Quản Lý Tài Sản</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 neo-border border-4 border-black bg-primary rounded-lg flex items-center justify-center font-bold">
          TCN
        </div>
      </div>
    </nav>
  )
}

import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">
            HỆ THỐNG QUẢN LÝ PHÒNG TRỌ
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-semibold">
            Đăng ký tài khoản mới
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

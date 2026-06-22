import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Badge, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import BrandLogo from '@/components/common/BrandLogo'

const schema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập CCCD, SĐT hoặc email'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const from = (location.state as { from?: string } | null)?.from
  const redirectTo = from?.startsWith('/') && from !== '/login' ? from : '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      const auth = res.data.result!
      queryClient.clear()
      setAuth(auth.accessToken, auth)
      toast.success('Đăng nhập thành công!')
      navigate(redirectTo, { replace: true })
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      toast.error(res?.status === 401 ? 'Thông tin đăng nhập không chính xác' : res?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left: Branding */}
      <section className="relative hidden md:flex md:w-1/2 lg:w-3/5 bg-[#001f49] overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#001f49] via-[#003471]/80 to-transparent opacity-90" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <BrandLogo className="h-20 w-20 shrink-0 drop-shadow-[0_8px_18px_rgba(255,255,255,0.22)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold tracking-tight">V-SPACE</h1>
              <p className="text-[#acc7ff] text-sm font-medium">Cổng thông tin chính thống</p>
            </div>
          </div>
          <div className="max-w-xl">
            <h2 className="text-white text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tighter">
              Hiện thực hóa ước mơ <br />
              <span className="text-[#d6e3ff]">an cư lạc nghiệp.</span>
            </h2>
            <p className="text-[#acc7ff] text-lg leading-relaxed mb-12">
              Hệ thống bốc thăm nhà ở xã hội minh bạch, ứng dụng công nghệ số để đảm bảo quyền lợi công bằng cho mọi công dân.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { icon: '✓', title: 'Minh bạch', desc: 'Công khai mọi giai đoạn xét duyệt hồ sơ.' },
            { icon: '⚖', title: 'Công bằng', desc: 'Thuật toán bốc thăm ngẫu nhiên được kiểm chứng.' },
            { icon: '⚡', title: 'Hiệu quả', desc: 'Xử lý hồ sơ trực tuyến, tiết kiệm thời gian.' },
          ].map((item) => (
            <div key={item.title} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
              <div className="text-[#d6e3ff] text-2xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-[#acc7ff] text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Right: Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 md:p-16 bg-[#f8f9fa]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
            <BrandLogo className="h-16 w-16 shrink-0" />
            <h1 className="text-[#001f49] text-2xl font-black tracking-tight">V-SPACE</h1>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-[#191c1d] text-3xl font-bold mb-2">Chào mừng trở lại</h2>
            <p className="text-[#44474e]">Vui lòng đăng nhập để theo dõi tiến độ hồ sơ của bạn.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#44474e] mb-2">
                Số CCCD hoặc Số điện thoại
              </label>
              <div className="relative">
                <Badge size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]" />
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="Nhập số căn cước hoặc SĐT"
                  className="w-full pl-12 pr-4 py-4 bg-[#f3f4f5] border-none rounded-xl focus:ring-2 focus:ring-[#115cb9] outline-none text-[#191c1d] placeholder:text-[#74777f]"
                />
              </div>
              {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#44474e]">Mật khẩu</label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#115cb9] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74777f]" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-[#f3f4f5] border-none rounded-xl focus:ring-2 focus:ring-[#115cb9] outline-none text-[#191c1d] placeholder:text-[#74777f]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#191c1d]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001f49] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#115cb9] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#44474e] mb-4">Bạn chưa có tài khoản công dân?</p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#b6d0ff] text-[#3f5881] rounded-xl font-bold hover:bg-[#465f88] hover:text-white transition-all group"
            >
              Đăng ký tài khoản mới
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[#edeeef] flex flex-wrap justify-center gap-6 opacity-60">
            {['SSL Secure', 'AES-256 Encrypted', 'Gov Standard'].map((badge) => (
              <div key={badge} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                <span>🔒</span> {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-30 p-4 md:px-12 flex justify-between items-center bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.08)] pointer-events-none md:pointer-events-auto">
        <p className="text-[10px] md:text-xs text-[#44474e] font-medium">
          © 2024 Cổng thông tin Nhà ở Xã hội - Chính phủ điện tử
        </p>
        <div className="hidden md:flex gap-6">
          <span className="text-xs text-[#115cb9] font-semibold">Hỗ trợ 24/7</span>
          <span className="text-xs text-[#115cb9] font-semibold">Điều khoản</span>
        </div>
      </footer>
    </div>
  )
}

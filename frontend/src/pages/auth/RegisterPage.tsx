import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import BrandLogo from '@/components/common/BrandLogo'

const schema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      })
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <BrandLogo className="h-16 w-16 shrink-0" />
          <div>
            <h1 className="text-[#001f49] text-xl font-extrabold">V-SPACE</h1>
            <p className="text-[#44474e] text-xs">Đăng ký tài khoản công dân</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#191c1d] mb-6">Tạo tài khoản mới</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#44474e] mb-1">Họ và tên *</label>
            <input
              {...register('fullName')}
              placeholder="Nguyễn Văn An"
              className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] placeholder:text-[#74777f]"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#44474e] mb-1">Email *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] placeholder:text-[#74777f]"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#44474e] mb-1">Số điện thoại</label>
            <input
              {...register('phoneNumber')}
              placeholder="0912345678"
              className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] placeholder:text-[#74777f]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#44474e] mb-1">Ngày sinh</label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#44474e] mb-1">Giới tính</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d]"
              >
                <option value="">Chọn</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#44474e] mb-1">Mật khẩu *</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Ít nhất 8 ký tự"
                className="w-full px-4 py-3 pr-12 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] placeholder:text-[#74777f]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#74777f]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#44474e] mb-1">Xác nhận mật khẩu *</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] placeholder:text-[#74777f]"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#001f49] text-white py-4 rounded-xl font-bold text-base hover:bg-[#115cb9] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className="text-center text-[#44474e] mt-6 text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#115cb9] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

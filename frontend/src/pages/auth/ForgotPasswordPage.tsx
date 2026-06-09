import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Mail, Shield, KeyRound, CheckCircle } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    if (!email) { toast.error('Vui lòng nhập email'); return }
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('OTP đã được gửi đến email của bạn')
      setStep(2)
    } catch {
      toast.error('Email không tồn tại trong hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) { toast.error('Vui lòng nhập OTP'); return }
    setLoading(true)
    try {
      await authApi.verifyOtp(email, otp)
      setStep(3)
    } catch {
      toast.error('OTP không hợp lệ hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { toast.error('Mật khẩu phải có ít nhất 8 ký tự'); return }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu không khớp'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(email, otp, newPassword)
      toast.success('Đặt lại mật khẩu thành công!')
      navigate('/login')
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Nhập email', icon: Mail },
    { num: 2, label: 'Xác nhận OTP', icon: Shield },
    { num: 3, label: 'Mật khẩu mới', icon: KeyRound },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <BrandLogo className="h-16 w-16 shrink-0" />
          <h1 className="text-[#001f49] text-xl font-extrabold">V-SPACE</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-[#e1e3e4] z-0" />
          <div className="absolute top-5 left-0 h-0.5 bg-[#115cb9] z-0 transition-all duration-500"
               style={{ width: `${((step - 1) / 2) * 100}%` }} />
          {steps.map(({ num, label, icon: Icon }) => (
            <div key={num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                step > num ? 'bg-[#115cb9]' : step === num ? 'bg-[#115cb9]' : 'bg-[#e1e3e4]'
              }`}>
                {step > num ? <CheckCircle size={18} className="text-white" /> : <Icon size={18} className={step >= num ? 'text-white' : 'text-[#44474e]'} />}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${step >= num ? 'text-[#001f49]' : 'text-[#44474e]'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-[#191c1d] mb-2">Quên mật khẩu</h2>
              <p className="text-[#44474e] mb-6">Nhập email đã đăng ký để nhận mã OTP.</p>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d]"
                />
                <button onClick={handleSendOtp} disabled={loading}
                  className="w-full bg-[#001f49] text-white py-3 rounded-xl font-bold hover:bg-[#115cb9] transition-colors disabled:opacity-70">
                  {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-[#191c1d] mb-2">Nhập mã OTP</h2>
              <p className="text-[#44474e] mb-6">Mã OTP đã được gửi đến <strong>{email}</strong>. Có hiệu lực trong 5 phút.</p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập 6 chữ số"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] text-center text-2xl font-bold tracking-widest"
                />
                <button onClick={handleVerifyOtp} disabled={loading}
                  className="w-full bg-[#001f49] text-white py-3 rounded-xl font-bold hover:bg-[#115cb9] transition-colors disabled:opacity-70">
                  {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                </button>
                <button onClick={() => setStep(1)} className="w-full text-[#115cb9] font-medium hover:underline text-sm">
                  Gửi lại OTP
                </button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-[#191c1d] mb-2">Đặt mật khẩu mới</h2>
              <p className="text-[#44474e] mb-6">Mật khẩu mới phải có ít nhất 8 ký tự.</p>
              <div className="space-y-4">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d]"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d]"
                />
                <button onClick={handleResetPassword} disabled={loading}
                  className="w-full bg-[#001f49] text-white py-3 rounded-xl font-bold hover:bg-[#115cb9] transition-colors disabled:opacity-70">
                  {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[#44474e] mt-6 text-sm">
          <Link to="/login" className="text-[#115cb9] font-bold hover:underline">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

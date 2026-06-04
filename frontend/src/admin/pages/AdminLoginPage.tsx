import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, LockKeyhole, ShieldAlert, BadgeIcon, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { adminAuthApi } from '@/admin/api/adminAuth'

const inputCls = 'w-full border-0 border-b-2 border-[#74777f] bg-transparent px-0 py-3 pl-8 text-sm font-medium text-[#0d1c2e] placeholder:text-[#74777f]/60 outline-none transition-colors focus:border-[#002045] focus:ring-0'

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const redirectTo = from?.startsWith('/admin') ? from : '/admin/applications'

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo, user?.role])

  const otpValue = useMemo(() => otp.join(''), [otp])

  const handleOtpChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(-1)
    setOtp((current) => current.map((digit, digitIndex) => (digitIndex === index ? nextValue : digit)))
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await adminAuthApi.login({ identifier, password, otp: otpValue })
      const auth = response.data.result!
      setAuth(auth.accessToken, auth)
      toast.success('Da thiet lap phien quan tri')
      navigate(redirectTo, { replace: true })
    } catch (error: unknown) {
      const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response
      toast.error(response?.data?.message || (response?.status === 401 ? 'Thong tin dang nhap admin khong chinh xac' : 'Dang nhap quan tri that bai'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] px-6 py-10 text-[#0d1c2e] [background-image:radial-gradient(#d5e3fc_0.5px,transparent_0.5px)] [background-size:24px_24px]">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl flex-col justify-center">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-[#002045] text-white">
            <Building2 size={36} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002045]">Kho luu tru chu quyen</h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.28em] text-[#43474e]">
            Cong quan tri co quan nha o
          </p>
        </header>

        <section className="mb-6 flex items-start gap-4 border-l-4 border-[#002045] bg-[#e6eeff] p-4">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#002045]" />
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#002045]">Yeu cau phan quyen</p>
            <p className="text-xs leading-relaxed text-[#43474e]">
              Chi nhan su duoc uy quyen moi duoc phep truy cap. Moi thao tac trong he thong deu duoc ghi log va kiem toan.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#c4c6cf]/30 bg-white/85 p-8 shadow-2xl backdrop-blur">
          <form className="space-y-8" onSubmit={onSubmit}>
            <div className="space-y-6">
              <div className="relative">
                <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#43474e]" htmlFor="admin-id">
                  Tai khoan quan tri
                </label>
                <BadgeIcon size={18} className="absolute left-0 top-[2.2rem] text-[#74777f]" />
                <input
                  id="admin-id"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="admin.ledger@gov.arch"
                  className={inputCls}
                />
              </div>

              <div className="relative">
                <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#43474e]" htmlFor="admin-password">
                  Mat khau bao mat
                </label>
                <LockKeyhole size={18} className="absolute left-0 top-[2.2rem] text-[#74777f]" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="border-t border-[#c4c6cf]/30 pt-6">
              <label className="mb-4 block text-center text-[10px] font-bold uppercase tracking-[0.24em] text-[#43474e]">
                Xac minh danh tinh (2FA)
              </label>
              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    className="h-12 w-10 rounded-lg border-2 border-[#c4c6cf]/30 bg-white text-center text-lg font-bold text-[#002045] outline-none transition-colors focus:border-[#002045] sm:h-14 sm:w-12"
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] text-[#74777f]">
                Nhap ma 6 so tu thiet bi RSA SecurID cua ban.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Thiet lap phien bao mat
              <LogIn size={16} />
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

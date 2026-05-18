import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, UploadCloud, CalendarDays, Trophy, CheckCircle, Circle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { applicationApi } from '@/api/application'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import LoadingSpinner from '@/components/common/LoadingSpinner'


const STEPS = ['Khởi tạo', 'Nộp giấy tờ', 'Duyệt sơ bộ', 'Bốc thăm']

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => applicationApi.getDashboard().then((r) => r.data.result!),
  })

  const currentStep = data?.currentApplication
    ? ['DRAFT'].includes(data.currentApplication.status) ? 1
      : ['SUBMITTED', 'UNDER_REVIEW'].includes(data.currentApplication.status) ? 2
      : ['APPROVED', 'LOTTERY_QUALIFIED'].includes(data.currentApplication.status) ? 3
      : 2
    : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Chào buổi sáng'
    if (h < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Welcome */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#001f49] tracking-tight">
            {greeting()}, {user?.fullName?.split(' ').slice(-1)[0] || 'bạn'}
          </h1>
          <p className="text-[#44474e] mt-1">
            Tài khoản: <span className="font-mono font-bold">{user?.email}</span>
            {user?.kycStatus === 'VERIFIED' && (
              <span className="ml-2 text-green-600 text-sm font-semibold">✓ Đã xác thực</span>
            )}
          </p>
        </div>
        {user?.kycStatus !== 'VERIFIED' && (
          <Link to="/kyc" className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl font-semibold text-sm hover:bg-yellow-200 transition-colors">
            ⚠ Chưa xác thực KYC — Xác thực ngay
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stepper */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#001f49]">
                  {data?.currentApplication ? `Hồ sơ đang ở bước: ${STEPS[currentStep] || 'Khởi tạo'}` : 'Chưa có hồ sơ nào'}
                </h2>
                <p className="text-sm text-[#44474e]">
                  {data?.currentApplication
                    ? 'Theo dõi tiến độ xét duyệt hồ sơ của bạn'
                    : 'Đăng ký hồ sơ để bắt đầu'}
                </p>
              </div>
              <Clock size={36} className="text-[#115cb9]" />
            </div>
            <div className="relative flex items-center justify-between mt-4 mb-8">
              <div className="absolute left-0 top-4 w-full h-1 bg-[#e1e3e4] z-0" />
              <div className="absolute left-0 top-4 h-1 bg-[#115cb9] z-0 transition-all duration-700"
                   style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
              {STEPS.map((label, i) => (
                <div key={label} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                    i < currentStep ? 'bg-[#001f49]' : i === currentStep ? 'bg-[#115cb9] w-10 h-10 ring-8' : 'bg-[#e1e3e4]'
                  }`}>
                    {i < currentStep ? <CheckCircle size={16} className="text-white" /> :
                      i === currentStep ? <div className="w-3 h-3 rounded-full bg-white" /> :
                      <Circle size={14} className="text-[#44474e]" />}
                  </div>
                  <span className={`absolute top-12 text-xs whitespace-nowrap font-medium ${i <= currentStep ? 'text-[#001f49] font-bold' : 'text-[#44474e]'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Project + Countdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#001f49] rounded-xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#acc7ff]">Dự án tham gia</span>
                  <h3 className="text-xl font-bold mt-2">
                    {data?.currentApplication?.projectName || 'Chưa đăng ký'}
                  </h3>
                  {data?.stats && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ xét duyệt</span>
                        <span className="font-bold">{Math.round((data.stats.approvedCount / Math.max(data.stats.totalApplications, 1)) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full">
                        <div className="h-full bg-[#d6e3ff] rounded-full transition-all"
                             style={{ width: `${Math.round((data.stats.approvedCount / Math.max(data.stats.totalApplications, 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 text-9xl">🏠</div>
              </div>

              <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#44474e] mb-3">Thống kê hồ sơ</span>
                <div className="grid grid-cols-3 gap-4 w-full">
                  {[
                    { val: data?.stats?.totalApplications || 0, label: 'Tổng' },
                    { val: data?.stats?.pendingCount || 0, label: 'Chờ duyệt' },
                    { val: data?.stats?.approvedCount || 0, label: 'Đã duyệt' },
                  ].map(({ val, label }) => (
                    <div key={label}>
                      <span className="text-3xl font-black text-[#001f49]">{val}</span>
                      <span className="block text-[10px] uppercase font-bold text-[#44474e]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { icon: Trophy, label: 'Xem điểm ưu tiên', path: '/profile' },
                { icon: UploadCloud, label: 'Bổ sung giấy tờ', path: '/profile' },
                { icon: CalendarDays, label: 'Xem lịch bốc thăm', path: '/projects' },
              ].map(({ icon: Icon, label, path }) => (
                <Link key={label} to={path}
                  className="flex flex-col items-center justify-center p-5 bg-[#f3f4f5] rounded-xl hover:bg-[#edeeef] transition-colors group">
                  <Icon size={28} className="text-[#115cb9] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#001f49] text-center">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Timeline */}
        <aside className="lg:col-span-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-[#edeeef] rounded-2xl p-6 h-full">
            <h2 className="text-lg font-bold text-[#001f49] mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[#115cb9]" /> Lịch sử hồ sơ
            </h2>

            {data?.recentNotifications && data.recentNotifications.length > 0 ? (
              <div className="space-y-6 relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#c4c6cf]" />
                {data.recentNotifications.map((notif) => (
                  <div key={notif.id} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#edeeef] flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-[#44474e]' : 'bg-[#115cb9]'}`} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <span className="text-[10px] font-bold text-[#44474e] block mb-1">
                        {dayjs(notif.createdAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                      <h4 className="text-sm font-bold text-[#001f49]">{notif.title}</h4>
                      {notif.content && <p className="text-xs text-[#44474e] mt-1 leading-relaxed">{notif.content}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm text-[#44474e]">Chưa có hoạt động nào</p>
                <Link to="/projects" className="mt-4 inline-block text-[#115cb9] text-sm font-bold hover:underline">
                  Đăng ký hồ sơ ngay →
                </Link>
              </div>
            )}

            <div className="mt-6 bg-[#003471] p-4 rounded-xl">
              <div className="flex gap-3 text-white">
                <span className="text-lg">ℹ️</span>
                <div>
                  <p className="text-xs font-bold">Lưu ý quan trọng</p>
                  <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                    Mọi thông báo chính thức chỉ được gửi qua ứng dụng này và SMS định danh của Chính phủ.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  )
}

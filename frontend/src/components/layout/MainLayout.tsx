import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'
import { Bell, FileText, History, LayoutDashboard, Medal, Radio, SearchCheck, Ticket, TrendingUp } from 'lucide-react'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import OverlaySidebar from './OverlaySidebar'
import BrandLogo from '@/components/common/BrandLogo'
import { applicationApi } from '@/api/application'
import { lotteryApi } from '@/api/lottery'
import { preloadUserProgress } from '@/api/sessionPreload'

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Ho so cua toi', icon: FileText },
  { path: '/progress', label: 'Theo doi tien do', icon: TrendingUp },
  { path: '/priority-score', label: 'Diem uu tien', icon: Medal },
  { path: '/lottery-ticket', label: 'Ma boc tham', icon: Ticket },
  { path: '/lottery-room', label: 'Phong boc tham', icon: Radio },
  { path: '/results-audit', label: 'Ket qua & Audit', icon: SearchCheck },
  { path: '/notifications', label: 'Thong bao', icon: Bell, disabled: true },
  { path: '/activity-history', label: 'Lich su thao tac', icon: History, disabled: true },
]

export default function MainLayout() {
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    void preloadUserProgress(
      (queryKey, loader) => queryClient.prefetchQuery({ queryKey, queryFn: loader, staleTime: 1000 * 60 * 5 }),
      () => applicationApi.getDashboard().then((response) => response.data.result),
      () => lotteryApi.getMySummary().then((response) => response.data.result)
    )
  }, [queryClient])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <Navbar />

      <OverlaySidebar
        open={menuOpen}
        onToggle={() => setMenuOpen((current) => !current)}
        onClose={closeMenu}
      >
        <div className="border-b border-[#d8dde5] px-6 pb-6 pt-20">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-14 w-14 shrink-0" />
            <div>
              <h2 className="text-lg font-black text-[#001f49]">He thong NOXH</h2>
              <p className="text-xs font-medium text-[#465f88]">Cong thong tin chinh thong</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {sidebarItems.map(({ path, label, icon: Icon, disabled }) => (
            disabled ? (
              <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#44546a]/45">
                <Icon size={19} />
                <span>{label}</span>
              </div>
            ) : (
              <NavLink
                key={path}
                to={path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#e1ecff] text-[#0b50c8] shadow-sm'
                      : 'text-[#26364d] hover:bg-white hover:text-[#001f49]'
                  }`
                }
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </nav>
      </OverlaySidebar>

      <main className="min-h-screen pb-24 pt-16 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

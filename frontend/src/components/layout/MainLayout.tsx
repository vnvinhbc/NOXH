import { NavLink, Outlet } from 'react-router-dom'
import { Bell, CalendarClock, FileText, History, LayoutDashboard, Medal, Radio, SearchCheck, Ticket, TrendingUp } from 'lucide-react'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import BrandLogo from '@/components/common/BrandLogo'

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Ho so cua toi', icon: FileText },
  { path: '/progress', label: 'Theo doi tien do', icon: TrendingUp },
  { path: '/priority-score', label: 'Diem uu tien', icon: Medal },
  { path: '/lottery-ticket', label: 'Ma boc tham', icon: Ticket },
  { path: '/lottery-waiting-room', label: 'Sanh cho boc tham', icon: CalendarClock },
  { path: '/lottery-room', label: 'Phong boc tham', icon: Radio },
  { path: '/results-audit', label: 'Ket qua & Audit', icon: SearchCheck },
  { path: '/notifications', label: 'Thong bao', icon: Bell, disabled: true },
  { path: '/activity-history', label: 'Lich su thao tac', icon: History, disabled: true },
]

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <Navbar />
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-72 border-r border-[#e1e3e4]/70 bg-[#f3f4f5] lg:flex lg:flex-col">
        <div className="px-6 py-7">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-14 w-14 shrink-0" />
            <div>
              <h2 className="text-lg font-black text-[#001f49]">He thong NOXH</h2>
              <p className="text-xs font-medium text-[#465f88]">Cong thong tin chinh thong</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {sidebarItems.map(({ path, label, icon: Icon, disabled }) => (
            disabled ? (
              <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#44546a]/50">
                <Icon size={19} />
                <span>{label}</span>
              </div>
            ) : (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-r-4 border-[#0b5ed7] bg-[#e6f0ff] text-[#0b50c8]'
                      : 'text-[#26364d] hover:bg-[#edeeef] hover:text-[#001f49]'
                  }`
                }
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </nav>
      </aside>
      <main className="min-h-screen pb-24 pt-16 md:pb-0 lg:ml-72">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}

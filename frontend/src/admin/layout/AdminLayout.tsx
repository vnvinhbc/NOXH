import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BarChart3, Bell, Building2, Database, FileBadge2, LayoutDashboard, LogOut, ScrollText, Search, Settings, Ticket, Users } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import BrandLogo from '@/components/common/BrandLogo'
import OverlaySidebar from '@/components/layout/OverlaySidebar'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/applications', label: 'Quan ly ho so', icon: FileBadge2 },
  { to: '/admin/projects', label: 'Du lieu du an', icon: Database },
  { to: '/admin/lottery-events', label: 'Quay so NOXH', icon: Ticket },
  { to: '/admin/results', label: 'Ket qua', icon: BarChart3 },
  { to: '/admin/housing-stock', label: 'Kho can ho', icon: Building2 },
  { to: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
  { to: '#', label: 'Nguoi dung', icon: Users, disabled: true },
]

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // session cleanup still needs to happen locally
    } finally {
      queryClient.clear()
      logout()
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e]">
      <OverlaySidebar
        open={menuOpen}
        onToggle={() => setMenuOpen((current) => !current)}
        onClose={closeMenu}
        panelClassName="bg-[#eff4ff]"
      >
        <div className="border-b border-[#c4c6cf]/40 px-6 pb-6 pt-20">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-16 w-16 shrink-0" />
            <div>
              <h2 className="font-bold text-[#002045]">V-SPACE Admin</h2>
              <p className="text-xs text-[#43474e]">Co quan nha o</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navItems.map(({ to, label, icon: Icon, disabled }) => (
            disabled ? (
              <div key={label} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#555f70]/55">
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ) : (
              <NavLink
                key={label}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#d5e3fc] font-bold text-[#002045] shadow-sm'
                      : 'text-[#555f70] hover:bg-white hover:text-[#002045]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="space-y-3 border-t border-[#c4c6cf]/40 p-4">
          <button
            type="button"
            onClick={() => {
              closeMenu()
              navigate('/admin/lottery-events')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md"
          >
            <Bell size={14} />
            Tao dot quay
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#555f70] hover:bg-white hover:text-[#ba1a1a]"
          >
            <LogOut size={18} />
            <span>Dang xuat</span>
          </button>
        </div>
      </OverlaySidebar>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#c4c6cf]/30 bg-[#f8f9ff]/95 pl-20 pr-4 backdrop-blur md:pr-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-xl">
          <Link to="/admin/applications" className="flex shrink-0 items-center gap-2 md:hidden">
            <BrandLogo className="h-12 w-12 shrink-0" />
            <span className="font-bold text-[#002045]">Admin</span>
          </Link>
          <div className="relative hidden w-full md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
            <input
              type="text"
              placeholder="Tim ho so, event, audit log..."
              className="h-10 w-full rounded-lg border border-[#c4c6cf]/40 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#002045]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button type="button" className="text-[#555f70] hover:text-[#002045]">
            <Bell size={18} />
          </button>
          <button type="button" className="hidden text-[#555f70] hover:text-[#002045] sm:block">
            <Settings size={18} />
          </button>
          <div className="hidden h-8 w-px bg-[#c4c6cf]/40 md:block" />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#002045]">{user?.fullName || 'Quan tri vien'}</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#43474e]">Quyen truy cap cap 1</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1a365d] bg-[#d6e3ff] font-bold text-[#002045]">
            {(user?.fullName || 'A').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

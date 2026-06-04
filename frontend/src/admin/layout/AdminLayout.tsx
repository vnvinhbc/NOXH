import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Bell, Building2, FileBadge2, LogOut, Search, Settings, ShieldCheck } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { to: '/admin/applications', label: 'Quan ly ho so', icon: FileBadge2 },
  { to: '#', label: 'KYC/Cham diem', icon: ShieldCheck, disabled: true },
  { to: '#', label: 'Ket qua', icon: BarChart3, disabled: true },
]

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // session cleanup still needs to happen locally
    } finally {
      logout()
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#c4c6cf]/40 bg-[#eff4ff] px-6 py-6 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1a365d] text-white">
            <Building2 size={22} />
          </div>
          <div>
            <h2 className="font-bold text-[#002045]">Quan tri GovTech</h2>
            <p className="text-xs text-[#43474e]">Co quan nha o</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, disabled }) => (
            disabled ? (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#555f70]/70"
              >
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ) : (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-l-4 border-[#002045] bg-[#d5e3fc] font-bold text-[#002045]'
                      : 'text-[#555f70] hover:bg-[#d5e3fc]/60 hover:text-[#002045]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md"
          >
            <Bell size={14} />
            Tao dot boc tham
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#555f70] hover:bg-[#d5e3fc]/60 hover:text-[#ba1a1a]"
          >
            <LogOut size={18} />
            <span>Dang xuat</span>
          </button>
        </div>
      </aside>

      <div className="md:ml-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#c4c6cf]/30 bg-[#f8f9ff]/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:min-w-[20rem]">
            <Link to="/admin/applications" className="flex items-center gap-2 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a365d] text-white">
                <Building2 size={18} />
              </div>
              <span className="font-bold text-[#002045]">Admin</span>
            </Link>
            <div className="relative hidden w-full max-w-xl md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
              <input
                type="text"
                placeholder="Tim theo ma ho so, ten nguoi nop hoac ma boc tham..."
                className="h-10 w-full rounded-lg border border-[#c4c6cf]/40 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#002045]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="text-[#555f70] hover:text-[#002045]">
              <Bell size={18} />
            </button>
            <button type="button" className="text-[#555f70] hover:text-[#002045]">
              <Settings size={18} />
            </button>
            <div className="hidden h-8 w-px bg-[#c4c6cf]/40 md:block" />
            <div className="text-right">
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
    </div>
  )
}

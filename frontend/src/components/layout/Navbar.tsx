import { Link, useLocation } from 'react-router-dom'
import { Bell, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Hồ sơ' },
    { path: '/projects', label: 'Dự án' },
  ]

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      logout()
      navigate('/login')
      toast.success('Đã đăng xuất')
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="text-xl font-bold text-[#001f49] tracking-tight">
          Bốc thăm NOXH
        </Link>
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-[#115cb9] border-b-2 border-[#115cb9] font-bold rounded-none'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#003471] flex items-center justify-center">
            <User size={16} className="text-[#669eff]" />
          </div>
          <span className="text-sm font-semibold text-[#001f49] hidden sm:block">
            {user?.fullName || 'Người dùng'}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors ml-1"
            title="Đăng xuất"
          >
            <LogOut size={16} className="text-slate-500" />
          </button>
        </div>
      </div>
    </nav>
  )
}

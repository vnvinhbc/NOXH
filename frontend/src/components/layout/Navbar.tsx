import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { notificationApi } from '@/api/notification'
import { useAuthStore } from '@/stores/authStore'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuthStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Ho so' },
    { path: '/projects', label: 'Du an' },
  ]

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then((response) => response.data.result || []),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => {
      toast.error('Khong the danh dau thong bao da doc')
    },
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      logout()
      navigate('/login')
      toast.success('Da dang xuat')
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="text-xl font-bold text-[#001f49] tracking-tight">
          Boc tham NOXH
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
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((current) => !current)}
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#c62828] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#001f49]">Thong bao</p>
                  <p className="text-xs text-slate-500">{unreadCount} chua doc</p>
                </div>
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending || notifications.length === 0}
                  className="text-xs font-semibold text-[#115cb9] disabled:text-slate-400"
                >
                  Danh dau da doc
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 6).map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                        notification.isRead ? 'bg-white' : 'bg-[#eff4ff]'
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[#001f49]">{notification.title}</p>
                        {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#115cb9]" />}
                      </div>
                      {notification.content && (
                        <p className="text-xs leading-relaxed text-slate-600">{notification.content}</p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-400">
                        {dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Chua co thong bao nao
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#003471] flex items-center justify-center">
            <User size={16} className="text-[#669eff]" />
          </div>
          <span className="text-sm font-semibold text-[#001f49] hidden sm:block">
            {user?.fullName || 'Nguoi dung'}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors ml-1"
            title="Dang xuat"
          >
            <LogOut size={16} className="text-slate-500" />
          </button>
        </div>
      </div>
    </nav>
  )
}

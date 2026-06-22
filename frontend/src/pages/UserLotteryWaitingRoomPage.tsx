import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Bell, FileText, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function getCountdown(target?: string) {
  if (!target) return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  const diff = Math.max(0, dayjs(target).diff(dayjs(), 'second'))
  return {
    totalSeconds: diff,
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  }
}

export default function UserLotteryWaitingRoomPage() {
  const [, setTick] = useState(0)
  const { data: summary, isLoading } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
    refetchInterval: 1000 * 15,
  })

  useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdownTarget = useMemo(() => {
    if (summary?.scheduledStartAt) return summary.scheduledStartAt
    if (summary?.lockedAt) return dayjs(summary.lockedAt).add(15, 'minute').add(30, 'second').format()
    return undefined
  }, [summary?.lockedAt, summary?.scheduledStartAt])
  const countdown = getCountdown(countdownTarget)
  const canEnterRoom = ['DRAWING', 'COMPLETED'].includes(summary?.eventStatus || '')

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">He thong dang san sang</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-[#001f49]">Sanh cho boc tham</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#44474e]">
            {summary?.eventName || 'Phien boc tham NOXH'} cho du an {summary?.projectName || 'dang tham gia'}.
          </p>
        </div>
        <div className="bg-[#edeeef] px-6 py-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">Trang thai</p>
          <p className="mt-1 font-black text-[#115cb9]">{summary?.eventStatus || 'Dang doi'}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <section className="bg-gradient-to-br from-[#001f49] to-[#003471] p-10 text-center text-white shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#acc7ff]">Thoi gian den gio quay</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ['Ngay', countdown.days],
              ['Gio', countdown.hours],
              ['Phut', countdown.minutes],
              ['Giay', countdown.seconds],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/10 px-4 py-5">
                <p className="text-5xl font-black md:text-7xl">{String(value).padStart(2, '0')}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-[#acc7ff]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 inline-flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-bold">
            <ShieldCheck size={18} />
            {countdownTarget
              ? `Gio quay du kien: ${dayjs(countdownTarget).format('DD/MM/YYYY HH:mm:ss')}`
              : 'Chua co gio quay du kien'}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-[#001f49]">
              <Bell size={20} className="text-[#115cb9]" />
              Thong bao trang thai
            </h2>
            <div className="space-y-4">
              {[
                'He thong da chot danh sach ho so hop le cho phien nay.',
                'Cong sanh cho truc tuyen da mo. Vui long giu ket noi on dinh.',
              ].map((item, index) => (
                <div key={item} className={`bg-[#f3f4f5] p-4 text-sm leading-relaxed text-[#191c1d] ${index === 0 ? 'border-l-4 border-[#115cb9]' : ''}`}>
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-[#001f49]">
              <FileText size={20} className="text-[#115cb9]" />
              Quy tac boc tham
            </h2>
            <ol className="space-y-4 text-sm leading-relaxed text-[#44474e]">
              <li>Ket qua duoc tao bang seed cong khai va hash co the verify lai.</li>
              <li>Ban co the theo doi phong quay truc tuyen khi event bat dau.</li>
              <li>Ket qua cuoi cung duoc cong bo kem audit hash.</li>
            </ol>
            <Link
              to="/lottery-room"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white ${
                canEnterRoom ? 'bg-[#001f49]' : 'bg-[#74777f] pointer-events-none'
              }`}
            >
              <Users size={17} />
              {canEnterRoom ? 'Vao phong boc tham' : 'Cho den gio quay'}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

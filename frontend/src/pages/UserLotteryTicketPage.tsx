import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CalendarDays, Download, MapPin, QrCode, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function UserLotteryTicketPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  const hasTicket = Boolean(summary?.lotteryCode)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Official ticket</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#001f49]">Xac nhan dang ky boc tham</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#44474e]">
          Ma boc tham duoc cap sau khi admin khoa danh sach tham gia. Hay luu ma nay de doi chieu ket qua.
        </p>
      </header>

      {!hasTicket ? (
        <section className="bg-white p-10 text-center shadow-sm">
          <Ticket size={44} className="mx-auto mb-4 text-[#115cb9]" />
          <h2 className="text-2xl font-black text-[#001f49]">Chua co ma boc tham</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#44474e]">
            Ho so can duoc duyet va event can duoc lock truoc khi he thong sinh ma boc tham.
          </p>
          <Link to="/progress" className="mt-6 inline-flex rounded-xl bg-[#001f49] px-6 py-3 text-sm font-black text-white">
            Xem tien do
          </Link>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <section className="overflow-hidden bg-white shadow-sm">
            <div className="bg-gradient-to-br from-[#001f49] to-[#003471] p-8 text-white">
              <div className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-black uppercase tracking-[0.18em]">
                Chinh thuc
              </div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#acc7ff]">Ma so boc tham cua ban</p>
              <h2 className="mt-3 break-all text-5xl font-black tracking-tight">{summary?.lotteryCode}</h2>
            </div>
            <div className="grid gap-6 p-8 md:grid-cols-2">
              {[
                ['Chu ho so', summary?.applicationCode || '-'],
                ['Du an', summary?.projectName || '-'],
                ['Pool', summary?.poolType || (summary?.priorityScore ? 'PRIORITY' : 'NORMAL')],
                ['Trang thai event', summary?.eventStatus || '-'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a99ad]">{label}</p>
                  <p className="mt-2 text-lg font-black text-[#001f49]">{value}</p>
                </div>
              ))}
              <div className="md:col-span-2 grid gap-4 border-t border-[#e1e3e4] pt-6 md:grid-cols-2">
                <div className="flex gap-3">
                  <CalendarDays size={22} className="text-[#115cb9]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a99ad]">Thoi gian</p>
                    <p className="mt-1 font-bold text-[#001f49]">{summary?.startedAt ? dayjs(summary.startedAt).format('DD/MM/YYYY HH:mm') : 'Cho cong bo'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin size={22} className="text-[#115cb9]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a99ad]">Dia diem</p>
                    <p className="mt-1 font-bold text-[#001f49]">Cong thong tin NOXH truc tuyen</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-[#f3f4f5] p-6">
              <h3 className="mb-4 text-lg font-black text-[#001f49]">Xac thuc dien tu</h3>
              <div className="flex h-36 items-center justify-center bg-white">
                <QrCode size={82} className="text-[#001f49]" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#44474e]">Dung ma QR de doi chieu voi trang verification cong khai sau khi co ket qua.</p>
            </section>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#115cb9] px-6 py-4 text-sm font-black text-white shadow-lg">
              <Download size={18} />
              Tai giay xac nhan
            </button>
            <Link to="/lottery-waiting-room" className="flex w-full items-center justify-center rounded-xl bg-[#edeeef] px-6 py-4 text-sm font-black text-[#001f49]">
              Xem lich boc tham
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}

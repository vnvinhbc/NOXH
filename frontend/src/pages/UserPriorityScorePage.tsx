import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Medal, ShieldCheck } from 'lucide-react'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function UserPriorityScorePage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  const score = summary?.priorityScore || 0
  const isPriority = score > 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Priority pool</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#001f49]">Nhom uu tien xet duyet</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#44474e]">
          He thong chi phan biet nhom uu tien va nhom thuong. Co doi tuong uu tien thi diem la 100, khong co thi diem la 0.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden bg-white shadow-sm">
          <div className="bg-[#edeeef] px-6 py-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-[#001f49]">
              <ShieldCheck size={22} className="text-[#115cb9]" />
              Ket qua phan nhom
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-[#f3f4f5] p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">Doi tuong</p>
                <p className="mt-3 text-lg font-black text-[#001f49]">{summary?.priorityCategory || 'Khong co doi tuong uu tien'}</p>
              </div>
              <div className="bg-[#f3f4f5] p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">Pool</p>
                <p className="mt-3 text-lg font-black text-[#001f49]">{isPriority ? 'PRIORITY' : 'NORMAL'}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ['Co doi tuong uu tien hop le', isPriority ? 'Dat' : 'Khong ap dung'],
                ['Diem uu tien', String(score)],
                ['Quyen trong quay so', isPriority ? 'Duoc dam bao trung suat neu du can' : 'Tham gia pool normal'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between bg-[#f8f9fa] px-5 py-4">
                  <span className="text-sm font-semibold text-[#191c1d]">{label}</span>
                  <span className="rounded-full bg-[#d6e3ff] px-3 py-1 text-xs font-black text-[#001f49]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-gradient-to-br from-[#001f49] to-[#003471] p-8 text-white shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#acc7ff]">Tong diem</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-7xl font-black">{score}</span>
              <span className="pb-3 text-2xl font-bold text-[#acc7ff]">/100</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-blue-100">
              {isPriority
                ? 'Ho so cua ban thuoc nhom uu tien. Tat ca ho so uu tien co cung muc uu tien.'
                : 'Ho so cua ban thuoc nhom thuong va se tham gia quay random khi con can ho.'}
            </p>
          </section>
          <section className="bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-black text-[#001f49]">
              <Medal size={20} className="text-[#115cb9]" />
              Quy dinh hien tai
            </h3>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#44474e]">
              <p className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#115cb9]" /> Co doi tuong uu tien khac "Khong" se duoc tinh 100 diem.</p>
              <p className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#115cb9]" /> Khong cong don nhieu tieu chi, khong xep hang trong nhom uu tien.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

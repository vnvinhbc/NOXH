import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Circle, Clock3, FileText, ShieldCheck, Ticket } from 'lucide-react'
import { applicationApi } from '@/api/application'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const steps = [
  { key: 'profile', label: 'Tao ho so', icon: FileText },
  { key: 'review', label: 'Duyet so bo', icon: ShieldCheck },
  { key: 'ticket', label: 'Cap ma boc tham', icon: Ticket },
  { key: 'draw', label: 'Boc tham', icon: Clock3 },
]

function resolveStep(status?: string, eventStatus?: string) {
  if (eventStatus === 'COMPLETED') return 4
  if (eventStatus === 'DRAWING' || eventStatus === 'LOCKED') return 3
  if (status === 'APPROVED' || status === 'LOTTERY_QUALIFIED') return 2
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') return 1
  return 0
}

export default function UserProgressPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => applicationApi.getDashboard().then((res) => res.data.result),
  })
  const { data: summary } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  const current = dashboard?.currentApplication
  const activeStep = resolveStep(current?.status, summary?.eventStatus)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Application tracking</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#001f49]">Theo doi tien do ho so</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#44474e]">
          Cap nhat trang thai xu ly ho so, ma boc tham va ket qua quay so cua ban.
        </p>
      </header>

      <section className="bg-white p-8 shadow-sm">
        <div className="relative grid gap-6 md:grid-cols-4">
          <div className="absolute left-0 top-8 hidden h-1 w-full bg-[#e1e3e4] md:block" />
          <div
            className="absolute left-0 top-8 hidden h-1 bg-[#115cb9] transition-all md:block"
            style={{ width: `${Math.max(0, (activeStep / (steps.length - 1)) * 100)}%` }}
          />
          {steps.map(({ key, label, icon: Icon }, index) => {
            const completed = index < activeStep
            const active = index === activeStep
            return (
              <div key={key} className="relative z-10 flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-8 ring-white ${
                  completed ? 'bg-[#001f49] text-white' : active ? 'bg-[#115cb9] text-white' : 'bg-[#edeeef] text-[#44474e]'
                }`}>
                  {completed ? <CheckCircle2 size={24} /> : active ? <Icon size={24} /> : <Circle size={22} />}
                </div>
                <div>
                  <p className={`font-black ${index <= activeStep ? 'text-[#001f49]' : 'text-[#44474e]'}`}>{label}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {index === 0 ? current?.applicationCode || 'Chua co ho so' :
                      index === 1 ? current?.status || '-' :
                      index === 2 ? summary?.lotteryCode || 'Chua cap ma' :
                      summary?.eventStatus || 'Chua quay'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ['Ho so', current?.status || 'Chua co'],
          ['Du an', current?.projectName || summary?.projectName || '-'],
          ['Lottery', summary?.eventStatus || 'Chua tham gia'],
        ].map(([label, value]) => (
          <section key={label} className="bg-[#f3f4f5] p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">{label}</p>
            <p className="mt-3 text-xl font-black text-[#001f49]">{value}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

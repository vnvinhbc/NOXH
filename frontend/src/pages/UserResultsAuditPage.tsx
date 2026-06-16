import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Hash, Search, ShieldCheck } from 'lucide-react'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 12)}...${value.slice(-8)}`
}

export default function UserResultsAuditPage() {
  const [query, setQuery] = useState('')
  const { data: summary, isLoading } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
  })
  const { data: verification, isLoading: loadingVerification } = useQuery({
    queryKey: ['lotteryVerification', summary?.eventId],
    queryFn: () => lotteryApi.getVerification(summary?.eventId || '').then((res) => res.data.result),
    enabled: Boolean(summary?.eventId),
  })

  const myResult = useMemo(() => {
    if (!verification?.results || !summary?.lotteryCode) return null
    return verification.results.find((result) => result.lotteryCode === summary.lotteryCode) || null
  }, [summary?.lotteryCode, verification?.results])

  const filteredResults = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const results = verification?.results || []
    if (!keyword) return results.slice(0, 8)
    return results.filter((result) =>
      result.lotteryCode.toLowerCase().includes(keyword) ||
      (result.apartmentCode || '').toLowerCase().includes(keyword) ||
      result.resultType.toLowerCase().includes(keyword)
    ).slice(0, 20)
  }, [query, verification?.results])

  if (isLoading || loadingVerification) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  const won = myResult && myResult.resultType !== 'NOT_SELECTED'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {won ? (
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#001f49] to-[#115cb9] p-10 text-white shadow-xl">
          <p className="mb-4 inline-flex rounded-full bg-white/18 px-4 py-1 text-xs font-black uppercase tracking-[0.18em]">Thong bao chinh thuc</p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight">Chuc mung ban da trung tuyen boc tham</h1>
          <p className="mt-5 max-w-2xl text-lg text-blue-100">Ho so cua ban nam trong danh sach trung tuyen cua event {summary?.eventName}.</p>
        </section>
      ) : (
        <header className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Result transparency</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#001f49]">Tra cuu ket qua & minh bach audit</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#44474e]">Ket qua quay so duoc cong khai kem seed va hash de doi chieu doc lap.</p>
        </header>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <section className="space-y-6">
          <div className="bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-black text-[#001f49]">Ket qua cua ban</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Ma boc tham', summary?.lotteryCode || '-'],
                ['Ket qua', myResult?.resultType || summary?.resultType || 'Chua co'],
                ['Can ho', myResult?.apartmentCode || summary?.apartmentCode || '-'],
                ['Thu tu', myResult?.drawOrder || summary?.drawOrder || '-'],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#f3f4f5] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">{label}</p>
                  <p className="mt-2 text-xl font-black text-[#001f49]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="overflow-hidden bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#edeeef] px-6 py-5">
              <h2 className="text-xl font-black text-[#001f49]">Danh sach ket qua cong khai</h2>
              <label className="relative block w-full max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tra cuu ma boc tham..." className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm outline-none" />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#f8f9fa] text-[#44474e]">
                  <tr>
                    {['Ma boc tham', 'Pool', 'Ket qua', 'Can ho', 'Hash'].map((header) => (
                      <th key={header} className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em]">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e3e4]/70">
                  {filteredResults.map((result) => (
                    <tr key={result.participantId} className={result.lotteryCode === summary?.lotteryCode ? 'bg-[#e6f0ff]' : ''}>
                      <td className="px-5 py-4 font-mono text-xs font-black text-[#001f49]">{result.lotteryCode}</td>
                      <td className="px-5 py-4 text-sm text-[#44474e]">{result.poolType}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#001f49]">{result.resultType}</td>
                      <td className="px-5 py-4 text-sm text-[#44474e]">{result.apartmentCode || '-'}</td>
                      <td className="px-5 py-4 font-mono text-xs text-[#44474e]">{shortHash(result.winnerUnitHash || result.normalRandomValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="bg-[#001f49] p-6 text-white">
            <h2 className="mb-4 text-xl font-black">Bao cao tong thuat</h2>
            <p className="text-sm leading-relaxed text-blue-100">Tai ve du lieu JSON cong khai de tu kiem tra ket qua boc tham.</p>
            {summary?.eventId && (
              <div className="mt-5 space-y-3">
                {['participants.json', 'apartments.json', 'results.json', 'verification.json'].map((file) => (
                  <a key={file} href={`/api/lottery-events/${summary.eventId}/${file}`} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 text-sm font-black">
                    {file}
                    <Download size={15} />
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-[#001f49]">
              <ShieldCheck size={20} className="text-[#115cb9]" />
              Du lieu audit
            </h2>
            <div className="space-y-3">
              {[
                ['Participant hash', verification?.participantHash],
                ['Apartment hash', verification?.apartmentHash],
                ['Final seed', verification?.finalSeed],
                ['Result hash', verification?.resultHash],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#f3f4f5] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#465f88]">{label}</p>
                  <p className="mt-1 break-all font-mono text-xs text-[#001f49]">{shortHash(value)}</p>
                </div>
              ))}
            </div>
            {summary?.eventId && (
              <a href={`/lottery-events/${summary.eventId}/verification`} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#edeeef] px-5 py-3 text-sm font-black text-[#001f49]">
                <Hash size={16} />
                Xac thuc doc lap
              </a>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

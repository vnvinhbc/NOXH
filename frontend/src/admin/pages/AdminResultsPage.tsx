import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Award, Download, Hash, Search } from 'lucide-react'
import { adminLotteryApi } from '@/admin/api/adminLottery'
import api from '@/api/axios'
import type { ApiResponse, LotteryResultResponse } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 12)}...${value.slice(-8)}`
}

export default function AdminResultsPage() {
  const [eventId, setEventId] = useState('')
  const [query, setQuery] = useState('')

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['adminLotteryEvents'],
    queryFn: () => adminLotteryApi.getEvents().then((res) => res.data.result || []),
  })

  const completedEvents = useMemo(() => events.filter((event) => event.status === 'COMPLETED'), [events])
  const selectedEventId = eventId || completedEvents[0]?.id || ''
  const selectedEvent = events.find((event) => event.id === selectedEventId)

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['adminLotteryResults', selectedEventId],
    queryFn: () => api.get<ApiResponse<LotteryResultResponse[]>>(`/lottery-events/${selectedEventId}/results.json`).then((res) => res.data.result || []),
    enabled: Boolean(selectedEventId),
  })

  const filteredResults = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return results
    return results.filter((result) =>
      result.lotteryCode.toLowerCase().includes(keyword) ||
      result.resultType.toLowerCase().includes(keyword) ||
      (result.apartmentCode || '').toLowerCase().includes(keyword)
    )
  }, [query, results])

  if (loadingEvents) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">Lottery archive</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">Ket qua quay so</h1>
        </div>
        {selectedEvent && (
          <a href={`/lottery-events/${selectedEvent.id}/verification`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            <Hash size={15} />
            Verification
          </a>
        )}
      </div>

      <section className="mb-6 grid gap-4 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(260px,0.4fr)]">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Event
          <select value={selectedEventId} onChange={(event) => setEventId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#002045]">
            {completedEvents.map((event) => (
              <option key={event.id} value={event.id}>{event.name} - {event.projectName}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Tim kiem
          <span className="relative mt-2 block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ma boc tham, can ho..." className="h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white pl-10 pr-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]" />
          </span>
        </label>
      </section>

      <section className="overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#eff4ff] px-5 py-4">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#002045]" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Danh sach ket qua</h2>
          </div>
          <button type="button" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#002045]">
            <Download size={14} />
            Export
          </button>
        </div>
        {loadingResults ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8f9ff] text-[#43474e]">
                <tr>
                  {['Thu tu', 'Ma boc tham', 'Pool', 'Ket qua', 'Can ho', 'Normal hash', 'Winner hash'].map((header) => (
                    <th key={header} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {filteredResults.map((result) => (
                  <tr key={`${result.eventId}-${result.lotteryCode}`} className="hover:bg-[#eff4ff]/50">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#002045]">{result.drawOrder ?? '-'}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#002045]">{result.lotteryCode}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{result.poolType}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0d1c2e]">{result.resultType}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{result.apartmentCode || '-'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#555f70]">{shortHash(result.normalRandomValue)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#555f70]">{shortHash(result.winnerUnitHash)}</td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-[#555f70]">
                      Chua co ket qua cho event dang chon.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

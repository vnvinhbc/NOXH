import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Copy, Hash, Search, ShieldCheck } from 'lucide-react'
import { adminAuditLogsApi } from '@/admin/api/adminAuditLogs'
import { adminLotteryApi } from '@/admin/api/adminLottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 12)}...${value.slice(-8)}`
}

export default function AdminAuditLogPage() {
  const [eventId, setEventId] = useState('')
  const [query, setQuery] = useState('')

  const { data: events = [] } = useQuery({
    queryKey: ['adminLotteryEvents'],
    queryFn: () => adminLotteryApi.getEvents().then((res) => res.data.result || []),
  })

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['adminAuditLogs', eventId],
    queryFn: () => adminAuditLogsApi.getLogs(eventId || undefined).then((res) => res.data.result || []),
  })

  const filteredLogs = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return logs
    return logs.filter((log) =>
      log.eventType.toLowerCase().includes(keyword) ||
      log.eventName.toLowerCase().includes(keyword) ||
      log.projectName.toLowerCase().includes(keyword) ||
      (log.payload || '').toLowerCase().includes(keyword) ||
      log.currentHash.toLowerCase().includes(keyword)
    )
  }, [logs, query])

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">Immutability ledger</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">Audit Trail</h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#dce9ff] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#002045]">
          <ShieldCheck size={15} />
          Hash chain enabled
        </div>
      </div>

      <section className="mb-6 grid gap-4 bg-white p-5 shadow-sm md:grid-cols-[minmax(220px,0.45fr)_minmax(260px,1fr)]">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Event
          <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white px-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]">
            <option value="">Tat ca event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Tim kiem
          <span className="relative mt-2 block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Event type, hash, payload..." className="h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white pl-10 pr-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]" />
          </span>
        </label>
      </section>

      <section className="overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#eff4ff] px-5 py-4">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#002045]" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Ledger entries</h2>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#465f88]">{filteredLogs.length.toLocaleString('vi-VN')} entries</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8f9ff] text-[#43474e]">
                <tr>
                  {['Timestamp', 'Event', 'Project', 'Type', 'Payload', 'Previous hash', 'Current hash', ''].map((header) => (
                    <th key={header} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#eff4ff]/50">
                    <td className="px-5 py-4 text-sm text-[#555f70]">{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0d1c2e]">{log.eventName}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{log.projectName}</td>
                    <td className="px-5 py-4 text-xs font-bold text-[#002045]">{log.eventType}</td>
                    <td className="max-w-sm truncate px-5 py-4 font-mono text-xs text-[#555f70]">{log.payload || '-'}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#555f70]">{shortHash(log.previousHash)}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#002045]">{shortHash(log.currentHash)}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => navigator.clipboard?.writeText(log.currentHash)} className="text-[#465f88] hover:text-[#002045]" aria-label="Copy hash">
                        <Copy size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-[#555f70]">
                      Chua co audit log phu hop.
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

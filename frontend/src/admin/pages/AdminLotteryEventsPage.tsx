import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { AlertTriangle, Building2, CheckCircle2, Copy, Hash, Lock, Play, Plus, Radio, Ticket, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminLotteryApi } from '@/admin/api/adminLottery'
import { projectApi } from '@/api/project'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { LotteryEventResponse } from '@/types'

function statusTone(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700'
    case 'LOCKED':
      return 'bg-[#d6e3ff] text-[#002045]'
    case 'DRAWING':
      return 'bg-[#ffddba] text-[#633f0f]'
    case 'FAILED':
      return 'bg-[#ffdad6] text-[#93000a]'
    case 'CANCELLED':
      return 'bg-[#eef0f3] text-[#555f70]'
    default:
      return 'bg-[#eef0f3] text-[#43474e]'
  }
}

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function buildWsUrl() {
  const configuredWsUrl = import.meta.env.VITE_WS_URL
  if (configuredWsUrl) return configuredWsUrl
  const apiTarget = import.meta.env.VITE_API_PROXY_TARGET
  if (apiTarget) return `${apiTarget.replace(/^http/, 'ws').replace(/\/$/, '')}/ws`
  if (window.location.hostname === 'localhost' && window.location.port === '3000') return 'ws://localhost:8080/ws'
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/ws`
}

function useLotterySocket(eventId?: string) {
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    if (!eventId) return
    const socket = new WebSocket(buildWsUrl())
    const sendFrame = (frame: string) => socket.send(`${frame}\u0000`)

    socket.onopen = () => {
      sendFrame('CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n')
    }
    socket.onmessage = (message) => {
      const raw = String(message.data)
      if (raw.startsWith('CONNECTED')) {
        sendFrame(`SUBSCRIBE\nid:lottery-${eventId}\ndestination:/topic/lottery-events/${eventId}\n\n`)
        setEvents((current) => ['CONNECTED', ...current].slice(0, 8))
        return
      }
      if (raw.startsWith('MESSAGE')) {
        const body = raw.split('\n\n')[1]?.replace(/\u0000/g, '')
        try {
          const parsed = JSON.parse(body)
          setEvents((current) => [parsed.type || 'MESSAGE', ...current].slice(0, 8))
        } catch {
          setEvents((current) => ['MESSAGE', ...current].slice(0, 8))
        }
      }
    }
    socket.onerror = () => setEvents((current) => ['SOCKET_ERROR', ...current].slice(0, 8))
    return () => socket.close()
  }, [eventId])

  return events
}

export default function AdminLotteryEventsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [eventName, setEventName] = useState('Dot quay NOXH')
  const [scheduledStartAt, setScheduledStartAt] = useState(dayjs().add(15, 'minute').add(30, 'second').format('YYYY-MM-DDTHH:mm'))
  const [projectId, setProjectId] = useState('')
  const [seedEvent, setSeedEvent] = useState<LotteryEventResponse | null>(null)
  const [seedForm, setSeedForm] = useState({
    xsmbDrawDate: dayjs().format('YYYY-MM-DD'),
    xsmbResult: '',
    ethChainId: 1,
    ethBlockNumber: 1,
    ethBlockHash: '',
    sourceNote: 'Manual input for demo',
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data.result || []),
  })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['adminLotteryEvents'],
    queryFn: () => adminLotteryApi.getEvents().then((res) => res.data.result || []),
  })

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) || events[0] || null,
    [events, selectedId]
  )
  const socketEvents = useLotterySocket(selectedEvent?.id)

  useEffect(() => {
    if (!projectId && projects[0]?.id) setProjectId(projects[0].id)
  }, [projectId, projects])

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminLotteryEvents'] })
    queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] })
  }

  const createMutation = useMutation({
    mutationFn: () => adminLotteryApi.createEvent({ projectId, name: eventName, scheduledStartAt }),
    onSuccess: (res) => {
      setSelectedId(res.data.result?.id || null)
      refresh()
      toast.success('Da tao dot quay va commitment hash')
    },
    onError: () => toast.error('Khong the tao dot quay'),
  })

  const lockMutation = useMutation({
    mutationFn: (eventId: string) => adminLotteryApi.lockEvent(eventId),
    onSuccess: () => {
      refresh()
      toast.success('Da khoa danh sach ho so va can ho')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Khong the lock event')
    },
  })

  const startMutation = useMutation({
    mutationFn: () => {
      if (!seedEvent) throw new Error('Missing event')
      return adminLotteryApi.startEvent(seedEvent.id, seedForm)
    },
    onSuccess: () => {
      setSeedEvent(null)
      refresh()
      toast.success('Da chay quay so')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Khong the bat dau quay')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => adminLotteryApi.deleteEvent(eventId),
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ['adminLotteryEvents'] })
      const previousEvents = queryClient.getQueryData<LotteryEventResponse[]>(['adminLotteryEvents'])
      queryClient.setQueryData<LotteryEventResponse[]>(['adminLotteryEvents'], (current = []) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status: 'CANCELLED',
                participantCount: 0,
                apartmentCount: 0,
                resultCount: 0,
                failedReason: undefined,
              }
            : event
        )
      )
      return { previousEvents }
    },
    onSuccess: (res, eventId) => {
      const cancelledEvent = res.data.result
      queryClient.setQueryData<LotteryEventResponse[]>(['adminLotteryEvents'], (current = []) =>
        current.map((event) => (event.id === eventId && cancelledEvent ? cancelledEvent : event))
      )
      queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] })
      toast.success('Da huy event va giai phong du lieu lock')
    },
    onError: (error: unknown, _eventId, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['adminLotteryEvents'], context.previousEvents)
      }
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Khong the huy event nay')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLotteryEvents'] })
    },
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-[#43474e]">
          <span>Kho luu tru</span>
          <span>/</span>
          <span className="font-semibold text-[#002045]">Quay so NOXH</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-[#0d1c2e]">Quan ly dot quay</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#43474e]">
          Lock ho so da duyet, nhap nguon seed cong khai thu cong va cong bo ket qua co the verify lai.
        </p>
      </div>

      <section className="mb-8 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Ten dot quay
          <input
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#002045]"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Du an
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#002045]"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Gio quay du kien
          <input
            type="datetime-local"
            value={scheduledStartAt}
            onChange={(event) => setScheduledStartAt(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-[#002045]"
          />
        </label>
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          disabled={!projectId || !eventName.trim() || !scheduledStartAt || createMutation.isPending}
          className="flex h-11 items-center justify-center gap-2 self-end rounded-lg bg-[#002045] px-5 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
        >
          <Plus size={15} />
          Tao event
        </button>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
        <section className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="border-b border-[#c4c6cf]/20 bg-[#eff4ff] p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#002045]">Danh sach event</h2>
          </div>
          <div className="divide-y divide-[#c4c6cf]/20">
            {events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedId(event.id)}
                className={`grid w-full gap-4 p-5 text-left transition hover:bg-[#eff4ff]/60 md:grid-cols-[1fr_auto] ${
                  selectedEvent?.id === event.id ? 'bg-[#eff4ff]/50' : ''
                }`}
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone(event.status)}`}>{event.status}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#43474e]">{event.algorithmType}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#002045]">{event.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#555f70]">
                    <Building2 size={14} />
                    {event.projectName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#465f88]">
                    Gio quay: {event.scheduledStartAt ? dayjs(event.scheduledStartAt).format('DD/MM/YYYY HH:mm') : '-'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center md:min-w-[20rem]">
                  <div className="rounded-lg bg-[#f8f9ff] p-3">
                    <p className="text-lg font-black text-[#002045]">{event.participantCount}</p>
                    <p className="text-[10px] font-bold uppercase text-[#555f70]">Ho so</p>
                  </div>
                  <div className="rounded-lg bg-[#f8f9ff] p-3">
                    <p className="text-lg font-black text-[#002045]">{event.apartmentCount}</p>
                    <p className="text-[10px] font-bold uppercase text-[#555f70]">Can ho</p>
                  </div>
                  <div className="rounded-lg bg-[#f8f9ff] p-3">
                    <p className="text-lg font-black text-[#002045]">{event.resultCount}</p>
                    <p className="text-[10px] font-bold uppercase text-[#555f70]">Ket qua</p>
                  </div>
                </div>
              </button>
            ))}
            {events.length === 0 && (
              <div className="py-16 text-center text-sm text-[#555f70]">Chua co dot quay nao.</div>
            )}
          </div>
        </section>

        <aside className="rounded-xl border border-[#c4c6cf]/20 bg-[#dce9ff]/40 p-6">
          {selectedEvent ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#43474e]">Event dang chon</p>
                <h2 className="mt-2 text-2xl font-bold text-[#002045]">{selectedEvent.name}</h2>
                <p className="mt-1 text-sm text-[#555f70]">{selectedEvent.projectName}</p>
              </div>

              <div className="grid gap-3 text-sm">
                {[
                  ['Commitment', selectedEvent.commitmentHash],
                  ['Participant', selectedEvent.participantHash],
                  ['Apartment', selectedEvent.apartmentHash],
                  ['Final seed', selectedEvent.finalSeed],
                  ['Result', selectedEvent.resultHash],
                ].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => value && navigator.clipboard?.writeText(value)}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-left shadow-sm"
                  >
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">{label}</span>
                      <span className="font-mono text-xs text-[#002045]">{shortHash(value)}</span>
                    </span>
                    <Copy size={14} className="text-[#555f70]" />
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => lockMutation.mutate(selectedEvent.id)}
                  disabled={selectedEvent.status !== 'SEED_COMMITTED' || lockMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#002045] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50"
                >
                  <Lock size={14} />
                  Lock event
                </button>
                <button
                  type="button"
                  onClick={() => setSeedEvent(selectedEvent)}
                  disabled={selectedEvent.status !== 'LOCKED'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#115cb9] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50"
                >
                  <Play size={14} />
                  Nhap seed va quay
                </button>
                {selectedEvent.status === 'COMPLETED' && (
                  <a
                    href={`/lottery-events/${selectedEvent.id}/verification`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#002045]/20 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#002045]"
                  >
                    <Hash size={14} />
                    Xem verification
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Huy event nay? Neu event da lock, can ho va ho so se duoc tra ve trang thai tu do.')) {
                      deleteMutation.mutate(selectedEvent.id)
                    }
                  }}
                  disabled={
                    !['SEED_COMMITTED', 'LOCKED', 'FAILED'].includes(selectedEvent.status) ||
                    selectedEvent.resultCount > 0 ||
                    deleteMutation.isPending
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#93000a]/20 bg-[#ffdad6] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#93000a] disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Huy event
                </button>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#002045]">
                  <Radio size={15} />
                  Realtime
                </p>
                <div className="space-y-2">
                  {socketEvents.length > 0 ? socketEvents.map((event, index) => (
                    <div key={`${event}-${index}`} className="rounded-lg bg-[#eff4ff] px-3 py-2 text-xs font-bold text-[#002045]">
                      {event}
                    </div>
                  )) : (
                    <p className="text-xs text-[#555f70]">Dang cho su kien tu WebSocket.</p>
                  )}
                </div>
              </div>

              {selectedEvent.failedReason && (
                <div className="rounded-xl bg-[#ffdad6] p-4 text-sm text-[#93000a]">
                  <AlertTriangle size={16} className="mb-2" />
                  {selectedEvent.failedReason}
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-[#555f70]">
              Chon hoac tao mot event.
            </div>
          )}
        </aside>
      </div>

      {seedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">Manual seed source</p>
                <h2 className="mt-1 text-2xl font-bold text-[#002045]">{seedEvent.name}</h2>
              </div>
              <Ticket className="text-[#115cb9]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                Ngay XSMB
                <input type="date" value={seedForm.xsmbDrawDate} onChange={(event) => setSeedForm({ ...seedForm, xsmbDrawDate: event.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                Ket qua XSMB
                <input value={seedForm.xsmbResult} onChange={(event) => setSeedForm({ ...seedForm, xsmbResult: event.target.value })} placeholder="VD: 12345" className="mt-2 h-11 w-full rounded-lg border px-3 text-sm normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                ETH chain id
                <input type="number" value={seedForm.ethChainId} onChange={(event) => setSeedForm({ ...seedForm, ethChainId: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                ETH block number
                <input type="number" value={seedForm.ethBlockNumber} onChange={(event) => setSeedForm({ ...seedForm, ethBlockNumber: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm normal-case tracking-normal" />
              </label>
              <label className="md:col-span-2 text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                ETH block hash
                <input value={seedForm.ethBlockHash} onChange={(event) => setSeedForm({ ...seedForm, ethBlockHash: event.target.value })} placeholder="0x + 64 ky tu hex" className="mt-2 h-11 w-full rounded-lg border px-3 font-mono text-sm normal-case tracking-normal" />
              </label>
              <label className="md:col-span-2 text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                Ghi chu nguon
                <textarea value={seedForm.sourceNote} onChange={(event) => setSeedForm({ ...seedForm, sourceNote: event.target.value })} rows={3} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm normal-case tracking-normal" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSeedEvent(null)} className="rounded-lg border px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#43474e]">
                Huy
              </button>
              <button
                type="button"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending || !seedForm.xsmbResult.trim() || !/^0x[a-fA-F0-9]{64}$/.test(seedForm.ethBlockHash)}
                className="flex items-center gap-2 rounded-lg bg-[#002045] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Xac nhan quay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

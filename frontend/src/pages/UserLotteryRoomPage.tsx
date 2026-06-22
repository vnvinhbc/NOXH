import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Hash, Radio, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { LotteryResultResponse } from '@/types'

const REEL_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const REVEAL_DELAY_MS = 2400
const REVEAL_INTERVAL_MS = 450
const PROCESSING_INTERVAL_MS = 180

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
        sendFrame(`SUBSCRIBE\nid=user-lottery-${eventId}\ndestination:/topic/lottery-events/${eventId}\n\n`)
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

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 12)}...${value.slice(-8)}`
}

function drawCodeFrame(value?: string) {
  const code = value?.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  return (code ? code.slice(-5) : '-----').padStart(5, '-').split('')
}

function randomDrawFrame() {
  return Array.from({ length: 5 }, () => REEL_CHARS[Math.floor(Math.random() * REEL_CHARS.length)]).join('')
}

function resultSortValue(result: LotteryResultResponse) {
  return result.drawOrder || 999999
}

function phaseLabel(isPlaybackActive: boolean, visibleCount: number, winnerCount: number) {
  if (!isPlaybackActive) return 'Dang cho lenh quay'
  if (visibleCount === 0) return 'Khoi tao seed'
  if (visibleCount < winnerCount) return 'Dang xu ly ket qua'
  return 'Dang cong bo danh sach'
}

export default function UserLotteryRoomPage() {
  const [reelFrame, setReelFrame] = useState('-----')
  const [visibleWinnerCount, setVisibleWinnerCount] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [playbackStartedAt, setPlaybackStartedAt] = useState<number | null>(null)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['userLotterySummary'],
    queryFn: () => lotteryApi.getMySummary().then((res) => res.data.result),
    refetchInterval: 3000,
  })
  const { data: verification } = useQuery({
    queryKey: ['lotteryVerification', summary?.eventId],
    queryFn: () => lotteryApi.getVerification(summary?.eventId || '').then((res) => res.data.result),
    enabled: Boolean(summary?.eventId),
    refetchInterval: summary?.eventStatus === 'COMPLETED' ? false : 3000,
  })
  const socketEvents = useLotterySocket(summary?.eventId)

  const liveResults = useMemo(() => {
    const results = verification?.results || []
    return results
      .filter((result) => result.resultType !== 'NOT_SELECTED')
      .sort((a, b) => resultSortValue(a) - resultSortValue(b))
  }, [verification?.results])
  const isRoomActive = ['DRAWING', 'COMPLETED'].includes(summary?.eventStatus || '')
  const visibleResults = liveResults.slice(0, visibleWinnerCount)
  const recentVisibleResults = visibleResults.slice(-6).reverse()
  const currentProcessingIndex = Math.min(processedCount, Math.max((verification?.participants.length || 1) - 1, 0))
  const currentProcessingCode = verification?.participants[currentProcessingIndex]?.lotteryCode
  const currentWinner = visibleResults[visibleResults.length - 1]
  const displayCode = isRoomActive
    ? visibleWinnerCount < liveResults.length ? reelFrame : currentWinner?.lotteryCode
    : undefined
  const phase = phaseLabel(isRoomActive, visibleWinnerCount, liveResults.length)
  const totalParticipants = verification?.participants.length || 0
  const progressPercent = totalParticipants > 0 ? Math.min(100, Math.round((processedCount / totalParticipants) * 100)) : 0
  const tickerLogs = useMemo(() => {
    const syntheticLogs = [
      isRoomActive && currentProcessingCode ? `${currentProcessingCode} dang duoc xu ly` : undefined,
      ...visibleResults.slice(-5).reverse().map((result) =>
        `${result.lotteryCode} vua trung can ${result.apartmentCode || 'dang phan can'}`
      ),
      phase !== 'Dang cho lenh quay' ? `Phase: ${phase}` : undefined,
    ].filter(Boolean) as string[]
    return [...syntheticLogs, ...socketEvents].slice(0, 10)
  }, [currentProcessingCode, isRoomActive, phase, socketEvents, visibleResults])

  useEffect(() => {
    setVisibleWinnerCount(0)
    setProcessedCount(0)
    setReelFrame('-----')
    setPlaybackStartedAt(isRoomActive ? Date.now() : null)
  }, [isRoomActive, summary?.eventId])

  useEffect(() => {
    if (!isRoomActive) return
    const timer = window.setInterval(() => {
      setReelFrame(randomDrawFrame())
      setProcessedCount((current) => Math.min(totalParticipants, current + 1))
    }, PROCESSING_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isRoomActive, totalParticipants])

  useEffect(() => {
    if (!isRoomActive || !playbackStartedAt || liveResults.length === 0) return
    let revealTimer: number | undefined
    const startTimeout = window.setTimeout(() => {
      revealTimer = window.setInterval(() => {
        setVisibleWinnerCount((current) => {
          const next = Math.min(liveResults.length, current + 1)
          const nextResult = liveResults[next - 1]
          if (nextResult) {
            setReelFrame(nextResult.lotteryCode)
            setProcessedCount((processed) => Math.min(totalParticipants, Math.max(processed, nextResult.drawOrder || next)))
          }
          if (next >= liveResults.length) window.clearInterval(revealTimer)
          return next
        })
      }, REVEAL_INTERVAL_MS)
    }, REVEAL_DELAY_MS)
    return () => {
      window.clearTimeout(startTimeout)
      if (revealTimer) window.clearInterval(revealTimer)
    }
  }, [isRoomActive, liveResults, playbackStartedAt, totalParticipants])

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-[#001f49]">
            Phong boc tham truc tuyen
            <span className="rounded-full bg-[#ffdad6] px-4 py-1 text-sm font-black uppercase tracking-[0.16em] text-[#93000a]">{summary?.eventStatus || 'Offline'}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-lg text-[#44474e]">Du an: {summary?.projectName || '-'}</p>
            <span className="rounded-full bg-[#e6eeff] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#001f49]">
              {phase}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#465f88]">Da xu ly</p>
          <p className="mt-1 text-2xl font-black text-[#001f49]">
            {processedCount.toLocaleString('vi-VN')} / {totalParticipants.toLocaleString('vi-VN')}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section>
          <div className="rounded-2xl bg-gradient-to-br from-[#001f49] to-[#003471] p-10 text-center text-white shadow-xl">
            <div className="mb-8 grid gap-3 text-left text-xs font-mono uppercase tracking-[0.16em] text-[#acc7ff] md:grid-cols-2">
              <span className="rounded-lg bg-black/15 px-4 py-2">Station: LIVE_SERVER_04</span>
              <span className="rounded-lg bg-black/15 px-4 py-2">Latency: 14ms</span>
            </div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-[#acc7ff]">
              {isRoomActive ? 'Ma so dang boc tham' : 'Chua bat dau boc tham'}
            </p>
            <div className="mt-8 grid grid-cols-5 gap-4">
              {drawCodeFrame(displayCode).map((char, index) => (
                <div
                  key={`${char}-${index}`}
                  className={`flex aspect-[0.75] items-center justify-center rounded-2xl bg-white text-5xl font-black text-[#001f49] shadow-lg transition-transform duration-150 ${
                    isRoomActive && visibleWinnerCount < liveResults.length ? 'scale-[1.02]' : ''
                  }`}
                >
                  {char}
                </div>
              ))}
            </div>
            <div className="mx-auto mt-8 h-2 max-w-sm overflow-hidden rounded-full bg-white/15">
              <div className="h-full bg-[#115cb9] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#acc7ff]">
              {processedCount.toLocaleString('vi-VN')} / {totalParticipants.toLocaleString('vi-VN')} ho so
            </p>
            <p className="mt-8 font-mono text-sm text-[#acc7ff]">
              {isRoomActive ? `Blockchain Verify Seed: ${shortHash(summary?.finalSeed)}` : 'Admin chua nhap seed va bat dau quay'}
            </p>
            <p className="mt-3 text-xs text-[#acc7ff]">
              Ket qua duoc phat lai theo timeline ngan tu du lieu verify deterministic.
            </p>
          </div>

          <section className="mt-6 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#001f49]">Chi tiet du an & chi tieu boc tham</h2>
              {summary?.eventId && (
                <Link to={`/lottery-events/${summary.eventId}/verification`} target="_blank" className="text-sm font-black text-[#115cb9]">
                  Transparency report
                </Link>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ['Ho so hop le', verification?.participants.length || 0],
                ['Can ho', verification?.apartments.length || 0],
                ['Da cong bo', visibleResults.length],
                ['Ket qua', verification?.results.length || 0],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#f3f4f5] p-4">
                  <p className="text-xs text-[#44474e]">{label}</p>
                  <p className="mt-2 text-2xl font-black text-[#001f49]">{Number(value).toLocaleString('vi-VN')}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-[#001f49]">
              <ShieldCheck size={20} className="text-[#115cb9]" />
              Danh sach trung tuyen
            </h2>
            <div className="space-y-3">
              {recentVisibleResults.map((result) => (
                <div key={result.participantId} className="bg-[#f3f4f5] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm font-black text-[#001f49]">#{result.drawOrder || '-'}</p>
                    <p className="font-mono text-sm font-black text-[#001f49]">{result.lotteryCode}</p>
                  </div>
                  <p className="mt-1 text-xs text-[#44474e]">Can ho: {result.apartmentCode || '-'}</p>
                </div>
              ))}
              {recentVisibleResults.length === 0 && (
                <p className="bg-[#f3f4f5] p-4 text-sm text-[#44474e]">Chua co ket qua trung tuyen.</p>
              )}
            </div>
          </section>

          <section className="bg-[#001f49] p-6 text-white">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
              <Radio size={18} />
              Event stream
            </h2>
            <div className="max-h-[22rem] space-y-2 overflow-hidden">
              {tickerLogs.length > 0 ? tickerLogs.map((event, index) => (
                <div key={`${event}-${index}`} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black">{event}</div>
              )) : (
                <p className="text-sm text-blue-100">Dang cho su kien realtime.</p>
              )}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-blue-100">
              <Hash size={14} />
              {shortHash(summary?.resultHash)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

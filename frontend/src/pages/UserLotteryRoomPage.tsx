import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CheckCircle2, Clock3, Copy, Hash, Radio, ShieldCheck, Ticket, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { LotteryResultResponse } from '@/types'

const REEL_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const REVEAL_DELAY_MS = 1800
const REVEAL_BATCH_SIZE = 4
const REVEAL_BATCH_INTERVAL_MS = 1100
const PROCESSING_INTERVAL_MS = 55
const CASCADE_DELAY_MS = 130

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

    socket.onopen = () => sendFrame('CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n')
    socket.onmessage = (message) => {
      const raw = String(message.data)
      if (raw.startsWith('CONNECTED')) {
        sendFrame(`SUBSCRIBE\nid=user-lottery-${eventId}\ndestination:/topic/lottery-events/${eventId}\n\n`)
        setEvents((current) => ['WS_CONNECTED', ...current].slice(0, 8))
        return
      }
      if (raw.startsWith('MESSAGE')) {
        const body = raw.split('\n\n')[1]?.replace(/\u0000/g, '')
        try {
          const parsed = JSON.parse(body)
          setEvents((current) => [parsed.type || 'WS_MESSAGE', ...current].slice(0, 8))
        } catch {
          setEvents((current) => ['WS_MESSAGE', ...current].slice(0, 8))
        }
      }
    }
    socket.onerror = () => setEvents((current) => ['WS_SOCKET_ERROR', ...current].slice(0, 8))
    return () => socket.close()
  }, [eventId])

  return events
}

function shortHash(value?: string) {
  if (!value) return '-'
  return `${value.slice(0, 12)}...${value.slice(-8)}`
}

function copyText(value?: string) {
  if (value) navigator.clipboard?.writeText(value)
}

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

function displayWinnerName(result: LotteryResultResponse) {
  return result.maskedDisplayName || 'Nguoi tham gia'
}

function isWinningResult(resultType?: string) {
  return resultType === 'GUARANTEED' || resultType === 'SELECTED'
}

function phaseLabel(mode: string, visibleCount: number, winnerCount: number) {
  if (mode === 'WAITING') return 'Dang cho gio quay'
  if (visibleCount === 0) return 'Khoi tao seed'
  if (visibleCount < winnerCount) return 'Dang cong bo ket qua'
  return 'Hoan tat boc tham'
}

function stageTone(mode: string, resultType?: string) {
  if (mode === 'COMPLETED' && isWinningResult(resultType)) return 'border-emerald-400 shadow-emerald-200'
  if (mode === 'COMPLETED') return 'border-[#ffb4ab] shadow-[#ffd8d2]'
  if (mode === 'DRAWING') return 'border-[#75d7ff] shadow-[#c9efff]'
  return 'border-[#d6e3ff] shadow-[#d6e3ff]'
}

export default function UserLotteryRoomPage() {
  const [, setTick] = useState(0)
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
  const eventStatus = summary?.eventStatus || 'OFFLINE'
  const hasLotteryEvent = Boolean(summary?.eventId)
  const eventHasStarted = ['DRAWING', 'COMPLETED'].includes(eventStatus)
  const showDrawingSurface = hasLotteryEvent && (eventHasStarted || (Boolean(countdownTarget) && countdown.totalSeconds === 0))

  const liveResults = useMemo(() => {
    const results = verification?.results || []
    return results
      .filter((result) => result.resultType !== 'NOT_SELECTED')
      .sort((a, b) => resultSortValue(a) - resultSortValue(b))
  }, [verification?.results])

  const totalParticipants = verification?.participants.length || 0
  const revealComplete = eventHasStarted && (liveResults.length === 0 || visibleWinnerCount >= liveResults.length)
  const mode = !showDrawingSurface ? 'WAITING' : revealComplete && eventStatus === 'COMPLETED' ? 'COMPLETED' : 'DRAWING'
  const phase = phaseLabel(mode, visibleWinnerCount, liveResults.length)
  const visibleResults = liveResults.slice(0, visibleWinnerCount)
  const recentVisibleResults = visibleResults.slice(-7).reverse()
  const activeBatchResults = liveResults.slice(
    Math.max(0, visibleWinnerCount - REVEAL_BATCH_SIZE),
    visibleWinnerCount
  )
  const currentWinner = visibleResults[visibleResults.length - 1]
  const currentProcessingIndex = Math.min(processedCount, Math.max(totalParticipants - 1, 0))
  const currentProcessingCode = verification?.participants[currentProcessingIndex]?.lotteryCode
  const displayCode = mode === 'DRAWING'
    ? visibleWinnerCount < liveResults.length ? reelFrame : currentWinner?.lotteryCode
    : summary?.lotteryCode
  const progressPercent = totalParticipants > 0 ? Math.min(100, Math.round((processedCount / totalParticipants) * 100)) : 0
  const hasPersonalResult = Boolean(summary?.resultType)
  const userWon = isWinningResult(summary?.resultType)

  const terminalLogs = useMemo(() => {
    const participantCount = totalParticipants
    const apartmentCount = verification?.apartments.length || 0
    const baseLogs = [
      countdownTarget && mode === 'WAITING' ? `WAITING_ROOM: scheduled start ${dayjs(countdownTarget).format('DD/MM HH:mm:ss')}` : undefined,
      verification?.commitmentHash ? `COMMITMENT_PINNED: ${shortHash(verification.commitmentHash)}` : undefined,
      participantCount ? `LOCKED_INPUT: ${participantCount} participant records frozen` : undefined,
      apartmentCount ? `LOCKED_UNITS: ${apartmentCount} apartment records frozen` : undefined,
      eventHasStarted && summary?.finalSeed ? `BUILD_FINAL_SEED: ${shortHash(summary.finalSeed)} verified` : undefined,
      mode === 'DRAWING' && currentProcessingCode ? `NORMAL_POOL_SORT: ${currentProcessingCode} hashing` : undefined,
      activeBatchResults.length > 0 ? `REVEAL_BATCH: ${activeBatchResults.length} winners` : undefined,
      ...activeBatchResults.slice().reverse().map((result) =>
        `REVEAL_WINNER: ${displayWinnerName(result)} / ${result.lotteryCode} -> ${result.apartmentCode || 'NO_UNIT'}`
      ),
      mode === 'COMPLETED' && hasPersonalResult ? `PERSONAL_RESULT: ${summary?.lotteryCode || '-'} -> ${summary?.resultType}` : undefined,
      mode === 'COMPLETED' && summary?.resultHash ? `RESULT_HASH_CREATED: ${shortHash(summary.resultHash)}` : undefined,
    ].filter(Boolean) as string[]
    return [...baseLogs, ...socketEvents].slice(0, 14)
  }, [
    countdownTarget,
    activeBatchResults,
    currentProcessingCode,
    eventHasStarted,
    hasPersonalResult,
    mode,
    socketEvents,
    summary?.finalSeed,
    summary?.lotteryCode,
    summary?.resultHash,
    summary?.resultType,
    totalParticipants,
    verification?.commitmentHash,
    verification?.apartments.length,
  ])

  useEffect(() => {
    setVisibleWinnerCount(0)
    setProcessedCount(0)
    setReelFrame('-----')
    setPlaybackStartedAt(eventHasStarted ? Date.now() : null)
  }, [eventHasStarted, summary?.eventId])

  useEffect(() => {
    if (!eventHasStarted || mode === 'COMPLETED') return
    const timer = window.setInterval(() => {
      setReelFrame(randomDrawFrame())
      setProcessedCount((current) => Math.min(totalParticipants, current + 1))
    }, PROCESSING_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [eventHasStarted, mode, totalParticipants])

  useEffect(() => {
    if (!eventHasStarted || !playbackStartedAt || liveResults.length === 0) return
    let revealTimer: number | undefined
    const startTimeout = window.setTimeout(() => {
      revealTimer = window.setInterval(() => {
        setVisibleWinnerCount((current) => {
          const next = Math.min(liveResults.length, current + REVEAL_BATCH_SIZE)
          const nextResult = liveResults[next - 1]
          if (nextResult) {
            setReelFrame(nextResult.lotteryCode)
            setProcessedCount((processed) => Math.min(totalParticipants, Math.max(processed, nextResult.drawOrder || next)))
          }
          if (next >= liveResults.length) window.clearInterval(revealTimer)
          return next
        })
      }, REVEAL_BATCH_INTERVAL_MS)
    }, REVEAL_DELAY_MS)
    return () => {
      window.clearTimeout(startTimeout)
      if (revealTimer) window.clearInterval(revealTimer)
    }
  }, [eventHasStarted, liveResults, playbackStartedAt, totalParticipants])

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-[#eef3f8] text-[#101828]">
      <style>
        {`
          @keyframes noxhFadeCascade {
            from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          @keyframes noxhTerminalFade {
            from { opacity: 0; transform: translateX(8px); filter: blur(3px); }
            to { opacity: 1; transform: translateX(0); filter: blur(0); }
          }
        `}
      </style>
      <div className="sticky top-16 z-30 border-b border-[#d8e0ea] bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#465f88]">NOXH lottery room</p>
            <h1 className="mt-1 text-xl font-black text-[#001f49]">{summary?.eventName || 'Phong boc tham truc tuyen'}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-[#e6eeff] px-3 py-1 font-black text-[#001f49]">{eventStatus}</span>
            <button type="button" onClick={() => copyText(summary?.participantHash)} className="rounded-full bg-[#f3f4f5] px-3 py-1 font-mono font-bold text-[#344054]">
              P: {shortHash(summary?.participantHash)}
            </button>
            <button type="button" onClick={() => copyText(summary?.apartmentHash)} className="rounded-full bg-[#f3f4f5] px-3 py-1 font-mono font-bold text-[#344054]">
              A: {shortHash(summary?.apartmentHash)}
            </button>
            <button type="button" onClick={() => copyText(verification?.commitmentHash || summary?.resultHash || summary?.finalSeed)} className="rounded-full bg-[#001f49] px-3 py-1 font-mono font-bold text-white">
              COMMIT: {shortHash(verification?.commitmentHash || summary?.resultHash || summary?.finalSeed)}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#465f88]">{summary?.projectName || 'Du an dang tham gia'}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#001f49]">Stage / Brain live reveal</h2>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#667085]">Phase</p>
            <p className="mt-1 font-black text-[#001f49]">{phase}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
          <section className={`overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition-colors ${stageTone(mode, summary?.resultType)}`}>
            {mode === 'WAITING' && (
              <div className="bg-gradient-to-br from-[#001f49] to-[#073f83] p-8 text-white md:p-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#acc7ff]">Countdown to draw</p>
                    <h3 className="mt-2 text-3xl font-black">Sanh cho boc tham</h3>
                  </div>
                  <Clock3 size={34} className="text-[#acc7ff]" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    ['Ngay', countdown.days],
                    ['Gio', countdown.hours],
                    ['Phut', countdown.minutes],
                    ['Giay', countdown.seconds],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 px-4 py-6 text-center">
                      <p className="text-5xl font-black md:text-7xl">{String(value).padStart(2, '0')}</p>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-[#acc7ff]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl bg-white/10 p-5">
                  <p className="text-sm font-bold text-[#d6e3ff]">
                    {countdownTarget
                      ? `Gio quay du kien: ${dayjs(countdownTarget).format('DD/MM/YYYY HH:mm:ss')}`
                      : 'Chua co gio quay du kien'}
                  </p>
                  <p className="mt-2 text-sm text-[#acc7ff]">Khi den gio quay, man hinh nay se tu dong chuyen sang phong boc tham.</p>
                </div>
              </div>
            )}

            {mode === 'DRAWING' && (
              <div className="bg-gradient-to-br from-[#001f49] to-[#003471] p-8 text-center text-white md:p-10">
                <div className="mb-8 grid gap-3 text-left text-xs font-mono uppercase tracking-[0.16em] text-[#acc7ff] md:grid-cols-2">
                  <span className="rounded-lg bg-black/15 px-4 py-2">PHASE: {phase}</span>
                  <span className="rounded-lg bg-black/15 px-4 py-2">VERIFY: {shortHash(summary?.finalSeed)}</span>
                </div>
                <p className="text-sm font-black uppercase tracking-[0.38em] text-[#acc7ff]">Ma so dang boc tham</p>
                <div className="mt-8 grid grid-cols-5 gap-3 md:gap-4">
                  {drawCodeFrame(displayCode).map((char, index) => (
                    <div key={`${char}-${index}`} className="flex aspect-[0.74] items-center justify-center rounded-2xl bg-white text-4xl font-black text-[#001f49] shadow-lg transition-transform duration-150 md:text-6xl">
                      {char}
                    </div>
                  ))}
                </div>
                <div className="mx-auto mt-8 h-2 max-w-lg overflow-hidden rounded-full bg-white/15">
                  <div className="h-full bg-[#75d7ff] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#acc7ff]">
                  {processedCount.toLocaleString('vi-VN')} / {totalParticipants.toLocaleString('vi-VN')} ho so da xu ly
                </p>
                <div className="mt-8 grid gap-3 text-left md:grid-cols-2">
                  {recentVisibleResults.slice(0, 4).map((result, index) => (
                    <div
                      key={result.participantId}
                      className="rounded-xl bg-white/10 p-4 opacity-0"
                      style={{
                        animation: 'noxhFadeCascade 520ms ease forwards',
                        animationDelay: `${index * CASCADE_DELAY_MS}ms`,
                      }}
                    >
                      <p className="text-sm font-black text-white">{displayWinnerName(result)}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-xs font-black text-[#d8f7ff]">{result.lotteryCode}</p>
                        <p className="text-xs text-[#acc7ff]">{result.apartmentCode || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'COMPLETED' && (
              <div className="p-6 md:p-8">
                <div className={`rounded-2xl p-7 ${userWon ? 'bg-emerald-50 text-emerald-950' : 'bg-[#fff1ef] text-[#541000]'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] opacity-70">Boarding pass result</p>
                      <h3 className="mt-2 text-3xl font-black">
                        {userWon ? 'Chuc mung, ho so da trung' : 'Rat tiec, ho so chua duoc chon'}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                        {userWon
                          ? `Ma boc tham ${summary?.lotteryCode || '-'} da duoc ghi nhan voi ket qua ${summary?.resultType}.`
                          : `Ma boc tham ${summary?.lotteryCode || '-'} khong nam trong danh sach duoc chon cua dot quay nay.`}
                      </p>
                    </div>
                    {userWon ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-4">
                    {[
                      ['Ma boc tham', summary?.lotteryCode || '-'],
                      ['Pool', summary?.poolType || '-'],
                      ['Ket qua', summary?.resultType || '-'],
                      ['Can ho', summary?.apartmentCode || '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white/70 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
                        <p className="mt-2 break-words font-mono text-sm font-black">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="rounded-2xl bg-[#f3f4f5] p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#667085]">Result hash</p>
                    <p className="mt-2 break-all font-mono text-sm font-black text-[#001f49]">{summary?.resultHash || '-'}</p>
                  </div>
                  {summary?.eventId && (
                    <Link to={`/lottery-events/${summary.eventId}/verification`} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl bg-[#001f49] px-5 py-4 text-sm font-black text-white">
                      <ShieldCheck size={18} />
                      Xem verification
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-[#050b18] p-5 text-white shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em]">
                  <Radio size={17} />
                  Live terminal
                </h3>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-200">ONLINE</span>
              </div>
              <div className="h-[30rem] space-y-2 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-[#d8f7ff]">
                {terminalLogs.length > 0 ? terminalLogs.map((line, index) => (
                  <div
                    key={`${line}-${index}`}
                    className={index === 0 ? 'text-emerald-200' : 'text-[#d8f7ff]'}
                    style={{
                      animation: 'noxhTerminalFade 420ms ease both',
                      opacity: Math.max(0.35, 1 - index * 0.055),
                    }}
                  >
                    <span className="mr-2 text-[#75d7ff]">[{String(index + 1).padStart(2, '0')}]</span>
                    {line}
                  </div>
                )) : (
                  <div className="text-[#8aa4c7]">Waiting for event telemetry...</div>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-[#001f49]">
                <Hash size={18} className="text-[#115cb9]" />
                Minh bach dau vao
              </h3>
              <div className="space-y-3">
                {[
                  ['Participant hash', summary?.participantHash],
                  ['Apartment hash', summary?.apartmentHash],
                  ['Final seed', summary?.finalSeed],
                  ['Result hash', summary?.resultHash],
                ].map(([label, value]) => (
                  <button key={label} type="button" onClick={() => copyText(value)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-[#f3f4f5] px-4 py-3 text-left">
                    <span>
                      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#667085]">{label}</span>
                      <span className="font-mono text-xs font-black text-[#001f49]">{shortHash(value)}</span>
                    </span>
                    <Copy size={15} className="text-[#667085]" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-[#001f49]">
                <Ticket size={18} className="text-[#115cb9]" />
                Ho so cua ban
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Ma ho so', summary?.applicationCode || '-'],
                  ['Ma boc tham', summary?.lotteryCode || '-'],
                  ['Nhom', summary?.poolType || '-'],
                  ['Trang thai', summary?.resultType || eventStatus],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#f3f4f5] p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#667085]">{label}</p>
                    <p className="mt-1 break-words font-black text-[#001f49]">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

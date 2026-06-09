import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, Hash, Home, ShieldCheck } from 'lucide-react'
import { lotteryApi } from '@/api/lottery'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function HashRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">{label}</p>
      <p className="break-all font-mono text-xs font-semibold text-[#002045]">{value || '-'}</p>
    </div>
  )
}

export default function LotteryVerificationPage() {
  const { eventId = '' } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['lotteryVerification', eventId],
    queryFn: () => lotteryApi.getVerification(eventId).then((res) => res.data.result),
    enabled: Boolean(eventId),
  })

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#555f70]">Khong tim thay du lieu verification.</div>
  }

  const downloads = [
    ['participants.json', `/api/lottery-events/${eventId}/participants.json`],
    ['apartments.json', `/api/lottery-events/${eventId}/apartments.json`],
    ['results.json', `/api/lottery-events/${eventId}/results.json`],
    ['verification.json', `/api/lottery-events/${eventId}/verification.json`],
  ]

  return (
    <main className="min-h-screen bg-[#f8f9ff] px-4 py-8 text-[#0d1c2e] md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6e3ff] text-[#002045]">
            <ShieldCheck size={26} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#43474e]">Public verification</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#002045]">{data.projectName}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#555f70]">
            Trang nay cong khai seed, hash dau vao va hash ket qua de nguoi dung tai JSON va chay lai thuat toan.
          </p>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Ho so</p>
            <p className="mt-2 text-3xl font-black text-[#002045]">{data.participants.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Can ho</p>
            <p className="mt-2 text-3xl font-black text-[#002045]">{data.apartments.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Trung suat</p>
            <p className="mt-2 text-3xl font-black text-[#002045]">{data.results.filter((result) => result.resultType !== 'NOT_SELECTED').length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Khong trung</p>
            <p className="mt-2 text-3xl font-black text-[#002045]">{data.results.filter((result) => result.resultType === 'NOT_SELECTED').length}</p>
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-[#dce9ff]/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Hash size={18} className="text-[#002045]" />
            <h2 className="text-lg font-bold text-[#002045]">Verification values</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <HashRow label="Algorithm" value={data.algorithmType} />
            <HashRow label="Commitment hash" value={data.commitmentHash} />
            <HashRow label="Private salt" value={data.privateSalt} />
            <HashRow label="Participant hash" value={data.participantHash} />
            <HashRow label="Apartment hash" value={data.apartmentHash} />
            <HashRow label="XSMB date" value={data.xsmbDrawDate} />
            <HashRow label="XSMB result" value={data.xsmbResult} />
            <HashRow label="ETH chain id" value={data.ethChainId} />
            <HashRow label="ETH block number" value={data.ethBlockNumber} />
            <HashRow label="ETH block hash" value={data.ethBlockHash} />
            <HashRow label="Clicked timestamp" value={data.clickedTimestamp} />
            <HashRow label="Final seed" value={data.finalSeed} />
            <HashRow label="Sorted normal hash" value={data.sortedNormalHash} />
            <HashRow label="Sorted winner hash" value={data.sortedWinnerHash} />
            <HashRow label="Sorted apartment hash" value={data.sortedApartmentHash} />
            <HashRow label="Assignment list hash" value={data.assignmentListHash} />
            <HashRow label="Result hash" value={data.resultHash} />
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-[#002045]">Tai du lieu JSON</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {downloads.map(([label, href]) => (
              <a key={label} href={href} className="flex items-center justify-center gap-2 rounded-lg border border-[#002045]/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#002045] hover:bg-[#eff4ff]">
                <Download size={14} />
                {label}
              </a>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#c4c6cf]/20 bg-[#eff4ff] p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#002045]">
              <Home size={18} />
              Ket qua phan can
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8f9ff] text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">
                <tr>
                  {['Thu tu', 'Ma boc tham', 'Pool', 'Ket qua', 'Can ho'].map((header) => (
                    <th key={header} className="px-4 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {data.results.map((result) => (
                  <tr key={result.participantId}>
                    <td className="px-4 py-3 font-mono">{result.drawOrder || '-'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#002045]">{result.lotteryCode}</td>
                    <td className="px-4 py-3">{result.poolType}</td>
                    <td className="px-4 py-3">{result.resultType}</td>
                    <td className="px-4 py-3 font-mono">{result.apartmentCode || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Activity, Archive, CheckCircle2, Clock3, Database, FileBadge2, ShieldCheck, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminApplicationsApi } from '@/admin/api/adminApplications'
import { adminDashboardApi } from '@/admin/api/adminDashboard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DataPagination from '@/components/common/DataPagination'
import { getRowNumber } from '@/components/common/rowNumber'

function numberFormat(value: number) {
  return value.toLocaleString('vi-VN')
}

function statusTone(status: string) {
  if (status === 'COMPLETED' || status === 'VERIFIED') return 'bg-green-100 text-green-700'
  if (status === 'FAILED' || status === 'REJECTED') return 'bg-[#ffdad6] text-[#93000a]'
  if (status === 'DRAWING' || status === 'LOCKED') return 'bg-[#ffddba] text-[#633f0f]'
  return 'bg-[#d6e3ff] text-[#002045]'
}

export default function AdminDashboardPage() {
  const [applicationPage, setApplicationPage] = useState(0)
  const [applicationPageSize, setApplicationPageSize] = useState(5)
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardOverview'],
    queryFn: adminDashboardApi.getOverview,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
  const { data: applicationsPage, isFetching: fetchingApplications } = useQuery({
    queryKey: ['adminApplications', 'ALL', applicationPage, applicationPageSize],
    queryFn: () => adminApplicationsApi.getAll(undefined, applicationPage, applicationPageSize).then((res) => res.data.result),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })

  const summary = useMemo(() => {
    const applicationOverview = data?.applicationOverview
    const events = data?.events || []
    const projects = data?.projects || []
    const focusProject = projects.find((project) => project.id === data?.focusProjectId)
    const completedEvents = events.filter((item) => item.status === 'COMPLETED').length
    const totalUnits = data?.housingOverview?.totalUnits || 0
    const availableUnits = data?.housingOverview?.availableUnits || 0
    return {
      events,
      projects,
      focusProject,
      totalApplications: applicationOverview?.totalApplications || 0,
      pending: applicationOverview?.pendingApplications || 0,
      approved: applicationOverview?.approvedApplications || 0,
      rejected: applicationOverview?.rejectedApplications || 0,
      completedEvents,
      totalUnits,
      availableUnits,
    }
  }, [data])

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  const stats = [
    { label: 'Tong ho so', value: summary.totalApplications, detail: 'Ho so trong hang quan tri', icon: FileBadge2 },
    { label: 'Cho duyet', value: summary.pending, detail: 'Can xu ly trong queue', icon: Clock3 },
    { label: 'Da duyet', value: summary.approved, detail: 'Du dieu kien tham gia', icon: CheckCircle2 },
    {
      label: 'Can ho kha dung',
      value: summary.availableUnits,
      detail: `${numberFormat(summary.totalUnits)} can thuc te${summary.focusProject ? ` - ${summary.focusProject.name}` : ''}`,
      icon: Database,
    },
  ]

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">Sovereign Archive</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">Administrative Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/audit-log" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#002045] shadow-sm">
            <ShieldCheck size={15} />
            Audit
          </Link>
          <Link to="/admin/lottery-events" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            <Ticket size={15} />
            Lottery
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <section key={label} className="bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#43474e]">{label}</p>
              <Icon size={18} className="text-[#465f88]" />
            </div>
            <p className="text-3xl font-black text-[#002045]">{numberFormat(value)}</p>
            <p className="mt-2 text-xs font-medium text-[#555f70]">{detail}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#eff4ff] px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#465f88]">Application flow</p>
              <h2 className="mt-1 text-lg font-extrabold text-[#002045]">Ho so gan day</h2>
            </div>
            <Link to="/admin/applications" className="text-xs font-bold uppercase tracking-[0.18em] text-[#002045]">Mo queue</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8f9ff] text-[#43474e]">
                <tr>
                {['STT', 'Ma ho so', 'Nguoi nop', 'Du an', 'Trang thai', 'Ngay nop'].map((header) => (
                    <th key={header} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {(applicationsPage?.items || []).map((application, index) => (
                  <tr key={application.id} className="hover:bg-[#eff4ff]/50">
                    <td className="px-5 py-4 text-xs font-bold text-[#465f88]">{getRowNumber(applicationPage, applicationPageSize, index)}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#002045]">{application.applicationCode}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0d1c2e]">{application.userFullName}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{application.projectName}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone(application.status)}`}>{application.status}</span></td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{application.submittedAt ? dayjs(application.submittedAt).format('DD/MM/YYYY HH:mm') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataPagination
            page={applicationPage}
            pageSize={applicationPageSize}
            totalItems={applicationsPage?.totalElements || 0}
            onPageChange={setApplicationPage}
            onPageSizeChange={(size) => {
              setApplicationPageSize(size)
              setApplicationPage(0)
            }}
            itemLabel="ho so"
            disabled={fetchingApplications}
          />
        </section>

        <aside className="space-y-6">
          <section className="bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#002045]" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Lottery status</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#eff4ff] p-4">
                <p className="text-2xl font-black text-[#002045]">{summary.events.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#555f70]">Tong event</p>
              </div>
              <div className="bg-[#eff4ff] p-4">
                <p className="text-2xl font-black text-[#002045]">{summary.completedEvents}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#555f70]">Hoan tat</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {summary.events.slice(0, 4).map((event) => (
                <Link key={event.id} to="/admin/lottery-events" className="block bg-[#f8f9ff] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-[#0d1c2e]">{event.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusTone(event.status)}`}>{event.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#555f70]">{event.projectName}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-[#dce9ff] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Archive size={16} className="text-[#002045]" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Operations</h2>
            </div>
            <div className="space-y-2 text-sm font-semibold text-[#0d1c2e]">
              <p>{numberFormat(summary.rejected)} ho so bi tu choi</p>
              <p>{numberFormat(summary.projects.length)} du an dang quan ly</p>
              <p>{numberFormat(summary.availableUnits)} can ho co the phan bo</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

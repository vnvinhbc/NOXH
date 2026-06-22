import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { Download, Eye, FileBadge2, Filter, Mail, TrendingUp, CheckCircle2, Clock3, ShieldX } from 'lucide-react'
import { toast } from 'sonner'
import { adminApplicationsApi } from '@/admin/api/adminApplications'
import type { AdminApplicationStatus } from '@/admin/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import FilePreviewDialog from '@/components/common/FilePreviewDialog'

const tabs: { key: AdminApplicationStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Hang cho hien tai' },
  { key: 'PENDING', label: 'Cho duyet' },
  { key: 'VERIFIED', label: 'Da duyet' },
  { key: 'REJECTED', label: 'Tu choi' },
]

function statusPill(status: AdminApplicationStatus) {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-100 text-green-700'
    case 'REJECTED':
      return 'bg-[#ffdad6] text-[#93000a]'
    default:
      return 'bg-[#ffddba] text-[#633f0f]'
  }
}

function statusLabel(status: AdminApplicationStatus) {
  switch (status) {
    case 'VERIFIED':
      return 'DA DUYET'
    case 'REJECTED':
      return 'TU CHOI'
    default:
      return 'CHO DUYET'
  }
}

export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState<AdminApplicationStatus | 'ALL'>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewReason, setReviewReason] = useState('')
  const [previewFile, setPreviewFile] = useState<{
    title: string
    fileUrl: string
    fileName?: string
  } | null>(null)
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading, isFetching } = useQuery({
    queryKey: ['adminApplications', activeTab],
    queryFn: () => adminApplicationsApi.getAll(activeTab === 'ALL' ? undefined : activeTab).then((res) => res.data.result || []),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  const selectedListApplication = useMemo(
    () => applications.find((application) => application.id === selectedId) || applications[0] || null,
    [applications, selectedId]
  )
  const selectedApplicationId = selectedListApplication?.id
  const { data: selectedDetail, isFetching: isFetchingSelectedDetail } = useQuery({
    queryKey: ['adminApplicationDetail', selectedApplicationId],
    queryFn: () => adminApplicationsApi.getById(selectedApplicationId!).then((res) => res.data.result || null),
    enabled: Boolean(selectedApplicationId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
  const selectedApplication = selectedDetail || selectedListApplication

  useEffect(() => {
    setReviewReason(selectedApplication?.rejectReason || '')
  }, [selectedApplication])

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: AdminApplicationStatus; reason?: string }) =>
      adminApplicationsApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
      queryClient.invalidateQueries({ queryKey: ['adminApplicationDetail'] })
      toast.success('Da cap nhat trang thai ho so')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Khong the cap nhat trang thai ho so')
    },
  })

  const stats = useMemo(() => {
    const pending = applications.filter((application) => application.status === 'PENDING').length
    const verified = applications.filter((application) => application.status === 'VERIFIED').length
    const rejected = applications.filter((application) => application.status === 'REJECTED').length
    return { total: applications.length, pending, verified, rejected }
  }, [applications])

  const prefetchDetail = (applicationId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['adminApplicationDetail', applicationId],
      queryFn: () => adminApplicationsApi.getById(applicationId).then((res) => res.data.result || null),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    })
  }

  if (isLoading && applications.length === 0) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <FilePreviewDialog
        open={Boolean(previewFile)}
        title={previewFile?.title || 'Xem giay to'}
        fileUrl={previewFile?.fileUrl}
        fileName={previewFile?.fileName}
        onClose={() => setPreviewFile(null)}
      />

      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-[#43474e]">
          <span>Kho luu tru</span>
          <span>/</span>
          <span className="font-semibold text-[#002045]">Quan ly ho so</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-[#0d1c2e]">Kho ho so nop</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#43474e]">
          Xem danh sach ho so da nop, kiem tra giay to dinh kem va cap nhat ket qua xac minh.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Tong ho so', value: stats.total, tone: 'border-[#002045]', detail: 'Trong hang cho hien tai', icon: TrendingUp },
          { label: 'Cho duyet', value: stats.pending, tone: 'border-[#c6955e]', detail: 'Can admin xem xet', icon: Clock3 },
          { label: 'Da duyet', value: stats.verified, tone: 'border-green-600', detail: 'Da chap thuan', icon: CheckCircle2 },
          { label: 'Tu choi', value: stats.rejected, tone: 'border-[#93000a]', detail: 'Can theo doi lai', icon: ShieldX },
        ].map(({ label, value, tone, detail, icon: Icon }) => (
          <div key={label} className={`rounded-xl border-l-4 ${tone} bg-white p-5 shadow-sm`}>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">{label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-extrabold text-[#002045]">{value.toLocaleString()}</h3>
              <Icon size={18} className="text-[#455f88]" />
            </div>
            <p className="mt-2 text-xs text-[#555f70]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <section className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#eff4ff] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg border border-[#c4c6cf]/30 bg-white p-1 shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === tab.key
                        ? 'bg-[#002045] text-white'
                        : 'text-[#43474e] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button type="button" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#43474e]">
                <Filter size={14} />
                Bo loc
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isFetching && (
                <span className="rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#465f88]">
                  Dang cap nhat
                </span>
              )}
              <button type="button" className="flex items-center gap-2 rounded-lg border border-[#002045]/15 px-4 py-2 text-xs font-bold text-[#002045] hover:bg-[#eff4ff]">
                <Download size={14} />
                Xuat file
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#eff4ff] text-[#43474e]">
                <tr>
                  {['Ma', 'Nguoi nop', 'Ngay nop', 'Trang thai', 'Nhom', 'Du an', ''].map((header) => (
                    <th key={header} className="border-b border-[#c4c6cf]/20 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.24em]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/15">
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className={`cursor-pointer transition-colors hover:bg-[#eff4ff]/60 ${
                      selectedApplication?.id === application.id ? 'bg-[#eff4ff]/40' : ''
                    }`}
                    onClick={() => setSelectedId(application.id)}
                    onMouseEnter={() => prefetchDetail(application.id)}
                  >
                    <td className="px-4 py-4 font-mono text-xs font-bold text-[#002045]">{application.applicationCode}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6eeff] text-[10px] font-bold text-[#002045]">
                          {application.userFullName.split(' ').slice(0, 2).map((part) => part[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0d1c2e]">{application.userFullName}</p>
                          <p className="text-[10px] text-[#43474e]">{application.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">
                      {application.submittedAt ? dayjs(application.submittedAt).format('DD/MM/YYYY HH:mm') : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusPill(application.status)}`}>
                        {statusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold ${
                        (application.priorityScore ?? 0) > 0
                          ? 'bg-[#d6e3ff] text-[#001b3c]'
                          : 'bg-[#eef0f3] text-[#43474e]'
                      }`}>
                        {(application.priorityScore ?? 0) > 0 ? 'UU TIEN' : 'THUONG'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#555f70]">{application.projectName}</td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/applications/${application.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#555f70] hover:bg-[#eff4ff] hover:text-[#002045]"
                        aria-label="Xem chi tiet ho so"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-[#555f70]">
                      Khong co ho so nao trong hang cho nay.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-xl border border-[#c4c6cf]/20 bg-[#dce9ff]/40 p-6">
          {selectedApplication ? (
            <div className="space-y-6">
              {isFetchingSelectedDetail && (
                <div className="rounded-lg bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#465f88] shadow-sm">
                  Dang tai chi tiet...
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#43474e]">Ho so dang chon</p>
                <h2 className="mt-2 text-2xl font-bold text-[#002045]">{selectedApplication.userFullName}</h2>
                <p className="text-sm text-[#555f70]">{selectedApplication.userEmail}</p>
                <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-[#002045]">
                  {selectedApplication.applicationCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Du an</p>
                  <p className="mt-1 font-semibold text-[#0d1c2e]">{selectedApplication.projectName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Trang thai</p>
                  <p className="mt-1 font-semibold text-[#0d1c2e]">{statusLabel(selectedApplication.status)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Nhom uu tien</p>
                  <p className="mt-1 font-semibold text-[#0d1c2e]">
                    {(selectedApplication.priorityScore ?? 0) > 0 ? 'PRIORITY' : 'NORMAL'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Doi tuong</p>
                  <p className="mt-1 font-semibold text-[#0d1c2e]">{selectedApplication.priorityCategory || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">Dia chi</p>
                <p className="mt-1 text-sm leading-relaxed text-[#0d1c2e]">
                  {[selectedApplication.detailedAddress, selectedApplication.ward, selectedApplication.district, selectedApplication.province]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#43474e]">
                  Phan hoi admin
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(event) => setReviewReason(event.target.value)}
                  placeholder="Nhap ly do tu choi ho so neu can..."
                  rows={4}
                  className="w-full rounded-xl border border-[#c4c6cf]/30 bg-white px-4 py-3 text-sm text-[#0d1c2e] outline-none transition focus:border-[#115cb9]"
                />
                <p className="mt-2 text-xs text-[#555f70]">
                  Truong nay bat buoc khi tu choi. Noi dung se duoc gui sang thong bao cua user.
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FileBadge2 size={16} className="text-[#002045]" />
                  <p className="text-sm font-bold text-[#002045]">Giay to dinh kem</p>
                </div>
                <div className="space-y-2">
                  {selectedApplication.documents.map((document) => (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => setPreviewFile({
                        title: document.documentType,
                        fileUrl: document.fileUrl,
                        fileName: document.fileName,
                      })}
                      className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm text-[#0d1c2e] shadow-sm hover:bg-[#eff4ff]"
                    >
                      <span>{document.documentType}</span>
                      <Eye size={14} className="text-[#002045]" />
                    </button>
                  ))}
                  {selectedApplication.documents.length === 0 && (
                    <div className="rounded-lg bg-white px-4 py-3 text-sm text-[#555f70] shadow-sm">
                      Chua co giay to dinh kem.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-[#c4c6cf]/20 pt-6">
                <Link
                  to={`/admin/applications/${selectedApplication.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#002045]/20 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#002045]"
                >
                  <Eye size={14} />
                  Xem chi tiet
                </Link>
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate({ id: selectedApplication.id, status: 'VERIFIED' })}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Duyet ho so
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewReason.trim()) {
                      toast.error('Vui long nhap ly do tu choi')
                      return
                    }
                    updateStatusMutation.mutate({
                      id: selectedApplication.id,
                      status: 'REJECTED',
                      reason: reviewReason.trim(),
                    })
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#93000a]/20 bg-[#ffdad6] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#93000a] disabled:opacity-60"
                >
                  <ShieldX size={14} />
                  Tu choi ho so
                </button>
                <button
                  type="button"
                  onClick={() => updateStatusMutation.mutate({ id: selectedApplication.id, status: 'PENDING' })}
                  disabled={updateStatusMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#633f0f]/20 bg-[#ffddba] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#633f0f] disabled:opacity-60"
                >
                  <Mail size={14} />
                  Chuyen ve cho duyet
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-[#555f70]">
              Chon mot ho so de xem chi tiet.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

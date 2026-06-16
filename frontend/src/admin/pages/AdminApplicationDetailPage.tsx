import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { ArrowLeft, CheckCircle2, Eye, FileBadge2, ShieldCheck, ShieldX } from 'lucide-react'
import { toast } from 'sonner'
import { adminApplicationsApi } from '@/admin/api/adminApplications'
import type { AdminApplicationStatus } from '@/admin/types'
import FilePreviewDialog from '@/components/common/FilePreviewDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'

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

function priorityLabel(score?: number, category?: string) {
  if ((score || 0) > 0) return category?.trim() || 'Doi tuong uu tien'
  return 'Nhom thuong'
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams()
  const [reviewReason, setReviewReason] = useState('')
  const [previewFile, setPreviewFile] = useState<{ title: string; fileUrl: string; fileName?: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: () => adminApplicationsApi.getAll().then((res) => res.data.result || []),
  })

  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id])

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: AdminApplicationStatus; reason?: string }) => {
      if (!id) throw new Error('Missing application id')
      return adminApplicationsApi.updateStatus(id, status, reason)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] })
      setReviewReason(res.data.result?.rejectReason || '')
      toast.success('Da cap nhat trang thai ho so')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Khong the cap nhat trang thai ho so')
    },
  })

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  if (!application) {
    return (
      <div className="px-4 py-10 md:px-8">
        <Link to="/admin/applications" className="inline-flex items-center gap-2 text-sm font-bold text-[#002045]">
          <ArrowLeft size={16} />
          Quay lai danh sach
        </Link>
        <div className="mt-8 bg-white p-8 text-sm text-[#555f70] shadow-sm">Khong tim thay ho so.</div>
      </div>
    )
  }

  const address = [application.detailedAddress, application.ward, application.district, application.province]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <FilePreviewDialog
        open={Boolean(previewFile)}
        title={previewFile?.title || 'Xem giay to'}
        fileUrl={previewFile?.fileUrl}
        fileName={previewFile?.fileName}
        onClose={() => setPreviewFile(null)}
      />

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/admin/applications" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#002045]">
            <ArrowLeft size={16} />
            Application Archive
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">{application.applicationCode}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">{application.userFullName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => updateStatusMutation.mutate({ status: 'VERIFIED' })}
            disabled={updateStatusMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#002045] to-[#1a365d] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            <CheckCircle2 size={15} />
            Duyet
          </button>
          <button
            type="button"
            onClick={() => {
              if (!reviewReason.trim()) {
                toast.error('Vui long nhap ly do tu choi')
                return
              }
              updateStatusMutation.mutate({ status: 'REJECTED', reason: reviewReason.trim() })
            }}
            disabled={updateStatusMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ffdad6] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#93000a] disabled:opacity-60"
          >
            <ShieldX size={15} />
            Tu choi
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <section className="space-y-6">
          <div className="bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#465f88]">Identity dossier</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#002045]">Thong tin ho so</h2>
              </div>
              <span className="rounded-full bg-[#d6e3ff] px-3 py-1 text-xs font-bold text-[#002045]">{statusLabel(application.status)}</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Email', application.userEmail],
                ['Du an', application.projectName],
                ['Ngay nop', application.submittedAt ? dayjs(application.submittedAt).format('DD/MM/YYYY HH:mm') : '-'],
                ['Ma boc tham', application.lotteryNumber || '-'],
                ['Ket qua quay', application.lotteryResult || '-'],
                ['Dia chi', address || '-'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#74777f]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0d1c2e]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileBadge2 size={16} className="text-[#002045]" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Giay to dinh kem</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {application.documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setPreviewFile({ title: document.documentType, fileUrl: document.fileUrl, fileName: document.fileName })}
                  className="flex items-center justify-between bg-[#f8f9ff] px-4 py-3 text-left text-sm font-semibold text-[#0d1c2e] hover:bg-[#eff4ff]"
                >
                  <span>{document.documentType}</span>
                  <Eye size={15} className="text-[#465f88]" />
                </button>
              ))}
              {application.documents.length === 0 && (
                <div className="bg-[#f8f9ff] px-4 py-6 text-sm text-[#555f70]">Chua co giay to dinh kem.</div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-[#dce9ff] p-6">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck size={17} className="text-[#002045]" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Priority pool</h2>
            </div>
            <p className="text-5xl font-black text-[#002045]">{application.priorityScore ?? 0}</p>
            <p className="mt-3 text-sm font-semibold text-[#0d1c2e]">{priorityLabel(application.priorityScore, application.priorityCategory)}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#555f70]">
              Diem 100 neu ho so co doi tuong uu tien, 0 neu khong co doi tuong uu tien.
            </p>
          </section>

          <section className="bg-white p-6 shadow-sm">
            <label className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
              Ly do tu choi
            </label>
            <textarea
              value={reviewReason || application.rejectReason || ''}
              onChange={(event) => setReviewReason(event.target.value)}
              rows={6}
              placeholder="Nhap ly do neu tu choi ho so..."
              className="w-full rounded-lg border border-[#c4c6cf]/40 bg-white px-4 py-3 text-sm text-[#0d1c2e] outline-none focus:border-[#002045]"
            />
          </section>
        </aside>
      </div>
    </div>
  )
}

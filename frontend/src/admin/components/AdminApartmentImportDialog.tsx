import { FileSpreadsheet, Upload, X } from 'lucide-react'
import type { AdminApartmentImportPreviewResponse } from '@/admin/types'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AdminApartmentImportDialogProps {
  open: boolean
  file: File | null
  preview?: AdminApartmentImportPreviewResponse
  previewLoading: boolean
  importLoading: boolean
  onClose: () => void
  onChooseAnother: () => void
  onConfirm: () => void
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminApartmentImportDialog({
  open,
  file,
  preview,
  previewLoading,
  importLoading,
  onClose,
  onChooseAnother,
  onConfirm,
}: AdminApartmentImportDialogProps) {
  if (!open || !file) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#001f49]/45 p-3 sm:p-6">
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex shrink-0 items-start justify-between border-b border-[#e1e3e4] px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-[#001f49]">Xem truoc du lieu can ho</h3>
            <p className="mt-1 text-sm text-[#44474e]">Kiem tra toan bo du lieu truoc khi ghi vao du an.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#44474e] hover:bg-[#f3f4f5]">
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-hidden p-5 md:grid-cols-[280px_minmax(0,1fr)] md:p-6">
          <aside className="space-y-4 overflow-y-auto">
            <div className="rounded-xl border border-[#115cb9] bg-[#eef4ff] p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet size={22} className="mt-0.5 shrink-0 text-[#115cb9]" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-bold text-[#001f49]">{file.name}</p>
                  <p className="mt-1 text-xs text-[#44474e]">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button type="button" onClick={onChooseAnother} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#115cb9] px-4 py-3 text-sm font-bold text-white">
                <Upload size={16} />
                Chon tep khac
              </button>
            </div>

            <div className={`rounded-xl p-4 text-sm ${
              previewLoading
                ? 'bg-[#f3f4f5] text-[#44474e]'
                : preview?.valid
                  ? 'bg-green-50 text-green-800'
                  : 'bg-[#fff1ef] text-[#93000a]'
            }`}>
              {previewLoading && 'Dang doc va kiem tra file...'}
              {!previewLoading && preview?.valid && `${preview.rows.length} dong hop le, san sang import.`}
              {!previewLoading && preview && !preview.valid && `${preview.errors.length} loi. Khong co du lieu nao se duoc import.`}
            </div>

            {!previewLoading && preview && preview.errors.length > 0 && (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl bg-[#fff1ef] p-4 text-xs text-[#93000a]">
                {preview.errors.map((error, index) => (
                  <p key={`${error.row}-${error.field}-${index}`}>
                    Dong {error.row} - {error.field}: {error.message}
                  </p>
                ))}
              </div>
            )}
          </aside>

          <section className="min-h-0 overflow-hidden rounded-xl border border-[#e1e3e4] bg-[#f8f9fa]">
            {previewLoading ? (
              <div className="flex h-full min-h-80 items-center justify-center"><LoadingSpinner /></div>
            ) : preview?.rows.length ? (
              <div className="h-full overflow-auto">
                <table className="min-w-[900px] text-left">
                  <thead className="sticky top-0 bg-[#eff4ff] text-[#43474e]">
                    <tr>
                      {['Dong', 'Ma can', 'Toa/Block', 'Tang', 'So can', 'Dien tich', 'Phong ngu', 'Gia/m2', 'Tong gia', 'Trang thai'].map((header) => (
                        <th key={header} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.16em]">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c6cf]/20 bg-white">
                    {preview.rows.map((row) => (
                      <tr key={`${row.row}-${row.apartmentCode}`}>
                        <td className="px-4 py-3 text-xs font-bold text-[#465f88]">{row.row}</td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#002045]">{row.apartmentCode}</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{[row.building, row.blockName].filter(Boolean).join(' / ') || '-'}</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{row.floor ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{row.unitNumber || '-'}</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{row.areaSqm} m2</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{row.bedroomCount ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-[#555f70]">{row.pricePerSqm.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#0d1c2e]">{row.totalPrice.toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-xs font-bold text-[#002045]">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-full min-h-80 items-center justify-center px-6 text-center text-sm text-[#44474e]">
                File khong co dong du lieu co the hien thi.
              </div>
            )}
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#e1e3e4] px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-[#001f49] hover:bg-[#f3f4f5]">
            Huy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={previewLoading || importLoading || !preview?.valid}
            className="rounded-lg bg-[#115cb9] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importLoading ? 'Dang import...' : 'Xac nhan import'}
          </button>
        </div>
      </div>
    </div>
  )
}

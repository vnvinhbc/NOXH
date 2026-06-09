import { ExternalLink, FileText, X } from 'lucide-react'

type FilePreviewDialogProps = {
  open: boolean
  title: string
  fileUrl?: string
  fileName?: string
  onClose: () => void
}

function getFileKind(fileUrl?: string, fileName?: string) {
  const candidates = [fileName, fileUrl]
    .filter(Boolean)
    .map((value) => value!.split(/[?#]/)[0].toLowerCase())

  if (candidates.some((value) => /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(value))) return 'image'
  if (candidates.some((value) => /\.pdf$/.test(value))) return 'pdf'
  return 'unknown'
}

export default function FilePreviewDialog({
  open,
  title,
  fileUrl,
  fileName,
  onClose,
}: FilePreviewDialogProps) {
  if (!open || !fileUrl) return null

  const fileKind = getFileKind(fileUrl, fileName)

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#001f49]/45 p-3 sm:p-6">
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex shrink-0 items-start justify-between border-b border-[#e1e3e4] px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-4">
            <h3 className="truncate text-lg font-bold text-[#001f49]">{title}</h3>
            {fileName && <p className="mt-1 truncate text-sm text-[#44474e]">{fileName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#44474e] transition-colors hover:bg-[#f3f4f5] hover:text-[#001f49]"
            aria-label="Dong popup xem file"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#f8f9fa] p-4 sm:p-5">
          {fileKind === 'image' && (
            <div className="flex min-h-[18rem] items-center justify-center">
              <img
                src={fileUrl}
                alt={fileName || title}
                className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          )}

          {fileKind === 'pdf' && (
            <iframe
              title={fileName || title}
              src={fileUrl}
              className="h-[68vh] min-h-[28rem] w-full rounded-lg border border-[#e1e3e4] bg-white"
            />
          )}

          {fileKind === 'unknown' && (
            <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-lg border border-[#e1e3e4] bg-white text-center text-sm text-[#44474e]">
              <FileText size={34} className="mb-3 text-[#115cb9]" />
              <p className="font-semibold text-[#001f49]">Khong the xem truoc dinh dang nay trong trinh duyet.</p>
              <p className="mt-1 max-w-md">Ban co the mo file bang lien ket ben duoi neu trinh duyet ho tro.</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#e1e3e4] px-5 py-4 sm:px-6">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-[#001f49] transition-colors hover:bg-[#f3f4f5]"
          >
            <ExternalLink size={16} />
            Mo tab moi
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#115cb9] px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Dong
          </button>
        </div>
      </div>
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPaginationItems, PAGE_SIZE_OPTIONS } from './pagination'

interface DataPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  itemLabel?: string
  disabled?: boolean
}

export default function DataPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'ban ghi',
  disabled = false,
}: DataPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = totalItems === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-[#c4c6cf]/20 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#555f70]">
        <span>
          Hien thi {start.toLocaleString('vi-VN')}-{end.toLocaleString('vi-VN')} / {totalItems.toLocaleString('vi-VN')} {itemLabel}
        </span>
        <label className="flex items-center gap-2 rounded-lg border border-[#002045]/15 bg-[#f8f9ff] px-3 py-2 font-bold text-[#002045]">
          <span>Limit</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="bg-transparent font-bold outline-none"
            aria-label="So ban ghi moi trang"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex items-center gap-1 self-start rounded-2xl bg-[#07111f] p-1.5 text-white lg:self-auto" aria-label="Phan trang">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 0 || totalPages === 0}
          className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-sm font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={17} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {getPaginationItems(page, totalPages).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={disabled}
              aria-current={item === page ? 'page' : undefined}
              className={`h-10 min-w-10 rounded-xl px-2 text-sm font-bold transition ${
                item === page
                  ? 'border border-white/15 bg-white/10 shadow-inner'
                  : 'hover:bg-white/10'
              }`}
            >
              {item + 1}
            </button>
          ) : (
            <span key={item} className="flex h-10 min-w-8 items-center justify-center font-bold">...</span>
          )
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || totalPages === 0 || page >= totalPages - 1}
          className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-sm font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  )
}

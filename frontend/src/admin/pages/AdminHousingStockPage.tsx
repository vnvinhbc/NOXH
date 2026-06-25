import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Download, Filter, Grid2X2, List, Search } from 'lucide-react'
import { projectApi } from '@/api/project'
import { adminHousingStockApi } from '@/admin/api/adminHousingStock'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DataPagination from '@/components/common/DataPagination'
import { clampPage, getPageItems } from '@/components/common/pagination'
import { getRowNumber } from '@/components/common/rowNumber'

const statusOptions = ['ALL', 'AVAILABLE', 'LOCKED', 'ASSIGNED', 'UNAVAILABLE']

function currency(value?: number) {
  if (!value) return '-'
  return `${value.toLocaleString('vi-VN')} VND`
}

function statusTone(status: string) {
  if (status === 'AVAILABLE') return 'bg-green-100 text-green-700'
  if (status === 'ASSIGNED') return 'bg-[#d6e3ff] text-[#002045]'
  if (status === 'LOCKED') return 'bg-[#ffddba] text-[#633f0f]'
  return 'bg-[#ffdad6] text-[#93000a]'
}

export default function AdminHousingStockPage() {
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data.result || []),
  })

  const effectiveProjectId = projectId || projects[0]?.id || ''

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['adminHousingStock', effectiveProjectId, status],
    queryFn: () => adminHousingStockApi.getUnits(effectiveProjectId, status).then((res) => res.data.result || []),
    enabled: Boolean(effectiveProjectId),
  })

  const filteredUnits = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return units
    return units.filter((unit) =>
      unit.apartmentCode.toLowerCase().includes(keyword) ||
      (unit.building || '').toLowerCase().includes(keyword) ||
      (unit.blockName || '').toLowerCase().includes(keyword) ||
      (unit.unitNumber || '').toLowerCase().includes(keyword)
    )
  }, [query, units])
  const safePage = clampPage(page, filteredUnits.length, pageSize)
  const paginatedUnits = useMemo(
    () => getPageItems(filteredUnits, safePage, pageSize),
    [filteredUnits, safePage, pageSize]
  )

  const selectedProject = projects.find((project) => project.id === effectiveProjectId)
  const available = units.filter((unit) => unit.status === 'AVAILABLE').length
  const assigned = units.filter((unit) => unit.status === 'ASSIGNED').length
  const locked = units.filter((unit) => unit.status === 'LOCKED').length

  if (loadingProjects) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">Apartment inventory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">Housing Stock Inventory</h1>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#002045] shadow-sm">
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <section className="mb-6 grid gap-4 bg-white p-5 shadow-sm lg:grid-cols-[minmax(240px,0.7fr)_minmax(180px,0.35fr)_minmax(260px,1fr)_auto]">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Du an
          <select value={effectiveProjectId} onChange={(event) => { setProjectId(event.target.value); setPage(0) }} className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white px-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Trang thai
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0) }} className="mt-2 h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white px-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]">
            {statusOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#43474e]">
          Tim kiem
          <span className="relative mt-2 block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Ma can, toa, tang..." className="h-11 w-full rounded-lg border border-[#c4c6cf]/40 bg-white pl-10 pr-3 text-sm normal-case tracking-normal outline-none focus:border-[#002045]" />
          </span>
        </label>
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => setViewMode('table')} className={`flex h-11 w-11 items-center justify-center rounded-lg ${viewMode === 'table' ? 'bg-[#002045] text-white' : 'bg-[#eff4ff] text-[#002045]'}`} aria-label="Bang">
            <List size={17} />
          </button>
          <button type="button" onClick={() => setViewMode('grid')} className={`flex h-11 w-11 items-center justify-center rounded-lg ${viewMode === 'grid' ? 'bg-[#002045] text-white' : 'bg-[#eff4ff] text-[#002045]'}`} aria-label="Luoi">
            <Grid2X2 size={17} />
          </button>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ['Tong can', units.length],
          ['Kha dung', available],
          ['Dang khoa', locked],
          ['Da gan', assigned],
        ].map(([label, value]) => (
          <section key={label} className="bg-white p-5 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#43474e]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#002045]">{Number(value).toLocaleString('vi-VN')}</p>
          </section>
        ))}
      </div>

      {loadingUnits ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {paginatedUnits.map((unit) => (
              <section key={unit.id} className="bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-black text-[#002045]">{unit.apartmentCode}</p>
                    <p className="mt-1 text-xs text-[#555f70]">{selectedProject?.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone(unit.status)}`}>{unit.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#74777f]">Toa</span>{unit.building || '-'}</p>
                  <p><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#74777f]">Tang</span>{unit.floor ?? '-'}</p>
                  <p><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#74777f]">Dien tich</span>{unit.areaSqm ?? '-'} m2</p>
                  <p><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#74777f]">Phong ngu</span>{unit.bedroomCount ?? '-'}</p>
                </div>
              </section>
            ))}
          </div>
          <DataPagination
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredUnits.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
            itemLabel="can ho"
          />
        </div>
      ) : (
        <section className="overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#eff4ff] px-5 py-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[#002045]" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Danh sach can ho</h2>
            </div>
            <Filter size={16} className="text-[#465f88]" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8f9ff] text-[#43474e]">
                <tr>
                  {['STT', 'Ma can', 'Toa/Block', 'Tang', 'Can', 'Dien tich', 'Phong ngu', 'Gia du kien', 'Trang thai'].map((header) => (
                    <th key={header} className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {paginatedUnits.map((unit, index) => (
                  <tr key={unit.id} className="hover:bg-[#eff4ff]/50">
                    <td className="px-5 py-4 text-xs font-bold text-[#465f88]">{getRowNumber(safePage, pageSize, index)}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[#002045]">{unit.apartmentCode}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{[unit.building, unit.blockName].filter(Boolean).join(' / ') || '-'}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{unit.floor ?? '-'}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{unit.unitNumber || '-'}</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{unit.areaSqm ?? '-'} m2</td>
                    <td className="px-5 py-4 text-sm text-[#555f70]">{unit.bedroomCount ?? '-'}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#0d1c2e]">{currency(unit.totalPrice)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone(unit.status)}`}>{unit.status}</span></td>
                  </tr>
                ))}
                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-sm text-[#555f70]">
                      Khong co can ho phu hop.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DataPagination
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredUnits.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(0) }}
            itemLabel="can ho"
          />
        </section>
      )}
    </div>
  )
}

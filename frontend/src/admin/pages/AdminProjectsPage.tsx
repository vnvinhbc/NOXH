import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Download, FileSpreadsheet, ImagePlus, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { adminProjectsApi } from '@/admin/api/adminProjects'
import type { AdminApartmentImportPreviewResponse, AdminApartmentRequest, AdminProjectRequest, AdminProjectResponse } from '@/admin/types'
import type { ApartmentUnitResponse } from '@/types'
import AdminApartmentImportDialog from '@/admin/components/AdminApartmentImportDialog'
import DataPagination from '@/components/common/DataPagination'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { clampPage, getPageItems } from '@/components/common/pagination'
import { getRowNumber } from '@/components/common/rowNumber'

const emptyProject: AdminProjectRequest = {
  name: '',
  description: '',
  location: '',
  province: '',
  pricePerSqm: 0,
  registrationStart: '',
  registrationEnd: '',
  lotteryDate: '',
  status: 'OPEN',
}

const emptyApartment: AdminApartmentRequest = {
  apartmentCode: '',
  building: '',
  blockName: '',
  floor: undefined,
  unitNumber: '',
  areaSqm: 0,
  bedroomCount: undefined,
  direction: '',
  pricePerSqm: 0,
  totalPrice: undefined,
  status: 'AVAILABLE',
}

function errorMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
}

export default function AdminProjectsPage() {
  const queryClient = useQueryClient()
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [projectPage, setProjectPage] = useState(0)
  const [projectPageSize, setProjectPageSize] = useState(5)
  const [apartmentPage, setApartmentPage] = useState(0)
  const [apartmentPageSize, setApartmentPageSize] = useState(10)
  const [projectDialog, setProjectDialog] = useState<AdminProjectResponse | 'create' | null>(null)
  const [projectForm, setProjectForm] = useState<AdminProjectRequest>(emptyProject)
  const [projectImage, setProjectImage] = useState<File | null>(null)
  const [apartmentDialog, setApartmentDialog] = useState<ApartmentUnitResponse | 'create' | null>(null)
  const [apartmentForm, setApartmentForm] = useState<AdminApartmentRequest>(emptyApartment)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<AdminApartmentImportPreviewResponse>()

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: () => adminProjectsApi.getAll().then((res) => res.data.result || []),
  })
  const selectedProject = projects.find((project) => project.id === selectedId) || projects[0]
  const activeProjectId = selectedProject?.id || ''

  const { data: apartments = [], isLoading: loadingApartments } = useQuery({
    queryKey: ['adminProjectApartments', activeProjectId],
    queryFn: () => adminProjectsApi.getApartments(activeProjectId).then((res) => res.data.result || []),
    enabled: Boolean(activeProjectId),
  })

  const { data: imports = [] } = useQuery({
    queryKey: ['adminProjectImports', activeProjectId],
    queryFn: () => adminProjectsApi.getImports(activeProjectId).then((res) => res.data.result || []),
    enabled: Boolean(activeProjectId),
  })

  const safeProjectPage = clampPage(projectPage, projects.length, projectPageSize)
  const visibleProjects = useMemo(
    () => getPageItems(projects, safeProjectPage, projectPageSize),
    [projects, projectPageSize, safeProjectPage]
  )
  const safeApartmentPage = clampPage(apartmentPage, apartments.length, apartmentPageSize)
  const visibleApartments = useMemo(
    () => getPageItems(apartments, safeApartmentPage, apartmentPageSize),
    [apartments, apartmentPageSize, safeApartmentPage]
  )

  const invalidateProjectData = () => {
    queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['adminProjectApartments'] })
    queryClient.invalidateQueries({ queryKey: ['adminProjectImports'] })
    queryClient.invalidateQueries({ queryKey: ['adminHousingStock'] })
    queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] })
  }

  const saveProjectMutation = useMutation({
    mutationFn: () => projectDialog === 'create'
      ? adminProjectsApi.create(projectForm, projectImage)
      : adminProjectsApi.update((projectDialog as AdminProjectResponse).id, projectForm, projectImage),
    onSuccess: (response) => {
      const saved = response.data.result
      if (saved?.id) setSelectedId(saved.id)
      invalidateProjectData()
      setProjectDialog(null)
      toast.success(projectDialog === 'create' ? 'Da tao du an' : 'Da cap nhat du an')
    },
    onError: (error) => toast.error(errorMessage(error, 'Khong the luu du an')),
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => adminProjectsApi.delete(projectId),
    onSuccess: () => {
      setSelectedId('')
      invalidateProjectData()
      toast.success('Da xoa du an va cac can ho thuoc du an')
    },
    onError: (error) => toast.error(errorMessage(error, 'Khong the xoa du an')),
  })

  const saveApartmentMutation = useMutation({
    mutationFn: () => apartmentDialog === 'create'
      ? adminProjectsApi.createApartment(activeProjectId, apartmentForm)
      : adminProjectsApi.updateApartment(activeProjectId, (apartmentDialog as ApartmentUnitResponse).id, apartmentForm),
    onSuccess: () => {
      invalidateProjectData()
      setApartmentDialog(null)
      toast.success(apartmentDialog === 'create' ? 'Da them can ho' : 'Da cap nhat can ho')
    },
    onError: (error) => toast.error(errorMessage(error, 'Khong the luu can ho')),
  })

  const deleteApartmentMutation = useMutation({
    mutationFn: (apartmentId: string) => adminProjectsApi.deleteApartment(activeProjectId, apartmentId),
    onSuccess: () => {
      invalidateProjectData()
      toast.success('Da xoa can ho')
    },
    onError: (error) => toast.error(errorMessage(error, 'Khong the xoa can ho')),
  })

  const importMutation = useMutation({
    mutationFn: () => adminProjectsApi.importApartments(activeProjectId, importFile!),
    onSuccess: (response) => {
      const result = response.data.result
      if (!result?.success) {
        setImportPreview((current) => ({
          valid: false,
          rows: current?.rows || [],
          errors: result?.errors || [],
        }))
        toast.error('File co loi, khong co can ho nao duoc import')
        return
      }
      setImportPreview(undefined)
      setImportFile(null)
      setImportDialogOpen(false)
      if (importInputRef.current) importInputRef.current.value = ''
      invalidateProjectData()
      toast.success(`Da import ${result.importedCount} can ho`)
    },
    onError: (error) => toast.error(errorMessage(error, 'Khong the import file')),
  })

  const previewImportMutation = useMutation({
    mutationFn: (file: File) => adminProjectsApi.previewApartments(activeProjectId, file),
    onSuccess: (response) => setImportPreview(response.data.result),
    onError: (error) => {
      setImportPreview({ valid: false, rows: [], errors: [] })
      toast.error(errorMessage(error, 'Khong the doc file import'))
    },
  })

  const selectImportFile = (file: File | null) => {
    if (!file) return
    setImportFile(file)
    setImportPreview(undefined)
    setImportDialogOpen(true)
    previewImportMutation.mutate(file)
  }

  const openProjectDialog = (project?: AdminProjectResponse) => {
    setProjectImage(null)
    if (!project) {
      setProjectForm(emptyProject)
      setProjectDialog('create')
      return
    }
    setProjectForm({
      name: project.name,
      description: project.description || '',
      location: project.location || '',
      province: project.province || '',
      pricePerSqm: project.pricePerSqm || 0,
      registrationStart: project.registrationStart || '',
      registrationEnd: project.registrationEnd || '',
      lotteryDate: project.lotteryDate ? dayjs(project.lotteryDate).format('YYYY-MM-DDTHH:mm') : '',
      status: project.status,
    })
    setProjectDialog(project)
  }

  const openApartmentDialog = (apartment?: ApartmentUnitResponse) => {
    if (!apartment) {
      setApartmentForm(emptyApartment)
      setApartmentDialog('create')
      return
    }
    setApartmentForm({
      apartmentCode: apartment.apartmentCode,
      building: apartment.building || '',
      blockName: apartment.blockName || '',
      floor: apartment.floor,
      unitNumber: apartment.unitNumber || '',
      areaSqm: apartment.areaSqm || 0,
      bedroomCount: apartment.bedroomCount,
      direction: apartment.direction || '',
      pricePerSqm: apartment.pricePerSqm || 0,
      totalPrice: apartment.totalPrice,
      status: apartment.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE',
    })
    setApartmentDialog(apartment)
  }

  const downloadTemplate = async (format: 'csv' | 'xlsx') => {
    const response = await adminProjectsApi.downloadTemplate(format)
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `apartment-import-template.${format}`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loadingProjects) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#465f88]">Project inventory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d1c2e]">Du lieu du an va can ho</h1>
          <p className="mt-2 text-sm text-[#555f70]">Khoi tao du an, anh dai dien va danh sach can ho truoc khi tao dot quay.</p>
        </div>
        <button onClick={() => openProjectDialog()} className="inline-flex items-center gap-2 rounded-lg bg-[#002045] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
          <Plus size={15} /> Tao du an
        </button>
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
        <section className="overflow-hidden bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-[#eff4ff] px-5 py-4">
            <Building2 size={17} className="text-[#002045]" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#002045]">Danh sach du an</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8f9ff]">
                <tr>
                  {['STT', 'Du an', 'Can ho', 'Trang thai', ''].map((header) => (
                    <th key={header} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#43474e]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]/20">
                {visibleProjects.map((project, index) => (
                  <tr
                    key={project.id}
                    onClick={() => { setSelectedId(project.id); setApartmentPage(0) }}
                    className={`cursor-pointer hover:bg-[#eff4ff]/60 ${selectedProject?.id === project.id ? 'bg-[#eff4ff]' : ''}`}
                  >
                    <td className="px-4 py-4 text-xs font-bold text-[#465f88]">{getRowNumber(safeProjectPage, projectPageSize, index)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {project.imageUrl ? <img src={project.imageUrl} alt="" className="h-10 w-12 object-cover" /> : <div className="flex h-10 w-12 items-center justify-center bg-[#dce9ff]"><Building2 size={17} /></div>}
                        <div>
                          <p className="text-sm font-bold text-[#002045]">{project.name}</p>
                          <p className="text-[11px] text-[#555f70]">{project.province || project.location || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#0d1c2e]">{project.availableUnits || 0}/{project.totalUnits || 0}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#d6e3ff] px-2.5 py-1 text-[10px] font-bold text-[#002045]">{project.status}</span>
                      {project.businessActive && <LockKeyhole size={13} className="ml-2 inline text-[#93000a]" />}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button disabled={project.businessActive} onClick={(event) => { event.stopPropagation(); openProjectDialog(project) }} className="text-[#465f88] disabled:opacity-30" aria-label="Sua du an"><Pencil size={15} /></button>
                        <button
                          disabled={project.businessActive || deleteProjectMutation.isPending}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (window.confirm(`Xoa du an "${project.name}" va tat ca can ho?`)) deleteProjectMutation.mutate(project.id)
                          }}
                          className="text-[#93000a] disabled:opacity-30"
                          aria-label="Xoa du an"
                        ><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataPagination page={safeProjectPage} pageSize={projectPageSize} totalItems={projects.length} onPageChange={setProjectPage} onPageSizeChange={(size) => { setProjectPageSize(size); setProjectPage(0) }} itemLabel="du an" />
        </section>

        <section className="overflow-hidden bg-white shadow-sm">
          {selectedProject ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#eff4ff] px-5 py-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#002045]">{selectedProject.name}</h2>
                  <p className="text-xs text-[#555f70]">{selectedProject.totalUnits || 0} can ho trong kho</p>
                </div>
                <button disabled={selectedProject.businessActive} onClick={() => openApartmentDialog()} className="inline-flex items-center gap-2 rounded-lg bg-[#115cb9] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Plus size={14} /> Them can ho</button>
              </div>

              {selectedProject.businessActive && (
                <div className="m-4 flex items-start gap-3 border border-[#ffb4ab] bg-[#fff1ef] p-4 text-sm text-[#93000a]">
                  <LockKeyhole size={18} className="mt-0.5 shrink-0" />
                  Du an da co ho so hoac dot quay. Tat ca thao tac sua, xoa va import du lieu da bi khoa.
                </div>
              )}

              <div className="grid gap-4 border-b border-[#c4c6cf]/20 p-4 lg:grid-cols-[1fr_auto]">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  disabled={selectedProject.businessActive}
                  onChange={(event) => selectImportFile(event.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={selectedProject.businessActive}
                  onClick={() => importInputRef.current?.click()}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-[#465f88]/40 px-4 py-3 text-left text-sm text-[#555f70] disabled:opacity-40"
                >
                  <FileSpreadsheet size={19} />
                  <span className="min-w-0 flex-1 truncate">Chon file CSV hoac XLSX de xem truoc</span>
                </button>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => downloadTemplate('csv')} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-[#002045]"><Download size={13} /> CSV mau</button>
                  <button type="button" onClick={() => downloadTemplate('xlsx')} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-[#002045]"><Download size={13} /> XLSX mau</button>
                </div>
              </div>

              {loadingApartments ? <div className="flex justify-center py-14"><LoadingSpinner /></div> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-[#f8f9ff]">
                      <tr>
                        {['STT', 'Ma can', 'Toa/Block', 'Tang', 'Dien tich', 'Gia', 'Trang thai', ''].map((header) => (
                          <th key={header} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#43474e]">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c6cf]/20">
                      {visibleApartments.map((apartment, index) => {
                        const locked = ['LOCKED', 'ASSIGNED'].includes(apartment.status)
                        return (
                          <tr key={apartment.id}>
                            <td className="px-4 py-4 text-xs font-bold text-[#465f88]">{getRowNumber(safeApartmentPage, apartmentPageSize, index)}</td>
                            <td className="px-4 py-4 font-mono text-xs font-bold text-[#002045]">{apartment.apartmentCode}</td>
                            <td className="px-4 py-4 text-sm text-[#555f70]">{[apartment.building, apartment.blockName].filter(Boolean).join(' / ') || '-'}</td>
                            <td className="px-4 py-4 text-sm text-[#555f70]">{apartment.floor ?? '-'}</td>
                            <td className="px-4 py-4 text-sm text-[#555f70]">{apartment.areaSqm ?? '-'} m2</td>
                            <td className="px-4 py-4 text-sm font-semibold text-[#0d1c2e]">{apartment.totalPrice?.toLocaleString('vi-VN') || '-'}</td>
                            <td className="px-4 py-4 text-xs font-bold text-[#002045]">{apartment.status}</td>
                            <td className="px-4 py-4 text-right">
                              <button disabled={selectedProject.businessActive || locked} onClick={() => openApartmentDialog(apartment)} className="mr-3 text-[#465f88] disabled:opacity-30"><Pencil size={14} /></button>
                              <button
                                disabled={selectedProject.businessActive || locked}
                                onClick={() => window.confirm(`Xoa can ${apartment.apartmentCode}?`) && deleteApartmentMutation.mutate(apartment.id)}
                                className="text-[#93000a] disabled:opacity-30"
                              ><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <DataPagination page={safeApartmentPage} pageSize={apartmentPageSize} totalItems={apartments.length} onPageChange={setApartmentPage} onPageSizeChange={(size) => { setApartmentPageSize(size); setApartmentPage(0) }} itemLabel="can ho" />

              {imports.length > 0 && (
                <div className="border-t border-[#c4c6cf]/20 p-5">
                  <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#002045]">Lich su import</h3>
                  <div className="space-y-2">
                    {imports.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 bg-[#f8f9ff] px-3 py-2 text-xs text-[#555f70]">
                        <span className="truncate">{item.originalFileName}</span>
                        <span className="shrink-0">{item.importedCount} can - {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')} - Da luu ImageKit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-sm text-[#555f70]">Tao du an dau tien de quan ly can ho.</div>
          )}
        </section>
      </div>

      <AdminApartmentImportDialog
        open={importDialogOpen}
        file={importFile}
        preview={importPreview}
        previewLoading={previewImportMutation.isPending}
        importLoading={importMutation.isPending}
        onClose={() => setImportDialogOpen(false)}
        onChooseAnother={() => {
          if (importInputRef.current) {
            importInputRef.current.value = ''
            importInputRef.current.click()
          }
        }}
        onConfirm={() => importMutation.mutate()}
      />

      {projectDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <form onSubmit={(event) => { event.preventDefault(); saveProjectMutation.mutate() }} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#002045]">{projectDialog === 'create' ? 'Tao du an' : 'Sua du an'}</h2>
              <button type="button" onClick={() => setProjectDialog(null)} className="text-sm font-bold text-[#555f70]">Dong</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold text-[#43474e]">Ten du an<input required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#43474e]">Tinh/thanh<input value={projectForm.province} onChange={(e) => setProjectForm({ ...projectForm, province: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="md:col-span-2 text-xs font-bold text-[#43474e]">Dia diem<input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="md:col-span-2 text-xs font-bold text-[#43474e]">Mo ta<textarea rows={3} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#43474e]">Gia tham chieu/m2<input type="number" min="0" value={projectForm.pricePerSqm || ''} onChange={(e) => setProjectForm({ ...projectForm, pricePerSqm: Number(e.target.value) })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#43474e]">Trang thai<select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as AdminProjectRequest['status'] })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal"><option value="OPEN">OPEN</option><option value="CLOSED">CLOSED</option><option value="COMPLETED">COMPLETED</option></select></label>
              <label className="text-xs font-bold text-[#43474e]">Bat dau dang ky<input type="date" value={projectForm.registrationStart} onChange={(e) => setProjectForm({ ...projectForm, registrationStart: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#43474e]">Ket thuc dang ky<input type="date" value={projectForm.registrationEnd} onChange={(e) => setProjectForm({ ...projectForm, registrationEnd: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-[#43474e]">Ngay quay<input type="datetime-local" value={projectForm.lotteryDate} onChange={(e) => setProjectForm({ ...projectForm, lotteryDate: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm text-[#555f70]"><ImagePlus size={18} /><span className="truncate">{projectImage?.name || 'Anh dai dien (tuy chon)'}</span><input type="file" accept="image/*" onChange={(e) => setProjectImage(e.target.files?.[0] || null)} className="hidden" /></label>
            </div>
            {(projectImage || (projectDialog !== 'create' && projectDialog.imageUrl)) && <img src={projectImage ? URL.createObjectURL(projectImage) : (projectDialog as AdminProjectResponse).imageUrl} alt="" className="mt-4 h-36 w-full object-cover" />}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setProjectDialog(null)} className="rounded-lg border px-5 py-3 text-xs font-bold">Huy</button>
              <button disabled={saveProjectMutation.isPending} className="rounded-lg bg-[#002045] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">Luu du an</button>
            </div>
          </form>
        </div>
      )}

      {apartmentDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <form onSubmit={(event) => { event.preventDefault(); saveApartmentMutation.mutate() }} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#002045]">{apartmentDialog === 'create' ? 'Them can ho' : 'Sua can ho'}</h2>
              <button type="button" onClick={() => setApartmentDialog(null)} className="text-sm font-bold text-[#555f70]">Dong</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold">Ma can<input required value={apartmentForm.apartmentCode} onChange={(e) => setApartmentForm({ ...apartmentForm, apartmentCode: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Trang thai<select value={apartmentForm.status} onChange={(e) => setApartmentForm({ ...apartmentForm, status: e.target.value as AdminApartmentRequest['status'] })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal"><option value="AVAILABLE">AVAILABLE</option><option value="UNAVAILABLE">UNAVAILABLE</option></select></label>
              <label className="text-xs font-bold">Toa<input value={apartmentForm.building} onChange={(e) => setApartmentForm({ ...apartmentForm, building: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Block<input value={apartmentForm.blockName} onChange={(e) => setApartmentForm({ ...apartmentForm, blockName: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Tang<input type="number" value={apartmentForm.floor ?? ''} onChange={(e) => setApartmentForm({ ...apartmentForm, floor: e.target.value ? Number(e.target.value) : undefined })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">So can<input value={apartmentForm.unitNumber} onChange={(e) => setApartmentForm({ ...apartmentForm, unitNumber: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Dien tich m2<input required type="number" step="0.01" min="0.01" value={apartmentForm.areaSqm || ''} onChange={(e) => setApartmentForm({ ...apartmentForm, areaSqm: Number(e.target.value) })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Phong ngu<input type="number" min="0" value={apartmentForm.bedroomCount ?? ''} onChange={(e) => setApartmentForm({ ...apartmentForm, bedroomCount: e.target.value ? Number(e.target.value) : undefined })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Huong<input value={apartmentForm.direction} onChange={(e) => setApartmentForm({ ...apartmentForm, direction: e.target.value })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="text-xs font-bold">Gia/m2<input required type="number" min="1" value={apartmentForm.pricePerSqm || ''} onChange={(e) => setApartmentForm({ ...apartmentForm, pricePerSqm: Number(e.target.value) })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
              <label className="md:col-span-2 text-xs font-bold">Tong gia (bo trong de tu tinh)<input type="number" min="0" value={apartmentForm.totalPrice ?? ''} onChange={(e) => setApartmentForm({ ...apartmentForm, totalPrice: e.target.value ? Number(e.target.value) : undefined })} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm font-normal" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setApartmentDialog(null)} className="rounded-lg border px-5 py-3 text-xs font-bold">Huy</button>
              <button disabled={saveApartmentMutation.isPending} className="rounded-lg bg-[#002045] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">Luu can ho</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

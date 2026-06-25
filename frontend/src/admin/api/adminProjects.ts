import api from '@/api/axios'
import type { ApiResponse, ApartmentUnitResponse } from '@/types'
import type {
  AdminApartmentImportHistoryResponse,
  AdminApartmentImportPreviewResponse,
  AdminApartmentImportResponse,
  AdminApartmentRequest,
  AdminProjectRequest,
  AdminProjectResponse,
} from '@/admin/types'

function projectFormData(project: AdminProjectRequest, image?: File | null) {
  const form = new FormData()
  form.append('project', new Blob([JSON.stringify(project)], { type: 'application/json' }))
  if (image) form.append('image', image)
  return form
}

export const adminProjectsApi = {
  getAll: () => api.get<ApiResponse<AdminProjectResponse[]>>('/admin/projects'),

  create: (project: AdminProjectRequest, image?: File | null) =>
    api.post<ApiResponse<AdminProjectResponse>>('/admin/projects', projectFormData(project, image)),

  update: (projectId: string, project: AdminProjectRequest, image?: File | null) =>
    api.put<ApiResponse<AdminProjectResponse>>(`/admin/projects/${projectId}`, projectFormData(project, image)),

  delete: (projectId: string) => api.delete(`/admin/projects/${projectId}`),

  getApartments: (projectId: string) =>
    api.get<ApiResponse<ApartmentUnitResponse[]>>(`/admin/projects/${projectId}/apartments`),

  createApartment: (projectId: string, request: AdminApartmentRequest) =>
    api.post<ApiResponse<ApartmentUnitResponse>>(`/admin/projects/${projectId}/apartments`, request),

  updateApartment: (projectId: string, apartmentId: string, request: AdminApartmentRequest) =>
    api.put<ApiResponse<ApartmentUnitResponse>>(`/admin/projects/${projectId}/apartments/${apartmentId}`, request),

  deleteApartment: (projectId: string, apartmentId: string) =>
    api.delete(`/admin/projects/${projectId}/apartments/${apartmentId}`),

  importApartments: (projectId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<AdminApartmentImportResponse>>(
      `/admin/projects/${projectId}/apartments/import`,
      form
    )
  },

  previewApartments: (projectId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<AdminApartmentImportPreviewResponse>>(
      `/admin/projects/${projectId}/apartments/import-preview`,
      form
    )
  },

  getImports: (projectId: string) =>
    api.get<ApiResponse<AdminApartmentImportHistoryResponse[]>>(`/admin/projects/${projectId}/imports`),

  downloadTemplate: (format: 'csv' | 'xlsx') =>
    api.get(`/admin/projects/apartments/template.${format}`, { responseType: 'blob' }),
}

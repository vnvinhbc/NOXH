export type AdminApplicationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface AdminApplicationDocument {
  id: string
  documentType: string
  fileUrl: string
  fileName?: string
  status: string
  uploadedAt: string
}

export interface AdminApplicationResponse {
  id: string
  applicationCode: string
  userId: string
  userFullName: string
  userEmail: string
  projectId: string
  projectName: string
  status: AdminApplicationStatus
  priorityScore: number
  province?: string
  district?: string
  ward?: string
  detailedAddress?: string
  householdSize?: number
  priorityCategory?: string
  incomePerMonth?: number
  lotteryNumber?: string
  lotteryResult?: string
  rejectReason?: string
  submittedAt?: string
  createdAt?: string
  documents: AdminApplicationDocument[]
}

export interface AdminApplicationOverviewResponse {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  recentApplications: AdminApplicationResponse[]
}

export interface AdminApplicationPageResponse {
  items: AdminApplicationResponse[]
  page: number
  limit: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AdminHousingStockOverviewResponse {
  totalUnits: number
  availableUnits: number
}

export interface AdminLotteryAuditLogResponse {
  id: string
  eventId: string
  eventName: string
  projectName: string
  eventType: string
  payload?: string
  previousHash?: string
  currentHash: string
  createdAt: string
}

export interface AdminProjectResponse {
  id: string
  name: string
  description?: string
  location?: string
  province?: string
  totalUnits: number
  availableUnits: number
  pricePerSqm?: number
  minArea?: number
  maxArea?: number
  registrationStart?: string
  registrationEnd?: string
  lotteryDate?: string
  status: 'OPEN' | 'CLOSED' | 'COMPLETED'
  imageUrl?: string
  businessActive: boolean
  createdAt: string
}

export interface AdminProjectRequest {
  name: string
  description?: string
  location?: string
  province?: string
  pricePerSqm?: number
  registrationStart?: string
  registrationEnd?: string
  lotteryDate?: string
  status: 'OPEN' | 'CLOSED' | 'COMPLETED'
}

export interface AdminApartmentRequest {
  apartmentCode: string
  building?: string
  blockName?: string
  floor?: number
  unitNumber?: string
  areaSqm: number
  bedroomCount?: number
  direction?: string
  pricePerSqm: number
  totalPrice?: number
  status: 'AVAILABLE' | 'UNAVAILABLE'
}

export interface AdminApartmentImportError {
  row: number
  field: string
  message: string
}

export interface AdminApartmentImportResponse {
  success: boolean
  importedCount: number
  fileUrl?: string
  fileName?: string
  errors: AdminApartmentImportError[]
}

export interface AdminApartmentImportPreviewRow {
  row: number
  apartmentCode: string
  building?: string
  blockName?: string
  floor?: number
  unitNumber?: string
  areaSqm: number
  bedroomCount?: number
  direction?: string
  pricePerSqm: number
  totalPrice: number
  status: string
}

export interface AdminApartmentImportPreviewResponse {
  valid: boolean
  rows: AdminApartmentImportPreviewRow[]
  errors: AdminApartmentImportError[]
}

export interface AdminApartmentImportHistoryResponse {
  id: string
  originalFileName: string
  fileUrl: string
  importedCount: number
  createdAt: string
}

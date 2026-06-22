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

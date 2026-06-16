export interface ApiResponse<T> {
  code: number
  message?: string
  result?: T
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  userId: string
  fullName: string
  email: string
  role: string
  isVerified: boolean
  kycStatus: string
}

export interface UserResponse {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  cccdNumber?: string
  dateOfBirth?: string
  gender?: string
  province?: string
  district?: string
  ward?: string
  currentAddress?: string
  permanentAddress?: string
  occupation?: string
  incomePerMonth?: number
  householdSize?: number
  priorityCategory?: string
  cccdFrontUrl?: string
  cccdBackUrl?: string
  portraitUrl?: string
  role: string
  isVerified: boolean
  kycStatus: string
  createdAt: string
}

export interface FileUploadResponse {
  url: string
  fileName: string
}

export interface UserDocumentResponse {
  id: string
  documentType: string
  fileUrl: string
  fileName?: string
  status: string
  uploadedAt: string
}

export interface ProjectResponse {
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
  status: string
  imageUrl?: string
  daysRemaining?: number
}

export interface ApplicationDocumentResponse {
  id: string
  documentType: string
  fileUrl: string
  fileName?: string
  status: string
  uploadedAt: string
}

export interface ApplicationResponse {
  id: string
  applicationCode: string
  userId: string
  projectId: string
  projectName?: string
  status: string
  priorityScore: number
  lotteryNumber?: string
  province?: string
  district?: string
  ward?: string
  detailedAddress?: string
  householdSize?: number
  priorityCategory?: string
  incomePerMonth?: number
  taxCode?: string
  lotteryResult?: string
  rejectReason?: string
  submittedAt?: string
  createdAt?: string
  documents?: ApplicationDocumentResponse[]
}

export interface NotificationResponse {
  id: string
  title: string
  content?: string
  type?: string
  isRead: boolean
  createdAt: string
}

export interface DashboardStats {
  totalApplications: number
  approvedCount: number
  pendingCount: number
}

export interface DashboardResponse {
  currentApplication?: ApplicationResponse
  recentNotifications: NotificationResponse[]
  stats: DashboardStats
}

export interface Province {
  code: number
  name: string
}

export interface District {
  code: number
  name: string
  districts?: District[]
}

export interface Ward {
  code: number
  name: string
  wards?: Ward[]
}

export interface ApartmentUnitResponse {
  id: string
  apartmentCode: string
  building?: string
  blockName?: string
  floor?: number
  unitNumber?: string
  areaSqm?: number
  bedroomCount?: number
  direction?: string
  pricePerSqm?: number
  totalPrice?: number
  status: string
}

export interface LotteryEventResponse {
  id: string
  projectId: string
  projectName: string
  name: string
  status: string
  algorithmType: string
  commitmentHash?: string
  participantHash?: string
  apartmentHash?: string
  xsmbDrawDate?: string
  xsmbResult?: string
  ethChainId?: number
  ethBlockNumber?: number
  ethBlockHash?: string
  seedSourceNote?: string
  clickedTimestamp?: string
  finalSeed?: string
  sortedNormalHash?: string
  sortedWinnerHash?: string
  sortedApartmentHash?: string
  assignmentListHash?: string
  resultHash?: string
  failedReason?: string
  lockedAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  participantCount: number
  apartmentCount: number
  resultCount: number
}

export interface LotteryParticipantResponse {
  id: string
  applicationId: string
  lotteryCode: string
  poolType: string
  priorityTags?: string
}

export interface LotteryResultResponse {
  eventId: string
  participantId: string
  lotteryCode: string
  poolType: string
  resultType: string
  normalRandomValue?: string
  winnerUnitHash?: string
  apartmentId?: string
  apartmentCode?: string
  unitRandomValue?: string
  drawOrder?: number
  createdAt: string
}

export interface LotteryVerificationResponse {
  eventId: string
  projectName: string
  algorithmType: string
  participantHash?: string
  apartmentHash?: string
  commitmentHash?: string
  privateSalt?: string
  xsmbDrawDate?: string
  xsmbResult?: string
  ethChainId?: number
  ethBlockNumber?: number
  ethBlockHash?: string
  clickedTimestamp?: string
  finalSeed?: string
  sortedNormalHash?: string
  sortedWinnerHash?: string
  sortedApartmentHash?: string
  assignmentListHash?: string
  resultHash?: string
  participants: LotteryParticipantResponse[]
  apartments: ApartmentUnitResponse[]
  results: LotteryResultResponse[]
}

export interface UserLotterySummaryResponse {
  applicationId?: string
  applicationCode?: string
  applicationStatus?: string
  priorityScore?: number
  priorityCategory?: string
  projectId?: string
  projectName?: string
  eventId?: string
  eventName?: string
  eventStatus?: string
  algorithmType?: string
  lotteryCode?: string
  poolType?: string
  priorityTags?: string
  resultType?: string
  apartmentCode?: string
  drawOrder?: number
  normalRandomValue?: string
  winnerUnitHash?: string
  unitRandomValue?: string
  participantHash?: string
  apartmentHash?: string
  finalSeed?: string
  resultHash?: string
  lockedAt?: string
  startedAt?: string
  completedAt?: string
  createdAt?: string
}

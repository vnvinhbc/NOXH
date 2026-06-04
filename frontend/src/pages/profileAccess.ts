export type ProfileAccessState = {
  canEditProfile: boolean
  canUploadDocuments: boolean
  canSubmitDocuments: boolean
  isReadOnly: boolean
}

export function getProfileAccessState(status?: string): ProfileAccessState {
  const isApproved = ['APPROVED', 'LOTTERY_QUALIFIED'].includes(status || '')
  const isWaitingForReview = ['SUBMITTED', 'UNDER_REVIEW'].includes(status || '')

  if (isApproved || isWaitingForReview) {
    return {
      canEditProfile: false,
      canUploadDocuments: false,
      canSubmitDocuments: false,
      isReadOnly: true,
    }
  }

  return {
    canEditProfile: true,
    canUploadDocuments: true,
    canSubmitDocuments: true,
    isReadOnly: false,
  }
}

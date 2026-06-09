export type AdminOtpEditResult = {
  otp: string[]
  focusIndex: number | null
}

export const ADMIN_OTP_LENGTH = 6

export function createEmptyAdminOtp(length = ADMIN_OTP_LENGTH) {
  return Array.from({ length }, () => '')
}

export function applyAdminOtpInput(currentOtp: string[], index: number, value: string): AdminOtpEditResult {
  const digits = value.replace(/\D/g, '')
  const nextOtp = [...currentOtp]

  if (!digits) {
    nextOtp[index] = ''
    return { otp: nextOtp, focusIndex: index }
  }

  const digitsToApply = digits.slice(0, currentOtp.length - index).split('')
  digitsToApply.forEach((digit, offset) => {
    nextOtp[index + offset] = digit
  })

  const nextFocusIndex = Math.min(index + digitsToApply.length, currentOtp.length - 1)
  return { otp: nextOtp, focusIndex: nextFocusIndex }
}

export function applyAdminOtpBackspace(currentOtp: string[], index: number): AdminOtpEditResult {
  const nextOtp = [...currentOtp]

  if (nextOtp[index]) {
    nextOtp[index] = ''
    return { otp: nextOtp, focusIndex: index }
  }

  const previousIndex = Math.max(index - 1, 0)
  nextOtp[previousIndex] = ''
  return { otp: nextOtp, focusIndex: previousIndex }
}

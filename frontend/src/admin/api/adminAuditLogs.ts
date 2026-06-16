import api from '@/api/axios'
import type { ApiResponse } from '@/types'
import type { AdminLotteryAuditLogResponse } from '@/admin/types'

export const adminAuditLogsApi = {
  getLogs: (eventId?: string) =>
    api.get<ApiResponse<AdminLotteryAuditLogResponse[]>>('/admin/audit-logs', {
      params: eventId ? { eventId } : undefined,
    }),
}

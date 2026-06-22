import { adminApplicationsApi } from '@/admin/api/adminApplications'
import { adminHousingStockApi } from '@/admin/api/adminHousingStock'
import { adminLotteryApi } from '@/admin/api/adminLottery'
import { projectApi } from '@/api/project'

export const adminDashboardApi = {
  getOverview: async () => {
    const [applicationOverview, events, projects] = await Promise.all([
      adminApplicationsApi.getOverview().then((res) => res.data.result),
      adminLotteryApi.getEvents().then((res) => res.data.result || []),
      projectApi.getAll().then((res) => res.data.result || []),
    ])
    const focusProjectId = events[0]?.projectId || projects[0]?.id
    const housingOverview = focusProjectId
      ? await adminHousingStockApi.getOverview(focusProjectId).then((res) => res.data.result)
      : undefined

    return { applicationOverview, events, projects, housingOverview, focusProjectId }
  },
}

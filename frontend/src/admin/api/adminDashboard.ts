import { adminApplicationsApi } from '@/admin/api/adminApplications'
import { adminLotteryApi } from '@/admin/api/adminLottery'
import { projectApi } from '@/api/project'

export const adminDashboardApi = {
  getOverview: async () => {
    const [applications, events, projects] = await Promise.all([
      adminApplicationsApi.getAll().then((res) => res.data.result || []),
      adminLotteryApi.getEvents().then((res) => res.data.result || []),
      projectApi.getAll().then((res) => res.data.result || []),
    ])

    return { applications, events, projects }
  },
}

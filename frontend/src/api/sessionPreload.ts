type QueryKey = readonly string[]
type Prefetch = <T>(queryKey: QueryKey, loader: () => Promise<T>) => Promise<unknown>

export async function preloadUserProgress<TDashboard, TLottery>(
  prefetch: Prefetch,
  loadDashboard: () => Promise<TDashboard>,
  loadLotterySummary: () => Promise<TLottery>
) {
  await Promise.allSettled([
    prefetch(['dashboard'], loadDashboard),
    prefetch(['userLotterySummary'], loadLotterySummary),
  ])
}

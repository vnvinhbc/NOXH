export type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const

export function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize)
  if (totalPages === 0) return 0
  return Math.min(Math.max(page, 0), totalPages - 1)
}

export function getPageItems<T>(items: T[], page: number, pageSize: number) {
  const safePage = clampPage(page, items.length, pageSize)
  const start = safePage * pageSize
  return items.slice(start, start + pageSize)
}

export function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const items: PaginationItem[] = [0]
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages - 2, page + 1)

  if (start > 1) items.push('ellipsis-left')
  for (let index = start; index <= end; index += 1) items.push(index)
  if (end < totalPages - 2) items.push('ellipsis-right')
  items.push(totalPages - 1)

  return items
}

export function getRowNumber(page: number, pageSize: number, index: number) {
  return page * pageSize + index + 1
}

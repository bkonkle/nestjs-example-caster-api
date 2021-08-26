export interface ManyResponse<Entity> {
  data: Entity[]
  count: number
  total: number
  page: number
  pageCount: number
}

export interface PaginationOptions {
  pageSize?: number
  page?: number
  total?: number
}

export const paginateResponse = <Entity>(
  data?: Entity[],
  options: PaginationOptions = {}
): ManyResponse<Entity> => {
  const {pageSize, page: pageOpt, total: totalOpt} = options

  const skip = (pageOpt && pageSize && Math.floor(pageOpt - 1 * pageSize)) || 0

  const count = data?.length || 0
  const pageCount = pageSize && totalOpt && Math.ceil(totalOpt / pageSize)

  const page =
    pageOpt || (skip && pageSize && Math.floor(skip / pageSize) + 1) || 1

  const total =
    totalOpt ||
    count +
      (pageCount || Math.ceil(Math.abs(skip / (pageSize || count)))) *
        (pageSize || count) ||
    count

  return {
    data: data || [],
    count,
    total,
    page,
    pageCount: pageCount || page,
  }
}

export const getOffset = (pageSize?: number, page?: number) => {
  const skip =
    (pageSize && page && page > 1 && (page - 1) * pageSize) || undefined

  return {take: pageSize || undefined, skip}
}

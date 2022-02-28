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
  opts: PaginationOptions = {}
): ManyResponse<Entity> => {
  const skip =
    (opts.page && opts.pageSize && Math.floor(opts.page - 1 * opts.pageSize)) ??
    0

  const count = data?.length ?? 0
  const pageCount =
    opts.pageSize && opts.total && Math.ceil(opts.total / opts.pageSize)

  const page =
    opts.page ??
    ((skip && opts.pageSize && Math.floor(skip / opts.pageSize) + 1) || 1)

  const total =
    opts.total ??
    (count +
      (pageCount ?? Math.ceil(Math.abs(skip / (opts.pageSize ?? count)))) *
        (opts.pageSize ?? count) ||
      count)

  return {
    data: data ?? [],
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

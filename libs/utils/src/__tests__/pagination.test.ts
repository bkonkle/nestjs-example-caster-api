import faker from 'faker'
import {paginateResponse} from '../pagination'

describe('@caster/utils/pagination', () => {
  describe('paginateResponse()', () => {
    it('returns a ManyResponse with the first argument as the "data"', async () => {
      const data = [faker.datatype.uuid(), faker.datatype.uuid()]
      const result = paginateResponse(data)

      expect(result).toEqual({
        data,
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      })
    })

    it('handles page input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {page: 4})

      expect(result).toEqual({
        data,
        count: 1,
        total: 1,
        page: 4,
        pageCount: 4,
      })
    })

    it('handles pageSize input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {pageSize: 20})

      expect(result).toEqual({
        data,
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
      })
    })

    it('handles total input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {total: 200})

      expect(result).toEqual({
        data,
        count: 1,
        total: 200,
        page: 1,
        pageCount: 1,
      })
    })

    it('handles page & pageSize input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {page: 4, pageSize: 20})

      expect(result).toEqual({
        data,
        count: 1,
        total: 21,
        page: 4,
        pageCount: 4,
      })
    })

    it('handles pageSize & total input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {pageSize: 20, total: 80})

      expect(result).toEqual({
        data,
        count: 1,
        total: 80,
        page: 1,
        pageCount: 4,
      })
    })

    it('handles page, pageSize, and total input', async () => {
      const data = [faker.datatype.uuid()]
      const result = paginateResponse(data, {
        page: 2,
        pageSize: 20,
        total: 80,
      })

      expect(result).toEqual({
        data,
        count: 1,
        total: 80,
        page: 2,
        pageCount: 4,
      })
    })

    it('handles empty input', async () => {
      const result = paginateResponse(undefined)

      expect(result).toEqual({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 1,
      })
    })
  })
})

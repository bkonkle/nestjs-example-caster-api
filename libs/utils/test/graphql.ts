import {Application} from 'express'
import supertest from 'supertest'

export class GraphQL {
  constructor(
    private readonly app: Application,
    private readonly endpoint = '/graphql'
  ) {}

  query = async <T>(
    query: string,
    variables?: Record<string, unknown>,
    options: {warn?: boolean; statusCode?: number; token?: string} = {}
  ): Promise<{data: T}> => {
    const {warn = true, statusCode = 200, token} = options

    const test = supertest(this.app).post(this.endpoint)

    if (token) {
      test.set('Authorization', `Bearer ${token}`)
    }

    const response = await test.send({query, variables})

    if (warn && response.body.errors) {
      console.error(
        response.body.errors
          .map((err: {message: string}) => err.message)
          .join('\n\n')
      )
    }

    expect(response.status).toEqual(statusCode)

    return response.body
  }

  mutation = this.query
}

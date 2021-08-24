import {Scalar, CustomScalar} from '@nestjs/graphql'
import GraphQLJSON from 'graphql-type-json'

@Scalar('JSON', (_type) => Object)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class JsonScalar implements CustomScalar<string, any> {
  name = GraphQLJSON.name
  description = GraphQLJSON.description || 'JSON'

  serialize = GraphQLJSON.serialize
  parseValue = GraphQLJSON.parseValue
  parseLiteral = GraphQLJSON.parseLiteral
}

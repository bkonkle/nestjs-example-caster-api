import {NestFactory} from '@nestjs/core'
import {GraphQLSchemaBuilderModule, GraphQLSchemaFactory} from '@nestjs/graphql'
import {printSchema} from 'graphql'
import {writeFile} from 'fs/promises'

import {EpisodesResolver} from '@caster/shows/episodes/episodes.resolver'
import {ShowsResolver} from '@caster/shows/shows.resolver'
import {ProfilesResolver} from '@caster/users/profiles/profiles.resolver'
import {UsersResolver} from '@caster/users/users.resolver'
import {join} from 'path'

const prefix = (
  str: string
) => `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

${str}`

/**
 * Generate the schema.graphql file at the project root.
 */
async function main() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule)
  await app.init()

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory)
  const schema = await gqlSchemaFactory.create([
    UsersResolver,
    ProfilesResolver,
    ShowsResolver,
    EpisodesResolver,
  ])

  await writeFile(
    join(__dirname, '..', '..', '..', 'schema.graphql'),
    prefix(printSchema(schema))
  )
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)

    process.exit(1)
  })
}

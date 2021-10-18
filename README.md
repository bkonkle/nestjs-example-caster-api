# Nest.js Example: Caster API

[<img alt="Node.js" src="https://img.shields.io/badge/node-v14+-brightgreen?logo=node.js&style=flat" />](https://nodejs.org/en/)
[<img alt="TypeScript" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/dev/typescript?logo=typescript&style=flat&color=3178c6" />](https://www.typescriptlang.org/)
[<img alt="GraphQL" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/graphql?logo=graphql&style=flat&color=e10098" />](https://graphql.org/)
[<img alt="Nest.js" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/@nestjs/core?logo=nestjs&style=flat&color=ea2845" />](https://nestjs.com/)
[<img alt="Prisma" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/@prisma/client?logo=prisma&style=flat&color=38a169" />](https://www.prisma.io/)
[<img alt="Socket.io" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/socket.io?logo=socket.io&style=flat&color=25c2a0" />]()
[<img alt="ioredis" src="https://img.shields.io/github/package-json/dependency-version/bkonkle/nestjs-example-caster-api/ioredis?logo=redis&style=flat&color=a51f17" />](https://github.com/luin/ioredis)

This is an example app for the Nest.js Video Series by [Brandon Konkle](https://github.com/bkonkle). It implements a basic API to support a number of hypothetical frontends for the imaginary "Caster" app, a tool to help podcasters, broadcasters, and streamers coordinate show content with their co-hosts and guests. Limited to just the API to support the front end.

## API Features

- Create and log into a user account, and save a personal profile.
- Create a show with episodes.
- Create topics to discuss within an episode.
- Present a live interface highlighting topics and allowing participants to chat.

## Libraries & Tools

- [TypeScript](https://www.typescriptlang.org/)
- [GraphQL](https://graphql.org/)
- [Nest.js](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)
- [ioredis](https://github.com/luin/ioredis)
- [Nx](https://nx.dev/)
- [Casl](https://casl.js.org/)
- [Yarn](https://yarnpkg.com/)

## Local Development

After checking out the repository, install dependencies with [Yarn](https://yarnpkg.com/):

```sh
yarn
```

Then, follow the example in [.env.example](apps/api/.env.example) to create your own `apps/api/.env` file.

### Authentication Setup

Authentication uses a standard OAuth2 JWKS setup that relies on an external identity server to issue and validate tokens. To start off you'll need an OAuth2 endpoint, something like https://my-app.us.auth0.com (if you're using Auth0) or https://mydomain.auth.us-east-1.amazoncognito.com (if you're using AWS Cognito). Set this as the `OAUTH2_URL` variable in your `apps/api/.env`.

Then, set the `OAUTH2_AUDIENCE` to `localhost`, or whatever your authentication provider prefers.

#### Authenticated Integration Tests

For thorough integration testing, a special "test automation" OAuth2 client is used. In some cases this may be a separate client configured through your authentication provider, one that is configured to allow login via the password grant flow using the client id and client secret. In other cases this may be the same as your main client, with settings changed to enable the password grant flow.

Either way, this should not be enabled in your Production environment. The password grant flow should only be used for testing. In Production, your client applications will most likely use the authorization code flow (with a PKCE challenge required for native applications that can't safely store a client secret, and recommended even for applications that can).

Set the client id and secret to `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET` in your `apps/api/.env`.

Finally, create two test users to use with the integration tests. Save their credentials to `TEST_USER`, `TEST_PASS`, `TEST_ALT_USER`, and `TEST_ALT_PASS`. These credentials should _not_ be valid in Production.

### DB Setup

Use `docker-compose` to launch a local Postgres database (and a Redis server) by running:

```sh
nx docker-up
```

Then, run migrations to catch your schema up to the latest:

```sh
nx db-migrate
```

The first time you do this on a fresh database, you should see:

```sh
PostgreSQL database caster created at localhost:1701
```

And finally:

```sh
Your database is now in sync with your schema.
```

### Running the Local Server

Use `nx` to run the server locally:

```sh
nx serve
```

### Running Unit Tests

To test a library with `nx`:

```sh
nx test users
```

To test an individual suite within a library:

```sh
nx test users --testFile users.resolver
```

To test all of the libraries (and apps) together:

```sh
yarn test
```

### Running Integration Tests

To integration test, you need to have the Docker Compose stack with Postgres and Redis running locally, or within your CI pipeline.

To run a single integration suite:

```sh
nx integration --testFile events
```

To run all of the integration tests together:

```sh
yarn integration
```

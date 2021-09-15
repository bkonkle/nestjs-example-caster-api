import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
  providers: [
    Providers.Auth0({
      authorizationUrl: `https://${process.env.OAUTH2_DOMAIN}/authorize?response_type=code&audience=${process.env.OAUTH2_AUDIENCE}`,
      clientId: process.env.OAUTH2_CLIENT_ID || '',
      clientSecret: process.env.OAUTH2_CLIENT_SECRET || '',
      domain: process.env.OAUTH2_DOMAIN || '',
      idToken: true,
    }),
  ],

  jwt: {
    secret: process.env.OAUTH2_JWT_SECRET,
  },

  callbacks: {
    jwt: async (token, _user, account) => {
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }

      return token
    },

    session: async (session, user) => {
      return {
        ...session,
        user: {
          ...session.user,
          sub: user.sub,
        },
      }
    },
  },
})

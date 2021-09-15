import Head from 'next/head'
import React from 'react'
import {AppProps} from 'next/app'
import {Provider} from 'next-auth/client'

export default function NextApp({Component, pageProps}: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Caster</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  )
}

import {ReactNode} from 'react'
import Head from 'next/head'

export interface LayoutProps {
  children: ReactNode
}

export const Layout = (props: LayoutProps) => {
  const {children} = props

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="A demo project" />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            'Caster'
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content="Caster" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div>{children}</div>
    </>
  )
}

export default Layout

import type { AppProps } from 'next/app'
import Head from 'next/head'
import { UserProvider } from '../../../shared/UserProvider'
import NavBar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import AnalyticsTracker from '../components/AnalyticsTracker'
import { Analytics } from '@vercel/analytics/next'
import ScrollToTop from '../components/ScrollToTop'
import '../styles/index.css'
import '../styles/App.css'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const description =
    'Play StrawberryTech mini games to practice AI communication skills.'
  return (
    <>
      <Head>
        <meta name="description" content={description} />
      </Head>
      <UserProvider>
        <ScrollToTop />
        <NavBar />
        <AnalyticsTracker />
        <Component {...pageProps} />
        <Footer />
        <Analytics />
      </UserProvider>
    </>
  )
}

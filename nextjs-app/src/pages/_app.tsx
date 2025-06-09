import type { AppProps } from 'next/app'
import Head from 'next/head'
import { UserProvider } from '../../../shared/UserProvider'
import NavBar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import AnalyticsTracker from '../components/AnalyticsTracker'
import ScrollToTop from '../components/ScrollToTop'
import { Toaster } from 'react-hot-toast'
import '../styles/index.css'
import '../styles/App.css'
import '../app/globals.css'

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
        <Toaster toastOptions={{ ariaProps: { role: 'status', 'aria-live': 'polite' } }} />
        <Footer />
      </UserProvider>
    </>
  )
}

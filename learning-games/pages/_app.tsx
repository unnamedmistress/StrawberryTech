import type { AppProps } from 'next/app'
import { UserProvider } from '../src/context/UserProvider'
import dynamic from 'next/dynamic'
import '../src/index.css'
import '../src/App.css'
import '../src/pages/Home.css'

const Analytics = dynamic(() => import('../src/components/AnalyticsTrackerNext'), { ssr: false })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Analytics />
      <Component {...pageProps} />
    </UserProvider>
  )
}

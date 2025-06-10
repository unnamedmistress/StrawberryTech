import type { AppProps } from 'next/app'
import { UserProvider } from '../../shared/UserProvider'
import dynamic from 'next/dynamic'
import '../src/index.css'
import '../src/App.css'
import '../src/pages/Home.css'

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'

const AnalyticsTrackerDynamic = dynamic(() => import('../src/components/AnalyticsTrackerNext'), { ssr: false })

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <AnalyticsTrackerDynamic />
      <VercelAnalytics />
      <Component {...pageProps} />
    </UserProvider>
  )
}

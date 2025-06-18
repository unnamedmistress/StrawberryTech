import type { AppProps } from 'next/app'
import Head from 'next/head'
import { UserProvider } from '../shared/UserProvider'
import { NotificationProvider } from '../contexts/NotificationContext'
import { ErrorBoundary } from '../../shared/ErrorBoundary'
import ModernNavBar from '../components/layout/ModernNavBar'
import SkipLink from '../components/layout/SkipLink'
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
        <title>StrawberryTech - Master AI Prompting Through Games</title>
        <meta name="description" content={description} />        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ee3a57" />
        
        {/* Comprehensive favicon setup for maximum browser compatibility */}
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
        
        {/* Android icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        {/* SVG favicon for modern browsers */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        
        {/* Fallback for legacy browsers */}
        <link rel="shortcut icon" href="/favicon-32x32.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Safari pinned tab */}
        <link rel="mask-icon" href="/favicon.svg" color="#ee3a57" />        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="StrawberryTech - Master AI Prompting Through Games" />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="StrawberryTech" />        <meta property="og:image" content="https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_20_14%20AM.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:alt" content="StrawberryTech - Learn AI Prompting Skills" />
        <meta property="og:url" content="https://strawberry-tech.vercel.app/" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@strawberrytech" />
        <meta name="twitter:creator" content="@strawberrytech" />
        <meta name="twitter:title" content="StrawberryTech - Master AI Prompting Through Games" />
        <meta name="twitter:description" content={description} />        <meta name="twitter:image" content="https://github.com/unnamedmistress/images/blob/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_20_14%20AM.png" />
        <meta name="twitter:image:alt" content="StrawberryTech - Learn AI Prompting Skills" />
        
        {/* Additional meta tags for better social sharing */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="StrawberryTech" />
        <meta name="keywords" content="AI prompting, artificial intelligence, learning games, prompt engineering, AI skills, interactive learning" /></Head>
      <NotificationProvider>
        <UserProvider>
          <ErrorBoundary>
            <ScrollToTop />
            <SkipLink />
            <ModernNavBar />
            <AnalyticsTracker />
            <Component {...pageProps} />
            <Footer />
            <Analytics />
          </ErrorBoundary>
        </UserProvider>
      </NotificationProvider>
    </>
  )
}

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LeaderboardPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the new combined community page
    router.replace('/community')
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Poppins, sans-serif' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Redirecting to Community...</h2>
        <p>The leaderboard is now part of our community page!</p>
      </div>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Leaderboard | StrawberryTech</title>
      <meta name="description" content="See top points across all games." />
      <link rel="canonical" href="https://strawberrytech.vercel.com/community" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });

import { useRouter } from 'next/router'

export default function ComposeTweetGame() {
  const router = useRouter()

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>Compose Tweet Game</h1>
      <p>This game is coming soon!</p>
      <button 
        onClick={() => router.push('/')}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Back to Home
      </button>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Compose Tweet Game | StrawberryTech</title>
      <meta
        name="description"
        content="Compose Tweet Game - Coming Soon"
      />
    </>
  )
}

import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h2>Page Not Found</h2>
      <img
        src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
        className="brand-logo"
        style={{ width: '48px' }}
      />
      <p>Sorry, we couldn't find that page.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Page Not Found | StrawberryTech</title>
      <meta name="description" content="The page you requested could not be found." />
    </>
  )
}

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="legal-page">
      <h2>Contact Us</h2>
      <p>Email questions to example@strawberry-tech.test.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Contact Us | StrawberryTech</title>
      <meta name="description" content="Get in touch with the StrawberryTech team." />
    </>
  )
}

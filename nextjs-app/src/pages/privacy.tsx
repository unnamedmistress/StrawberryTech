import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h2>Privacy Policy</h2>
      <img
        src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
        className="brand-logo"
        style={{ width: '48px' }}
      />
      <p>This demo app stores your progress locally in your browser and does not share personal data.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/">Return Home</Link>
      </p>
    </div>
  )
}

export function Head() {
  return (
    <>
      <title>Privacy Policy | StrawberryTech</title>
      <meta name="description" content="Learn how StrawberryTech handles your data." />
      <link rel="canonical" href="https://strawberrytech.com/privacy" />
    </>
  )
}

export const getStaticProps = async () => ({ props: {} });

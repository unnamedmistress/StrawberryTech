import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h2>Privacy Policy</h2>
      <p>This demo app stores your progress locally in your browser and does not share personal data.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

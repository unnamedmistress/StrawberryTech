import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h2>Privacy Policy</h2>
      <img
        src="https://media.giphy.com/media/13gvXfEVlxQjDO/giphy.gif"
        alt="Lock animation"
        style={{ width: '120px', marginBottom: '1rem' }}
      />
      <p>This demo app stores your progress locally in your browser and does not share personal data.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

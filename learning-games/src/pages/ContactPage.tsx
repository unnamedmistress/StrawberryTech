import { Link } from 'react-router-dom'

export default function ContactPage() {
  return (
    <div className="legal-page">
      <h2>Contact Us</h2>
      <p>Email questions to example@strawberry-tech.test.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

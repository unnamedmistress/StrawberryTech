import { Link } from 'react-router-dom'

export default function ContactPage() {
  return (
    <div className="legal-page">
      <h2>Contact Us</h2>
      <img
        src="https://media.giphy.com/media/9uo3ZSXAE0zHy/giphy.gif"
        alt="Email animation"
        style={{ width: '120px', marginBottom: '1rem' }}
      />
      <p>Email questions to example@strawberry-tech.test.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

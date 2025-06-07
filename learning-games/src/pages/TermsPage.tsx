import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="legal-page">
      <h2>Terms of Service</h2>
      <img
        src="https://media.giphy.com/media/26u4nJPf0JtQPdStq/giphy.gif"
        alt="Document animation"
        style={{ width: '120px', marginBottom: '1rem' }}
      />
      <p>Use these mini games for educational purposes only. No warranty is provided.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div id="main-content" className="legal-page">
      <h2>Terms of Service</h2>
      <img
        src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
        className="brand-logo"
        style={{ width: '48px' }}
      />
      <p>Use these mini games for educational purposes only. No warranty is provided.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

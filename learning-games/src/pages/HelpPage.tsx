import { Link } from 'react-router-dom'

export default function HelpPage() {
  return (
    <div className="help-page">
      <h2>How to Play</h2>
      <img
        src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
        alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
        className="brand-logo"
        style={{ width: '48px' }}
      />
      <p>Choose a game from the home page and follow the on-screen instructions. Earn points and badges as you progress!</p>
      <p>If you run into issues, feel free to <Link to="/contact">reach out</Link>.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

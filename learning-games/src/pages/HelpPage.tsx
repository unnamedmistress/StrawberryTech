import { Link } from 'react-router-dom'

export default function HelpPage() {
  return (
    <div className="help-page">
      <h2>How to Play</h2>
      <p>Choose a game from the home page and follow the on-screen instructions. Earn points and badges as you progress!</p>
      <p>If you run into issues, feel free to <Link to="/contact">reach out</Link>.</p>
      <p style={{ marginTop: '2rem' }}>
        <Link to="/">Return Home</Link>
      </p>
    </div>
  )
}

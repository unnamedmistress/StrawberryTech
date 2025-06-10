import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="brand">
          <img
            src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%207%2C%202025%2C%2007_12_36%20PM.png"
            alt="Home page strawberry mascot welcomes players at entrance of learning arcade with pastel tones."
            className="brand-logo"
          />
          <span>&copy; {year} StrawberryTech</span>
        </div>
        <nav className="footer-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <a
          className="coffee-link"
          href="https://coff.ee/strawberrytech"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕️ Buy me a coffee
        </a>
      </div>
    </footer>
  )
}

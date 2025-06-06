export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="brand">
        <img
          src="https://raw.githubusercontent.com/unnamedmistress/images/main/ChatGPT%20Image%20Jun%206%2C%202025%2C%2011_24_31%20AM.png"
          alt="Strawberry logo"
          className="brand-logo"
        />
        <span>&copy; {year} StrawberryTech</span>
      </div>
      <div className="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  )
}

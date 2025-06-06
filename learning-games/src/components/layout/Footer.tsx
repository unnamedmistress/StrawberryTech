export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div>&copy; {year} StrawberryTech</div>
      <div className="footer-links">
        <a href="/privacy">Privacy Policy</a> |{' '}
        <a href="/terms">Terms of Service</a> |{' '}
        <a href="/contact">Contact</a>
      </div>
    </footer>
  )
}

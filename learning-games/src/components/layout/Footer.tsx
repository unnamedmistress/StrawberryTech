export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div>&copy; {year} StrawberryTech</div>
      <div className="footer-links">
        <a href="#">Privacy Policy</a> |{' '}
        <a href="#">Terms of Service</a> |{' '}
        <a href="#">Contact</a>
      </div>
    </footer>
  )
}

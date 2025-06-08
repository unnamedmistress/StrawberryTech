import React from 'react'
import './NavBarSimple.css'

export interface NavLink {
  label: string
  href: string
}

interface NavBarSimpleProps {
  logoSrc: string
  logoAlt: string
  links: NavLink[]
  onSurpriseHover?: () => void
}

const NavBarSimple: React.FC<NavBarSimpleProps> = ({
  logoSrc,
  logoAlt,
  links,
  onSurpriseHover,
}) => {
  return (
    <nav className="navbar-simple" role="navigation" aria-label="Main navigation">
      <div className="navbar-logo">
        <img src={logoSrc} alt={logoAlt} />
      </div>
      <ul className="navbar-links">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a href={href} onMouseOver={onSurpriseHover}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBarSimple

import React from 'react'
import styles from './NavBarSimple.module.css'

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
    <nav className={styles['navbar-simple']} role="navigation" aria-label="Main navigation">
      <div className={styles['navbar-logo']}>
        <img src={logoSrc} alt={logoAlt} />
      </div>
      <ul className={styles['navbar-links']}>
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

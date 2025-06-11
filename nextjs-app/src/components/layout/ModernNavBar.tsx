import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from './ModernNavBar.module.css'

interface NavItem {
  label: string
  href?: string
  children?: NavItem[]
  icon?: string
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠' },
  {
    label: 'Games',
    icon: '🎮',
    children: [
      { label: 'Tone Game', href: '/games/tone', icon: '🎭' },
      { label: 'Hallucination Quiz', href: '/games/quiz', icon: '🧠' },
      { label: 'Escape Room', href: '/games/escape', icon: '🚪' },
      { label: 'Prompt Builder', href: '/games/recipe', icon: '📝' },
      { label: 'Prompt Darts', href: '/games/darts', icon: '🎯' },
      { label: 'Compose Tweet', href: '/games/compose', icon: '🐦' },
    ],
  },
  {
    label: 'Progress',
    icon: '📊',
    children: [
      { label: 'Community & Progress', href: '/community', icon: '👥' },
      { label: 'Badges', href: '/badges', icon: '🏆' },
    ],
  },
  {
    label: 'Account',
    icon: '👤',
    children: [
      { label: 'Profile', href: '/profile', icon: '⚙️' },
      { label: 'Help', href: '/help', icon: '❓' },
    ],
  },
  {
    label: 'Community',
    icon: '🌟',
    children: [
      { label: 'Community Home', href: '/community', icon: '🏘️' },
      { label: 'Prompt Library', href: '/prompt-library', icon: '📚' },
    ],
  },
]

export default function ModernNavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setIsOpen(false)
      }
    }

    // Prevent body scroll when mobile menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Clean up body styles
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  const handleDropdownEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const handleMobileMenuToggle = () => {
    setIsOpen(!isOpen)
    setActiveDropdown(null)
  }

  const handleMobileDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
    setActiveDropdown(null)
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  return (
    <nav
      ref={navRef}
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.navContainer}>        {/* Brand */}
        <Link href="/" className={styles.brand} onClick={handleLinkClick}>
          <Image
            src="/favicon-32x32.png"
            alt="StrawberryTech Logo"
            width={40}
            height={40}
            className={styles.brandLogo}
            priority
            unoptimized
          />
          <span className={styles.brandText}>StrawberryTech</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={styles.navItem}
              onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
              onMouseLeave={() => item.children && handleDropdownLeave()}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <button
                  className={`${styles.navButton} ${
                    activeDropdown === item.label ? styles.active : ''
                  }`}
                  aria-expanded={activeDropdown === item.label}
                  aria-haspopup="true"
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                  <span className={styles.chevron}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              )}

              {/* Desktop Dropdown */}
              {item.children && (
                <div
                  className={`${styles.dropdown} ${
                    activeDropdown === item.label ? styles.open : ''
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href!}
                      className={`${styles.dropdownLink} ${
                        isActive(child.href!) ? styles.active : ''
                      }`}
                      onClick={handleLinkClick}
                    >
                      <span className={styles.dropdownIcon}>{child.icon}</span>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuButton} ${isOpen ? styles.open : ''}`}
          onClick={handleMobileMenuToggle}
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`${styles.mobileNav} ${isOpen ? styles.open : ''}`}>
          <div className={styles.mobileNavContent}>
            {navItems.map((item) => (
              <div key={item.label} className={styles.mobileNavItem}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`${styles.mobileNavLink} ${
                      isActive(item.href) ? styles.active : ''
                    }`}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className={`${styles.mobileNavButton} ${
                        activeDropdown === item.label ? styles.active : ''
                      }`}
                      onClick={() => handleMobileDropdownToggle(item.label)}
                      aria-expanded={activeDropdown === item.label}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      {item.label}
                      <span className={`${styles.chevron} ${
                        activeDropdown === item.label ? styles.rotated : ''
                      }`}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    
                    {/* Mobile Dropdown */}
                    {item.children && (
                      <div
                        className={`${styles.mobileDropdown} ${
                          activeDropdown === item.label ? styles.open : ''
                        }`}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href!}
                            className={`${styles.mobileDropdownLink} ${
                              isActive(child.href!) ? styles.active : ''
                            }`}
                            onClick={handleLinkClick}
                          >
                            <span className={styles.dropdownIcon}>{child.icon}</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
      </div>
    </nav>
  )
}

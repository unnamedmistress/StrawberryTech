import { useEffect, useState } from 'react'

const STORAGE_KEY = 'strawberrytech_contrast'

export default function ThemeToggle() {
  const [enabled, setEnabled] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    document.body.classList.toggle('high-contrast', enabled)
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }, [enabled])

  return (
    <button
      className="theme-toggle"
      aria-label="Toggle high contrast mode"
      onClick={() => setEnabled(v => !v)}
    >
      <span aria-hidden="true">{enabled ? '🔲' : '🔳'}</span>
    </button>
  )
}


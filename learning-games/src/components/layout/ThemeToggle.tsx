import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('high-contrast', enabled)
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


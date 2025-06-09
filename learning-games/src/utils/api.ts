export function getApiBase() {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE
  return ''
}

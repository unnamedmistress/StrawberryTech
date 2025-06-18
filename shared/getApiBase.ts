export function getApiBase(): string {
  // Use browser env variables when available
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_BASE) {
      return process.env.NEXT_PUBLIC_API_BASE
    }
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) {
      return (import.meta as any).env.VITE_API_BASE as string
    }
    return ''
  }

  // Server-side: prefer development env var
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE
  }
  return ''
}

export function getApiBase() {
  // In production, use empty string for relative URLs
  // In development, use the full URL if provided
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs for same-origin requests
    return ''
  }
  // Server-side: use environment variable if available
  return process.env.NEXT_PUBLIC_API_BASE || ''
}

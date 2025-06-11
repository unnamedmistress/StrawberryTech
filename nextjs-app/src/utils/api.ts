export function getApiBase() {
  // In production, always use empty string for relative URLs to use Next.js API routes
  if (process.env.NODE_ENV === 'production') {
    return ''
  }
  
  // In development, use the full URL if provided for external server
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs for same-origin requests in production
    return process.env.NODE_ENV === 'development' ? (process.env.NEXT_PUBLIC_API_BASE || '') : ''
  }
  
  // Server-side: use environment variable only in development
  return process.env.NODE_ENV === 'development' ? (process.env.NEXT_PUBLIC_API_BASE || '') : ''
}

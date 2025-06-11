import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const debugInfo = {
      method: req.method,
      hasFirebaseEnv: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      hasGoogleCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      nodeEnv: process.env.NODE_ENV,
      ip: (req as any).ip,
      xForwardedFor: req.headers['x-forwarded-for'],
      xRealIp: req.headers['x-real-ip'],
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    }
    
    res.status(200).json(debugInfo)
  } catch (error) {
    res.status(500).json({ 
      error: 'Debug endpoint error', 
      message: (error as Error).message 
    })
  }
}

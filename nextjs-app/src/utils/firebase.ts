import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

let serviceAccount: any
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS
if (typeof console !== 'undefined') {
  if (envCred) {
    const display = envCred.length > 100 ? envCred.slice(0, 100) + '...' : envCred
    console.log('FIREBASE_SERVICE_ACCOUNT loaded:', display)
  } else {
    console.log('FIREBASE_SERVICE_ACCOUNT not set')
  }
}
if (envCred) {
  try {
    if (envCred.trim().startsWith('{')) {
      serviceAccount = JSON.parse(envCred)
    } else {
      const filePath = path.isAbsolute(envCred)
        ? envCred
        : path.join(process.cwd(), envCred)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      serviceAccount = JSON.parse(fileContent)
    }
  } catch (err) {
    console.error('Failed to load Firebase credentials', err)
  }
}

if (!admin.apps.length) {
  admin.initializeApp(
    serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {}
  )
}

export default admin.firestore()

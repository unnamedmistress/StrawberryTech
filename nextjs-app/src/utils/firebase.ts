import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

let serviceAccount: any
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS
if (envCred) {
  try {
    let trimmed = envCred.trim()
    // .env parsers may wrap JSON in quotes. Remove them if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      trimmed = trimmed.slice(1, -1)
    }
    if (trimmed.startsWith('{')) {
      serviceAccount = JSON.parse(trimmed)
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

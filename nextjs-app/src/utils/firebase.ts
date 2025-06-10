import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

let serviceAccount: any
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS
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

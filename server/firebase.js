const admin = require('firebase-admin');
const path = require('path');

let firestore = null;
let serviceAccount;
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (envCred) {
  try {
    let trimmed = envCred.trim();
    // .env parsers may wrap JSON in quotes. Remove them if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      trimmed = trimmed.slice(1, -1);
    }
    if (trimmed.startsWith('{')) {
      serviceAccount = JSON.parse(trimmed);
    } else {
      const filePath = path.isAbsolute(envCred) ? envCred : path.join(__dirname, envCred);
      serviceAccount = require(filePath);
    }
  } catch (err) {
    console.error('Failed to load Firebase credentials', err);
  }
}

try {
  if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      console.warn('Firebase credentials not supplied; Firestore disabled.');
      module.exports = null;
      return;
    }
  }
  firestore = admin.firestore();
} catch (err) {
  console.error('Failed to initialize Firebase', err);
  firestore = null;
}

module.exports = firestore;

const admin = require('firebase-admin');
const path = require('path');

let firestore = null;
let serviceAccount;
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (envCred) {
  const display = envCred.length > 100 ? envCred.slice(0, 100) + '...' : envCred;
  console.log('FIREBASE_SERVICE_ACCOUNT loaded:', display);
} else {
  console.log('FIREBASE_SERVICE_ACCOUNT not set');
}
if (envCred) {
  try {
    if (envCred.trim().startsWith('{')) {
      serviceAccount = JSON.parse(envCred);
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

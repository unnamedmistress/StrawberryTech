const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
const envCred = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS;
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

if (!admin.apps.length) {
  admin.initializeApp(serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : {});
}

module.exports = admin.firestore();

const admin = require('firebase-admin');

// Initialize Firebase Admin
// On Google Cloud (Firebase Functions), credentials are auto-detected.
// On external platforms (Vercel, Render), pass FIREBASE_SERVICE_ACCOUNT env var
// containing the JSON service account key as a stringified JSON.
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    // External deployment (Vercel, Render, etc.)
    const parsed = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
      projectId: parsed.project_id,
    });
  } else {
    // Local dev or Google Cloud — uses Application Default Credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'crownridge-ai-delay',
    });
  }
}

const db = admin.firestore();

module.exports = { admin, db };

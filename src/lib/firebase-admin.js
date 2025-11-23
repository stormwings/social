import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // Guard against missing SERVICE_ACCOUNT during build
    const serviceAccount = process.env.SERVICE_ACCOUNT;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } else {
      // Initialize with minimal config for build phase
      admin.initializeApp({
        projectId: 'placeholder-project-id',
      });
    }
}

export default admin;
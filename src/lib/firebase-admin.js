import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
    });
}

export default admin;
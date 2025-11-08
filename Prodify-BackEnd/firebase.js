// firebase.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function initFromServiceAccountObject() {
  const required = [
    'TYPE',
    'PROJECT_ID',
    'PRIVATE_KEY_ID',
    'PRIVATE_KEY',
    'CLIENT_EMAIL',
    'CLIENT_ID',
    'AUTH_URI',
    'TOKEN_URI',
    'AUTH_PROVIDER_X509_CERT_URL',
    'CLIENT_X509_CERT_URL'
  ];
  const missing = required.filter((k) => !process.env[k] || process.env[k].length === 0);
  if (missing.length > 0) {
    return false;
  }
  const privateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;
  const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
  };
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return true;
}

function initFromCredentialsFile() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) return false;
  const absPath = path.isAbsolute(credPath) ? credPath : path.join(__dirname, credPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`GOOGLE_APPLICATION_CREDENTIALS not found at: ${absPath}`);
  }
  const json = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(json) });
  return true;
}

if (!admin.apps.length) {
  const ok = initFromCredentialsFile() || initFromServiceAccountObject();
  if (!ok) {
    throw new Error('Firebase credentials missing. Provide GOOGLE_APPLICATION_CREDENTIALS or individual env vars.');
  }
}

const db = admin.firestore();
module.exports = db;

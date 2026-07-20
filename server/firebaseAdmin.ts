/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

let app: App;
let configData: any = {};
let dbInstance: any;
let bucketInstance: any;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e: any) {
  console.warn('[FirebaseAdmin] Warning reading firebase-applet-config.json:', e.message);
}

// Allow environment variables to override or provide the config settings
const projectId = process.env.FIREBASE_PROJECT_ID || configData.projectId;
const firestoreDatabaseId = process.env.FIREBASE_DATABASE_ID || configData.firestoreDatabaseId;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || configData.storageBucket;

try {
  if (projectId) {
    // Modern Firebase Admin App initialization
    app = initializeApp({
      projectId,
      storageBucket
    });
    
    // Access database specifically with the custom databaseId
    dbInstance = getFirestore(app, firestoreDatabaseId || undefined);
    bucketInstance = getStorage(app).bucket(storageBucket || undefined);
    
    console.log('[FirebaseAdmin] Successfully initialized modular Firebase Admin SDK.', {
      projectId,
      databaseId: firestoreDatabaseId,
      storageBucket
    });
  } else {
    app = initializeApp();
    dbInstance = getFirestore(app);
    bucketInstance = getStorage(app).bucket();
    console.log('[FirebaseAdmin] Initialized modular Firebase Admin SDK with Default Application Credentials.');
  }
} catch (e: any) {
  console.warn('[FirebaseAdmin] Warning during initializeApp, retrying with defaults:', e.message);
  try {
    app = initializeApp();
    dbInstance = getFirestore(app);
    bucketInstance = getStorage(app).bucket();
  } catch (error: any) {
    console.error('[FirebaseAdmin] Critical: Firebase admin initialization failed:', error.message);
  }
}

export const db = dbInstance;
export const bucket = bucketInstance;

// Validate connection asynchronously to avoid blocking the server start
if (db) {
  db.collection('reports').limit(1).get()
    .then(() => {
      console.log('[FirebaseAdmin] Firestore connection verified successfully.');
    })
    .catch((err: any) => {
      console.error('[FirebaseAdmin] Firestore initial check failed:', err.message);
    });
}

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
    
    // Modern Firebase Admin App initialization
    app = initializeApp({
      projectId: configData.projectId,
      storageBucket: configData.storageBucket
    });
    
    // Access database specifically with the custom databaseId provisioned in AI Studio
    dbInstance = getFirestore(app, configData.firestoreDatabaseId);
    bucketInstance = getStorage(app).bucket(configData.storageBucket);
    
    console.log('[FirebaseAdmin] Successfully initialized modular Firebase Admin SDK.', {
      projectId: configData.projectId,
      databaseId: configData.firestoreDatabaseId,
      storageBucket: configData.storageBucket
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

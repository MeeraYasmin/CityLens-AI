/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { storageService } from '../services/StorageService';
import fs from 'fs';
import path from 'path';

const router = Router();

// Reports CRUD
router.get('/reports', ReportController.getReports);
router.post('/reports', ReportController.createReport);
router.get('/reports/nearby', ReportController.getNearbyReports);
router.get('/reports/:id', ReportController.getReportById);
router.patch('/reports/:id/status', ReportController.updateReportStatus);
router.patch('/reports/:id', ReportController.patchReport);
router.delete('/reports/:id', ReportController.deleteReport);

// Upvote & Toggle endpoints
router.post('/reports/:id/upvote', ReportController.toggleUpvote);
router.patch('/reports/:id/action-items/:itemId', ReportController.toggleActionItem);

// Reverse Geocoding Proxy
router.post('/geocode/reverse', ReportController.reverseGeocode);

// Firebase configuration exposure for client SDK initialization
router.get('/firebase-config', (req, res) => {
  try {
    let configData: any = {};
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Allow secure environment variables to override or dynamically specify Firebase config
    const finalConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || configData.projectId || '',
      appId: process.env.FIREBASE_APP_ID || configData.appId || '',
      apiKey: process.env.FIREBASE_API_KEY || configData.apiKey || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || configData.authDomain || '',
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || configData.firestoreDatabaseId || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || configData.storageBucket || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || configData.messagingSenderId || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || configData.measurementId || '',
      oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || configData.oAuthClientId || '',
      recaptchaSiteKey: process.env.FIREBASE_RECAPTCHA_SITE_KEY || configData.recaptchaSiteKey || ''
    };

    if (!finalConfig.projectId) {
      return res.status(404).json({ error: 'Firebase configuration not found. Please provide firebase-applet-config.json or define environment variables.' });
    }

    return res.json(finalConfig);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Local Binary Media Storage Server
router.get('/storage/:id', (req, res) => {
  const file = storageService.getFile(req.params.id);
  if (!file) {
    return res.status(404).send('Stored media file not found');
  }
  res.setHeader('Content-Type', file.mimeType);
  return res.send(file.buffer);
});

export default router;

  res.setHeader('Content-Type', file.mimeType);
  return res.send(file.buffer);
});

export default router;

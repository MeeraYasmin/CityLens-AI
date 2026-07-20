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
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return res.json(configData);
    } else {
      return res.status(404).json({ error: 'Config file not found' });
    }
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

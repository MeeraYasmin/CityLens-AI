/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/DatabaseService';
import { aiOrchestrator } from '../services/AiOrchestrator';
import { mapsService } from '../services/MapsService';
import { storageService } from '../services/StorageService';
import { ProcessedIncidentReport } from '../../src/types';

export class ReportController {
  /**
   * Fetch all reports, ordered by date descending
   */
  public static async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[ReportController] Fetching all reports');
      const reports = await databaseService.getReports();
      return res.status(200).json(reports);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetch a single report by ID
   */
  public static async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`[ReportController] Fetching report: ${id}`);
      const report = await databaseService.getReportById(id);
      
      if (!report) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      return res.status(200).json(report);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create and analyze a new report
   */
  public static async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { description, imageBase64, coordinates, customAddress } = req.body;

      if (!description || !coordinates || coordinates.lat === undefined || coordinates.lng === undefined) {
        return res.status(400).json({ error: { message: 'Missing required description or coordinates parameters', statusCode: 400 } });
      }

      console.log(`[ReportController] Triggering pipeline for new incident. Coordinates: ${coordinates.lat}, ${coordinates.lng}`);

      // 1. Resolve / Verify Address via MapsService
      let resolvedAddress = customAddress || '';
      if (!resolvedAddress) {
        resolvedAddress = await mapsService.reverseGeocode(coordinates.lat, coordinates.lng);
      }

      // 2. Upload photo if uploaded, generating internal storage URL
      let storedImageUrl: string | null = null;
      if (imageBase64) {
        console.log('[ReportController] Storing incoming photographic evidence');
        storedImageUrl = await storageService.uploadFile(imageBase64, 'citizen_evidence.jpg');
      }

      // 3. Trigger Gemini Multimodal Reasoning Or rules engine fallback
      console.log('[ReportController] Dispatching to AI Orchestrator');
      const aiAnalysis = await aiOrchestrator.analyzeIncident(
        description,
        imageBase64 || null,
        resolvedAddress,
        coordinates
      );

      // 4. Formulate the incident report record matching the exact frontend contracts
      const incidentId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReport: ProcessedIncidentReport = {
        id: incidentId,
        createdAt: new Date().toISOString(),
        draft: {
          imagePreviewUrl: storedImageUrl,
          description,
          coordinates,
          resolvedAddress,
        },
        aiAnalysis: {
          category: aiAnalysis.category,
          categoryConfidence: aiAnalysis.categoryConfidence,
          severity: aiAnalysis.severity,
          severityConfidence: aiAnalysis.severityConfidence,
          severityReasoning: aiAnalysis.severityReasoning,
          assignedDepartment: aiAnalysis.assignedDepartment,
          repairPriority: aiAnalysis.repairPriority,
          immediateActions: aiAnalysis.immediateActions,
          inspectNearbyInfrastructure: aiAnalysis.inspectNearbyInfrastructure,
          nearbyInfrastructureRecommendation: aiAnalysis.nearbyInfrastructureRecommendation,
          uncertaintyFlags: aiAnalysis.uncertaintyFlags,
          structuredJson: JSON.stringify(
            {
              id: incidentId,
              source: 'CityLens AI Pipeline v2.5',
              timestamp: new Date().toISOString(),
              coordinates,
              category: aiAnalysis.category,
              severity: aiAnalysis.severity,
              department: aiAnalysis.assignedDepartment,
              repairPriority: aiAnalysis.repairPriority,
              immediateActions: aiAnalysis.immediateActions,
              inspectNearby: aiAnalysis.inspectNearbyInfrastructure,
              uncertaintyFlags: aiAnalysis.uncertaintyFlags,
            },
            null,
            2
          ),
        },
        status: 'SUBMITTED',
        actionItems: aiAnalysis.immediateActions.map((act, index) => ({
          id: `act-${index}`,
          label: act,
          completed: false,
        })),
        voterCount: 0,
        hasVoted: false,
      };

      await databaseService.createReport(newReport);
      console.log(`[ReportController] Created and dispatched report successfully: ${incidentId}`);
      return res.status(201).json(newReport);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get reports nearby a coordinate point
   */
  public static async getNearbyReports(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat((req.query.radiusKm as string) || '5');

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: { message: 'lat and lng query parameters must be numbers', statusCode: 400 } });
      }

      console.log(`[ReportController] Searching reports within ${radius}km of Lat: ${lat}, Lng: ${lng}`);
      const nearby = await databaseService.getNearbyReports(lat, lng, radius);
      return res.status(200).json(nearby);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update report status
   */
  public static async updateReportStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: { message: 'status parameter is required', statusCode: 400 } });
      }

      console.log(`[ReportController] Updating status of report ${id} to ${status}`);
      const updated = await databaseService.updateReport(id, { status });

      if (!updated) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle generic patch updates (upvoting, toggle items, general overrides)
   */
  public static async patchReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`[ReportController] Patching report ${id} fields:`, Object.keys(req.body));
      
      const updated = await databaseService.updateReport(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle a specific action item checklist inside a report
   */
  public static async toggleActionItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = req.params;
      console.log(`[ReportController] Toggling action item ${itemId} inside report ${id}`);
      const report = await databaseService.getReportById(id);

      if (!report) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      const updatedActionItems = report.actionItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      const updated = await databaseService.updateReport(id, { actionItems: updatedActionItems });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Upvote/Downvote report
   */
  public static async toggleUpvote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`[ReportController] Registering vote toggle for report ${id}`);
      const report = await databaseService.getReportById(id);

      if (!report) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      const hasVoted = !report.hasVoted;
      const voterCount = hasVoted ? report.voterCount + 1 : Math.max(0, report.voterCount - 1);

      const updated = await databaseService.updateReport(id, { hasVoted, voterCount });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete report
   */
  public static async deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log(`[ReportController] Deleting report ${id}`);
      const success = await databaseService.deleteReport(id);

      if (!success) {
        return res.status(404).json({ error: { message: 'Report not found', statusCode: 404 } });
      }

      return res.status(200).json({ success: true, message: `Report ${id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Endpoint exposing reverse geocoding via Google Maps orFallback
   */
  public static async reverseGeocode(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = req.body;
      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: { message: 'Missing lat or lng coordinates', statusCode: 400 } });
      }

      console.log(`[ReportController] Geocoding Lat: ${lat}, Lng: ${lng}`);
      const address = await mapsService.reverseGeocode(lat, lng);
      return res.status(200).json({ address });
    } catch (err) {
      next(err);
    }
  }
}

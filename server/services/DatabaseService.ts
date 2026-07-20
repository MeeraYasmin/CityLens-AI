/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessedIncidentReport } from '../../src/types';
import { db } from '../firebaseAdmin';

// Let's seed highly realistic mock data so the database is alive from day one!
const INITIAL_SEED_REPORTS: ProcessedIncidentReport[] = [
  {
    id: 'INC-882411',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    draft: {
      imagePreviewUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop', // beautiful road pothole
      description: 'Large crater-style pothole near the bike lane on 5th and Main. It is causing cars to swerve into oncoming traffic and poses severe risk to cyclists.',
      coordinates: { lat: 40.7128, lng: -74.006 },
      resolvedAddress: '801 Main Street, Civic Core Sector, Metroville',
    },
    aiAnalysis: {
      category: 'ROAD_SURFACE',
      categoryConfidence: 0.96,
      severity: 'CRITICAL',
      severityConfidence: 0.98,
      severityReasoning: 'Proximity to primary bicycle lane and reports of vehicular swerving into opposing lanes indicates extremely high accident probability. Urgency level 1 requested.',
      assignedDepartment: 'Department of Public Works (Street Maintenance)',
      repairPriority: 1,
      immediateActions: [
        'Dispatch maintenance team to erect emergency safety cones and barricades.',
        'Place temporary cold-mix asphalt patch within 4 hours.',
        'Schedule permanent heavy milling and repaving in the weekly queue.'
      ],
      inspectNearbyInfrastructure: true,
      nearbyInfrastructureRecommendation: 'Examine adjacent storm water drainage grate #A-22 to evaluate underlying asphalt erosion.',
      uncertaintyFlags: [],
      structuredJson: JSON.stringify({
        id: 'INC-882411',
        source: 'CityLens AI Pipeline v2.1',
        category: 'ROAD_SURFACE',
        severity: 'CRITICAL',
        assignedDepartment: 'Department of Public Works (Street Maintenance)',
        repairPriority: 1,
        inspectNearby: true,
        uncertaintyFlags: []
      }, null, 2),
    },
    status: 'DISPATCHED',
    actionItems: [
      { id: 'act-0', label: 'Dispatch maintenance team to erect emergency safety cones and barricades.', completed: true },
      { id: 'act-1', label: 'Place temporary cold-mix asphalt patch within 4 hours.', completed: false },
      { id: 'act-2', label: 'Schedule permanent heavy milling and repaving in the weekly queue.', completed: false }
    ],
    voterCount: 14,
    hasVoted: false,
  },
  {
    id: 'INC-394012',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    draft: {
      imagePreviewUrl: null, // No image evidence
      description: 'Streetlight is completely dead near the playground. The entire cul-de-sac is pitch black at night, causing parents to feel unsafe walking home.',
      coordinates: { lat: 40.7194, lng: -74.0125 },
      resolvedAddress: '224 Whispering Pines Dr, Westside Residential Sector',
    },
    aiAnalysis: {
      category: 'STREET_LIGHT',
      categoryConfidence: 0.94,
      severity: 'HIGH',
      severityConfidence: 0.89,
      severityReasoning: 'Total illumination failure situated next to a child playground facility. Promotes security vulnerability and restricts standard pedestrian visual awareness.',
      assignedDepartment: 'Municipal Utility Board (Electrical & Illumination)',
      repairPriority: 2,
      immediateActions: [
        'Deploy electrical repair bucket truck to inspect luminaire wiring.',
        'Replace burned out high-pressure sodium bulb with modern LED luminaire.',
        'Test automated photocell control sensor.'
      ],
      inspectNearbyInfrastructure: true,
      nearbyInfrastructureRecommendation: 'Inspect adjacent line breaker nodes to check if a circuit surge caused multi-lamp blackout.',
      uncertaintyFlags: ['Wiring fault vs simple bulb failure cannot be determined without physical circuit meter test.'],
      structuredJson: JSON.stringify({
        id: 'INC-394012',
        source: 'CityLens AI Pipeline v2.1',
        category: 'STREET_LIGHT',
        severity: 'HIGH',
        assignedDepartment: 'Municipal Utility Board (Electrical & Illumination)',
        repairPriority: 2,
        inspectNearby: true,
        uncertaintyFlags: ['Wiring fault vs bulb failure unconfirmed.']
      }, null, 2),
    },
    status: 'SUBMITTED',
    actionItems: [
      { id: 'act-0', label: 'Deploy electrical repair bucket truck to inspect luminaire wiring.', completed: false },
      { id: 'act-1', label: 'Replace burned out high-pressure sodium bulb with modern LED luminaire.', completed: false },
      { id: 'act-2', label: 'Test automated photocell control sensor.', completed: false }
    ],
    voterCount: 6,
    hasVoted: false,
  },
  {
    id: 'INC-224591',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    draft: {
      imagePreviewUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop', // water leak / road construction
      description: 'Clean water is gushing like a small fountain from cracks in the sidewalk near the fire hydrant. It is flooding the gutter.',
      coordinates: { lat: 40.7081, lng: -74.0012 },
      resolvedAddress: '45 Commerce St, Eastside Industrial Hub',
    },
    aiAnalysis: {
      category: 'WATER_SEWER',
      categoryConfidence: 0.98,
      severity: 'CRITICAL',
      severityConfidence: 0.95,
      severityReasoning: 'Pressurized flow of potable water indicates high-velocity main break. Poses high risk of underground sub-base washout and sidewalk structural collapse.',
      assignedDepartment: 'Water & Sanitary Sewer Authority (Emergency)',
      repairPriority: 1,
      immediateActions: [
        'Deploy heavy excavation crew to locate and shut off segment gate valve.',
        'Coordinate with fire safety department regarding hydrant pressure line status.',
        'Commence segment pipe excavation and bypass installation.'
      ],
      inspectNearbyInfrastructure: true,
      nearbyInfrastructureRecommendation: 'Examine adjacent storm sewer catch basin to confirm structural drainage capacity under high surface flow.',
      uncertaintyFlags: ['The exact volume of soil voiding underneath the sidewalk remains unquantified.'],
      structuredJson: JSON.stringify({
        id: 'INC-224591',
        source: 'CityLens AI Pipeline v2.1',
        category: 'WATER_SEWER',
        severity: 'CRITICAL',
        assignedDepartment: 'Water & Sanitary Sewer Authority (Emergency)',
        repairPriority: 1,
        inspectNearby: true,
        uncertaintyFlags: ['Sub-surface erosion volume unquantified.']
      }, null, 2),
    },
    status: 'IN_PROGRESS',
    actionItems: [
      { id: 'act-0', label: 'Deploy heavy excavation crew to locate and shut off segment gate valve.', completed: true },
      { id: 'act-1', label: 'Coordinate with fire safety department regarding hydrant pressure line status.', completed: true },
      { id: 'act-2', label: 'Commence segment pipe excavation and bypass installation.', completed: false }
    ],
    voterCount: 23,
    hasVoted: true,
  }
];

class DatabaseService {
  constructor() {
    this.seedIfEmpty();
  }

  private async seedIfEmpty() {
    try {
      const snapshot = await db.collection('reports').limit(1).get();
      if (snapshot.empty) {
        console.log('[DatabaseService] Firestore database is empty, seeding initial reports...');
        for (const report of INITIAL_SEED_REPORTS) {
          await this.createReport(report);
        }
        console.log('[DatabaseService] Firestore database successfully seeded.');
      }
    } catch (e: any) {
      console.warn('[DatabaseService] Firestore database seeding failed/skipped:', e.message);
    }
  }

  public async getReports(): Promise<ProcessedIncidentReport[]> {
    try {
      const snapshot = await db.collection('reports').get();
      const list: ProcessedIncidentReport[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as ProcessedIncidentReport);
      });
      // Sort newly created first
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err: any) {
      console.error('[DatabaseService] Error getting reports from Firestore:', err.message);
      return [];
    }
  }

  public async getReportById(id: string): Promise<ProcessedIncidentReport | undefined> {
    try {
      const doc = await db.collection('reports').doc(id).get();
      if (!doc.exists) return undefined;
      return doc.data() as ProcessedIncidentReport;
    } catch (err: any) {
      console.error(`[DatabaseService] Error getting report ${id}:`, err.message);
      return undefined;
    }
  }

  public async createReport(report: ProcessedIncidentReport): Promise<ProcessedIncidentReport> {
    try {
      const docRef = db.collection('reports').doc(report.id);
      
      const docData = {
        // Core ProcessedIncidentReport fields for full frontend and API interface compatibility:
        id: report.id,
        createdAt: report.createdAt,
        draft: report.draft,
        aiAnalysis: report.aiAnalysis,
        status: report.status,
        actionItems: report.actionItems,
        voterCount: report.voterCount,
        hasVoted: report.hasVoted || false,

        // Flat properties mapping for strict specifications compliance:
        reportId: report.id,
        updatedAt: new Date().toISOString(),
        imageUrl: report.draft.imagePreviewUrl || null,
        citizenDescription: report.draft.description,
        latitude: report.draft.coordinates.lat,
        longitude: report.draft.coordinates.lng,
        resolvedAddress: report.draft.resolvedAddress,
        issueCategory: report.aiAnalysis.category,
        severity: report.aiAnalysis.severity,
        severityReason: report.aiAnalysis.severityReasoning,
        confidenceScore: report.aiAnalysis.categoryConfidence || 0.9,
        assignedDepartment: report.aiAnalysis.assignedDepartment,
        recommendedAction: report.aiAnalysis.immediateActions[0] || 'Initial assessment',
        nearbyInspectionRecommendation: report.aiAnalysis.nearbyInfrastructureRecommendation || '',
        uncertaintyFlags: report.aiAnalysis.uncertaintyFlags || [],
        workflowStatus: report.status,
        repairVisualizationUrl: `https://maps.google.com/?q=${report.draft.coordinates.lat},${report.draft.coordinates.lng}`
      };

      await docRef.set(docData);

      // Save initial workflow log in subcollection 'history' as ReportHistory
      try {
        const historyId = `hist-${Math.floor(100000 + Math.random() * 900000)}`;
        await docRef.collection('history').doc(historyId).set({
          historyId,
          reportId: report.id,
          changedAt: new Date().toISOString(),
          previousStatus: 'NONE',
          newStatus: report.status,
          actor: 'ai_orchestrator',
          notes: 'Incident ticket registered and categorized via CityLens AI pipeline.'
        });
      } catch (histErr: any) {
        console.warn(`[DatabaseService] Failed to write history subcollection for ${report.id}:`, histErr.message);
      }

      return report;
    } catch (err: any) {
      console.error('[DatabaseService] Error writing report to Firestore:', err.message);
      throw err;
    }
  }

  public async updateReport(id: string, updates: Partial<ProcessedIncidentReport>): Promise<ProcessedIncidentReport | undefined> {
    try {
      const docRef = db.collection('reports').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return undefined;

      const existingData = doc.data() as ProcessedIncidentReport;
      const mergedData = { ...existingData, ...updates };

      // Write historical log on status change
      if (updates.status && updates.status !== existingData.status) {
        try {
          const historyId = `hist-${Math.floor(100000 + Math.random() * 900000)}`;
          await docRef.collection('history').doc(historyId).set({
            historyId,
            reportId: id,
            changedAt: new Date().toISOString(),
            previousStatus: existingData.status,
            newStatus: updates.status,
            actor: 'municipal_agent',
            notes: 'Workflow status updated via administration dashboard.'
          });
        } catch (histErr: any) {
          console.warn(`[DatabaseService] Failed to record history event for ${id}:`, histErr.message);
        }
      }

      // Convert updates to flat and structured fields
      const dbUpdates: any = {};
      
      // Keep direct nested updates safe
      if (updates.status !== undefined) {
        dbUpdates.status = updates.status;
        dbUpdates.workflowStatus = updates.status;
      }
      if (updates.actionItems !== undefined) {
        dbUpdates.actionItems = updates.actionItems;
      }
      if (updates.voterCount !== undefined) {
        dbUpdates.voterCount = updates.voterCount;
      }
      if (updates.hasVoted !== undefined) {
        dbUpdates.hasVoted = updates.hasVoted;
      }
      if (updates.draft !== undefined) {
        dbUpdates.draft = { ...existingData.draft, ...updates.draft };
        dbUpdates.citizenDescription = dbUpdates.draft.description;
        dbUpdates.imageUrl = dbUpdates.draft.imagePreviewUrl;
        if (dbUpdates.draft.coordinates) {
          dbUpdates.latitude = dbUpdates.draft.coordinates.lat;
          dbUpdates.longitude = dbUpdates.draft.coordinates.lng;
        }
        dbUpdates.resolvedAddress = dbUpdates.draft.resolvedAddress;
      }
      if (updates.aiAnalysis !== undefined) {
        dbUpdates.aiAnalysis = { ...existingData.aiAnalysis, ...updates.aiAnalysis };
        dbUpdates.issueCategory = dbUpdates.aiAnalysis.category;
        dbUpdates.severity = dbUpdates.aiAnalysis.severity;
        dbUpdates.severityReason = dbUpdates.aiAnalysis.severityReasoning;
        dbUpdates.confidenceScore = dbUpdates.aiAnalysis.categoryConfidence;
        dbUpdates.assignedDepartment = dbUpdates.aiAnalysis.assignedDepartment;
        dbUpdates.recommendedAction = dbUpdates.aiAnalysis.immediateActions[0] || '';
        dbUpdates.nearbyInspectionRecommendation = dbUpdates.aiAnalysis.nearbyInfrastructureRecommendation;
        dbUpdates.uncertaintyFlags = dbUpdates.aiAnalysis.uncertaintyFlags;
      }

      dbUpdates.updatedAt = new Date().toISOString();

      await docRef.update(dbUpdates);
      return { ...existingData, ...updates };
    } catch (err: any) {
      console.error(`[DatabaseService] Error updating report ${id}:`, err.message);
      throw err;
    }
  }

  public async deleteReport(id: string): Promise<boolean> {
    try {
      const docRef = db.collection('reports').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return false;
      await docRef.delete();
      return true;
    } catch (err: any) {
      console.error(`[DatabaseService] Error deleting report ${id}:`, err.message);
      return false;
    }
  }

  public async getNearbyReports(lat: number, lng: number, radiusKm: number = 5): Promise<ProcessedIncidentReport[]> {
    try {
      const reports = await this.getReports();
      return reports.filter(r => {
        const d = this.calculateDistance(lat, lng, r.draft.coordinates.lat, r.draft.coordinates.lng);
        return d <= radiusKm;
      });
    } catch (err: any) {
      console.error('[DatabaseService] Error filtering nearby reports:', err.message);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const databaseService = new DatabaseService();

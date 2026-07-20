/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentCategory =
  | 'ROAD_SURFACE'
  | 'STREET_LIGHT'
  | 'TRAFFIC_SIGNAL'
  | 'WATER_SEWER'
  | 'SANITATION'
  | 'PARKS_TREES'
  | 'SIGNAGE'
  | 'PUBLIC_SAFETY'
  | 'OTHER';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number | null;
}

export interface IncidentReportDraft {
  imageFile: File | null;
  imagePreviewUrl: string | null;
  description: string;
  coordinates: LocationCoordinates;
  resolvedAddress: string;
  isCustomLocation: boolean;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  message: string;
  durationMs?: number;
}

export interface ActionItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ProcessedIncidentReport {
  id: string;
  createdAt: string;
  draft: {
    imagePreviewUrl: string | null;
    description: string;
    coordinates: LocationCoordinates;
    resolvedAddress: string;
  };
  aiAnalysis: {
    category: IncidentCategory;
    categoryConfidence: number; // 0.0 to 1.0
    severity: SeverityLevel;
    severityConfidence: number;
    severityReasoning: string;
    assignedDepartment: string;
    repairPriority: number; // 1 to 5 (1 = highest)
    immediateActions: string[];
    inspectNearbyInfrastructure: boolean;
    nearbyInfrastructureRecommendation: string;
    uncertaintyFlags: string[]; // List of things the AI wasn't sure about
    structuredJson: string; // The raw generated JSON from Gemini
  };
  status: 'SUBMITTED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';
  actionItems: ActionItem[];
  voterCount: number;
  hasVoted?: boolean;
}

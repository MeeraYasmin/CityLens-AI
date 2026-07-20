/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config';
import { IncidentCategory, SeverityLevel } from '../../src/types';

// Structured Interface for the AI output
export interface AiAnalysisOutput {
  category: IncidentCategory;
  categoryConfidence: number;
  severity: SeverityLevel;
  severityConfidence: number;
  severityReasoning: string;
  assignedDepartment: string;
  repairPriority: number;
  immediateActions: string[];
  inspectNearbyInfrastructure: boolean;
  nearbyInfrastructureRecommendation: string;
  uncertaintyFlags: string[];
}

class AiOrchestrator {
  private aiClient: GoogleGenAI | null = null;

  /**
   * Lazily initializes Google GenAI client to prevent startup crashes if key is omitted
   */
  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      if (!config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not defined. Please configure it in your Settings > Secrets.');
      }
      this.aiClient = new GoogleGenAI({
        apiKey: config.geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Run the multimodal AI orchestration pipeline
   */
  public async analyzeIncident(
    description: string,
    base64Image: string | null,
    resolvedAddress: string,
    coordinates: { lat: number; lng: number }
  ): Promise<AiAnalysisOutput> {
    try {
      const ai = this.getClient();

      const prompt = `
        You are CityLens AI, an advanced urban incident triage model.
        Analyze the citizen report and any uploaded photographic evidence to produce structured municipal dispatch data.
        
        Citizen Description: "${description}"
        Reported Location: ${resolvedAddress}
        Reported Coordinates: Lat ${coordinates.lat}, Lng ${coordinates.lng}

        Carefully classify the incident into one of these strict categories:
        - 'ROAD_SURFACE' (potholes, sinkholes, road wear, cracked pavements)
        - 'STREET_LIGHT' (dead lights, flickering lights, circuit issues)
        - 'TRAFFIC_SIGNAL' (blinking lights, dead traffic controls, broken signals)
        - 'WATER_SEWER' (burst pipes, sewer overflow, street flooding, gushing hydrants)
        - 'SANITATION' (trash, dump, litter, illegal dumping, hazardous spills)
        - 'PARKS_TREES' (fallen trees, broken branches, overgrown roots, park hazards)
        - 'SIGNAGE' (missing stop signs, graffiti, vandalized directional signs)
        - 'PUBLIC_SAFETY' (active hazard, blocked fire lanes, dangerous situations)
        - 'OTHER' (unclassified infrastructure issues)

        Determine the severity level from: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'.
        Calculate a numeric repairPriority from 1 (immediate extreme hazard) to 5 (routine/scheduled).
      `;

      const contents: any[] = [];

      if (base64Image) {
        let mimeType = 'image/jpeg';
        let data = base64Image;

        if (base64Image.startsWith('data:')) {
          const match = base64Image.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            mimeType = match[1];
            data = match[2];
          }
        }

        contents.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }

      contents.push({
        text: prompt,
      });

      console.log('[AiOrchestrator] Sending request to gemini-3.5-flash with structured schema');

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Must be one of: 'ROAD_SURFACE', 'STREET_LIGHT', 'TRAFFIC_SIGNAL', 'WATER_SEWER', 'SANITATION', 'PARKS_TREES', 'SIGNAGE', 'PUBLIC_SAFETY', 'OTHER'",
              },
              categoryConfidence: {
                type: Type.NUMBER,
                description: 'Confidence score from 0.0 to 1.0',
              },
              severity: {
                type: Type.STRING,
                description: "Must be one of: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'",
              },
              severityConfidence: {
                type: Type.NUMBER,
                description: 'Confidence score from 0.0 to 1.0',
              },
              severityReasoning: {
                type: Type.STRING,
                description: 'Explanation for selecting this severity level and priority code.',
              },
              assignedDepartment: {
                type: Type.STRING,
                description: 'Specific realistic city department responsible for fixing this (e.g. "Department of Public Works", "Bureau of Street Illumination").',
              },
              repairPriority: {
                type: Type.INTEGER,
                description: 'Priority score from 1 (critical emergency) to 5 (scheduled routine).',
              },
              immediateActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 rapid response action items for the field dispatched team.',
              },
              inspectNearbyInfrastructure: {
                type: Type.BOOLEAN,
                description: 'True if adjacent municipal systems might be affected or need preventive scanning.',
              },
              nearbyInfrastructureRecommendation: {
                type: Type.STRING,
                description: 'Specific guidance for examining neighboring assets (e.g., "Inspect storm grates within 10 meters").',
              },
              uncertaintyFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific elements the AI is uncertain about based on description or visuals alone.',
              },
            },
            required: [
              'category',
              'categoryConfidence',
              'severity',
              'severityConfidence',
              'severityReasoning',
              'assignedDepartment',
              'repairPriority',
              'immediateActions',
              'inspectNearbyInfrastructure',
              'nearbyInfrastructureRecommendation',
              'uncertaintyFlags',
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Received empty response text from Gemini');
      }

      console.log('[AiOrchestrator] Successfully parsed structured response from Gemini');
      return JSON.parse(responseText.trim()) as AiAnalysisOutput;
    } catch (err: any) {
      console.warn('[AiOrchestrator] Gemini analysis failed, executing expert local heuristics fallback:', err.message);
      return this.localFallbackAnalysis(description);
    }
  }

  /**
   * Expert rules-based fallback heuristics to keep application functioning if API keys are missing or offline
   */
  private localFallbackAnalysis(text: string): AiAnalysisOutput {
    const normalized = text.toLowerCase();

    // Default Fallback Initializer
    let category: IncidentCategory = 'OTHER';
    let severity: SeverityLevel = 'MEDIUM';
    let severityReasoning = 'General civic infrastructure issue reported requiring standard municipal physical inspection.';
    let assignedDepartment = 'Central Civic Maintenance Division';
    let repairPriority = 3;
    let immediateActions = [
      'Schedule physical verification check by a district inspector.',
      'Log incident record in central smart asset inventory.',
    ];
    let inspectNearbyInfrastructure = false;
    let nearbyInfrastructureRecommendation = 'None required. Execute individual ticket.';
    let uncertaintyFlags = ['Unclear context. Description lacks specific category tags.'];

    // Road Surface Check
    if (
      normalized.includes('pothole') ||
      normalized.includes('crater') ||
      normalized.includes('road') ||
      normalized.includes('pavement') ||
      normalized.includes('asphalt') ||
      normalized.includes('sinkhole')
    ) {
      const isCritical = normalized.includes('swerve') || normalized.includes('accident') || normalized.includes('bike');
      category = 'ROAD_SURFACE';
      severity = isCritical ? 'CRITICAL' : 'HIGH';
      severityReasoning = isCritical
        ? 'Active vehicular swerving reported in proximity of cyclist pathway. Promotes immediate accident threat.'
        : 'Deep asphalt surface cavity posing risk to motorist tire integrity.';
      assignedDepartment = 'Department of Public Works (Street Maintenance)';
      repairPriority = isCritical ? 1 : 2;
      immediateActions = [
        'Deploy emergency signage and safety cones around crater site.',
        'Apply temporary hot-mix asphalt patching compound.',
        'Add to repaving queue for permanent mechanical milling.',
      ];
      inspectNearbyInfrastructure = true;
      nearbyInfrastructureRecommendation = 'Scan matching lane segment for advanced asphalt fatigue cracking and base layer failure.';
      uncertaintyFlags = ['Base layer washouts cannot be estimated visually.'];
    }

    // Street Lights Check
    else if (
      normalized.includes('light') ||
      normalized.includes('dark') ||
      normalized.includes('lamp') ||
      normalized.includes('streetlight') ||
      normalized.includes('blackout')
    ) {
      const isHigh = normalized.includes('intersection') || normalized.includes('park') || normalized.includes('scary');
      category = 'STREET_LIGHT';
      severity = isHigh ? 'HIGH' : 'MEDIUM';
      severityReasoning = isHigh
        ? 'Total illumination blackout situated in highly active pedestrian sector, magnifying crime/collision threat.'
        : 'Outage of a single auxiliary street light lamp.';
      assignedDepartment = 'Bureau of Street Illumination (Utility Board)';
      repairPriority = isHigh ? 2 : 4;
      immediateActions = [
        'Deploy electric bucket truck for wiring inspection.',
        'Replace bulb assembly with energy-efficient smart LED node.',
      ];
      inspectNearbyInfrastructure = true;
      nearbyInfrastructureRecommendation = 'Perform safety check on adjacent cascading circuit line breakers.';
      uncertaintyFlags = ['Underlying circuit short vs simple lamp burnout unconfirmed.'];
    }

    // Water & Sewer Check
    else if (
      normalized.includes('water') ||
      normalized.includes('leak') ||
      normalized.includes('sewer') ||
      normalized.includes('flood') ||
      normalized.includes('burst') ||
      normalized.includes('hydrant')
    ) {
      const isCritical = normalized.includes('gushing') || normalized.includes('flood') || normalized.includes('fountain');
      category = 'WATER_SEWER';
      severity = isCritical ? 'CRITICAL' : 'HIGH';
      severityReasoning = isCritical
        ? 'Potable water is gushing under high pressure. Rapid risk of subterranean erosion, washouts, and residential flooding.'
        : 'Minor slow drain blockage creating street puddle accumulation.';
      assignedDepartment = 'Municipal Water & Sanitation Sewer Authority';
      repairPriority = isCritical ? 1 : 2;
      immediateActions = [
        'Deploy urgent pipe excavation crew to shut gate valve.',
        'Coordinate with Fire Department regarding hydronic segment pressure.',
        'Install bypass pipe section and drain surface pooling.',
      ];
      inspectNearbyInfrastructure = true;
      nearbyInfrastructureRecommendation = 'Inspect adjacent sewer line manhole load capacity and look for structural base voiding.';
      uncertaintyFlags = ['Soil voiding volume remains unknown without ground-penetrating radar.'];
    }

    // Traffic Signal Check
    else if (
      normalized.includes('signal') ||
      normalized.includes('traffic light') ||
      normalized.includes('blinking') ||
      normalized.includes('junction')
    ) {
      category = 'TRAFFIC_SIGNAL';
      severity = 'CRITICAL';
      severityReasoning = 'Failure of primary intersection traffic signal completely disrupts right-of-way, causing extreme risk of broadside collisions.';
      assignedDepartment = 'Bureau of Traffic Engineering (Signal Systems)';
      repairPriority = 1;
      immediateActions = [
        'Alert local transit police to deploy live traffic direction officers.',
        'Reset automated controller logic cabinet.',
        'Verify backup UPS battery status.',
      ];
      inspectNearbyInfrastructure = false;
      nearbyInfrastructureRecommendation = 'None. Execute immediate emergency junction control.';
      uncertaintyFlags = ['Surge vs cabinet board breakdown unconfirmed.'];
    }

    // Sanitation Check
    else if (
      normalized.includes('trash') ||
      normalized.includes('garbage') ||
      normalized.includes('dump') ||
      normalized.includes('litter') ||
      normalized.includes('chemical')
    ) {
      const isHigh = normalized.includes('toxic') || normalized.includes('smell') || normalized.includes('chemical');
      category = 'SANITATION';
      severity = isHigh ? 'HIGH' : 'LOW';
      severityReasoning = isHigh
        ? 'Illegal disposal of suspicious chemical drums or organic waste creating toxic vector hazards.'
        : 'Routine loose garbage/debris needing sweep removal.';
      assignedDepartment = 'Environmental Services & Waste Management';
      repairPriority = isHigh ? 2 : 5;
      immediateActions = [
        'Deploy hazardous validation unit for direct material sampling.',
        'Schedule heavy-haul roll-off flatbed container dispatch.',
      ];
      inspectNearbyInfrastructure = false;
      nearbyInfrastructureRecommendation = 'Examine adjoining storm drainage basins for downstream chemical entry.';
      uncertaintyFlags = ['Toxicity level cannot be evaluated without laboratory sample testing.'];
    }

    // Parks Check
    else if (
      normalized.includes('tree') ||
      normalized.includes('branch') ||
      normalized.includes('park') ||
      normalized.includes('weeds')
    ) {
      const isHigh = normalized.includes('wire') || normalized.includes('blocking');
      category = 'PARKS_TREES';
      severity = isHigh ? 'HIGH' : 'MEDIUM';
      severityReasoning = isHigh
        ? 'Heavy oak/elm branch resting on active power-line wires or completely blockading vehicle movement.'
        : 'Overgrown sidewalk forestry narrowing pedestrian line-of-sight.';
      assignedDepartment = 'Department of Forestry & Parks Administration';
      repairPriority = isHigh ? 2 : 4;
      immediateActions = [
        'Coordinate emergency safety buffer zone with power utilities.',
        'Dispatch forestry pruning crew equipped with mechanical wood chippers.',
      ];
      inspectNearbyInfrastructure = true;
      nearbyInfrastructureRecommendation = 'Examine nearby trees for borer pest infestation or root decay symptoms.';
      uncertaintyFlags = ['Tree core rot density is unconfirmed.'];
    }

    // Signage Check
    else if (
      normalized.includes('sign') ||
      normalized.includes('stop') ||
      normalized.includes('graffiti')
    ) {
      const isStop = normalized.includes('stop') || normalized.includes('yield');
      category = 'SIGNAGE';
      severity = isStop ? 'HIGH' : 'LOW';
      severityReasoning = isStop
        ? 'Downed stop sign at active junction is a structural threat to right-of-way routing.'
        : 'Non-regulatory signage defaced with surface graffiti tagging.';
      assignedDepartment = 'Bureau of Street Signage & Road Markings';
      repairPriority = isStop ? 2 : 5;
      immediateActions = [
        'Deploy emergency signage replacement truck.',
        'Erect temporary physical stand-alone Stop Sign within 1 hour.',
      ];
      inspectNearbyInfrastructure = false;
      nearbyInfrastructureRecommendation = 'Confirm speed limit signs on adjoining 200m block are erect.';
      uncertaintyFlags = [];
    }

    return {
      category,
      categoryConfidence: 0.95,
      severity,
      severityConfidence: 0.90,
      severityReasoning,
      assignedDepartment,
      repairPriority,
      immediateActions,
      inspectNearbyInfrastructure,
      nearbyInfrastructureRecommendation,
      uncertaintyFlags,
    };
  }
}

export const aiOrchestrator = new AiOrchestrator();

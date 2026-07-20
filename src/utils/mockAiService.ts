/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncidentCategory, SeverityLevel, ProcessedIncidentReport, PipelineStep } from '../types';

/**
 * Categorize a report based on text content
 */
export function analyzeDescription(text: string): {
  category: IncidentCategory;
  categoryConfidence: number;
  suggestedSeverity: SeverityLevel;
  severityReason: string;
  department: string;
  priority: number;
  actions: string[];
  inspectNearby: boolean;
  nearbyRecommendation: string;
  uncertaintyFlags: string[];
} {
  const normalized = text.toLowerCase();

  // 1. Road Surface (Potholes, etc)
  if (
    normalized.includes('pothole') ||
    normalized.includes('crater') ||
    normalized.includes('road') ||
    normalized.includes('pavement') ||
    normalized.includes('asphalt') ||
    normalized.includes('sinkhole')
  ) {
    const isCritical = normalized.includes('swerve') || normalized.includes('accident') || normalized.includes('tire') || normalized.includes('deep');
    return {
      category: 'ROAD_SURFACE',
      categoryConfidence: 0.94,
      suggestedSeverity: isCritical ? 'CRITICAL' : 'HIGH',
      severityReason: isCritical
        ? 'Report mentions severe crater causing active vehicular swerving or immediate risk of vehicle damage in a high-speed sector.'
        : 'Deep cavity detected on active transit lane with moderate exposure to bicycle/motorcycle traffic.',
      department: 'Department of Public Works (Street Maintenance)',
      priority: isCritical ? 1 : 2,
      actions: [
        'Dispatch emergency road repair unit to mark the area with safety cones.',
        'Place temporary cold-mix asphalt patch within 4 hours.',
        'Schedule permanent repaving in the weekly queue.'
      ],
      inspectNearby: true,
      nearbyRecommendation: 'Scan matching street segment for sub-base moisture deterioration or cascading fatigue cracking.',
      uncertaintyFlags: normalized.includes('deep') ? [] : ['Sub-surface base layer integrity cannot be evaluated visually.'],
    };
  }

  // 2. Street Lights
  if (
    normalized.includes('light') ||
    normalized.includes('dark') ||
    normalized.includes('lamp') ||
    normalized.includes('streetlight') ||
    normalized.includes('blackout')
  ) {
    const isHigh = normalized.includes('intersection') || normalized.includes('scary') || normalized.includes('crime');
    return {
      category: 'STREET_LIGHT',
      categoryConfidence: 0.98,
      suggestedSeverity: isHigh ? 'HIGH' : 'MEDIUM',
      severityReason: isHigh
        ? 'Entire intersection sector is completely dark, increasing risk of vehicular collision and citizen security vulnerability.'
        : 'Single luminaire outage reported in secondary residential sidewalk quadrant.',
      department: 'Municipal Utility Board (Electrical & Illumination Services)',
      priority: isHigh ? 2 : 4,
      actions: [
        'Deploy bucket-truck electrical repair crew.',
        'Test circuit breaker and replace HPS bulb with energy-efficient LED luminaire.',
        'Verify operational photocell control sensor.'
      ],
      inspectNearby: true,
      nearbyRecommendation: 'Inspect the cascade line circuit to guarantee nearby lamps on the same master switch are receiving power.',
      uncertaintyFlags: ['Wiring fault vs. simple bulb burnout cannot be determined from external imagery.'],
    };
  }

  // 3. Traffic Signals
  if (
    normalized.includes('signal') ||
    normalized.includes('traffic light') ||
    normalized.includes('blinking') ||
    normalized.includes('intersection')
  ) {
    return {
      category: 'TRAFFIC_SIGNAL',
      categoryConfidence: 0.97,
      suggestedSeverity: 'CRITICAL',
      severityReason: 'Total signal failure at active junction causes high-probability risk of severe multi-vehicle collision.',
      department: 'Bureau of Traffic Management (Signal Systems Control)',
      priority: 1,
      actions: [
        'Coordinate with Local Police to deploy traffic control officers immediately.',
        'Dispatch emergency signal technician to restart the local controller cabinet.',
        'Engage backup battery power supply (UPS).'
      ],
      inspectNearby: false,
      nearbyRecommendation: 'None required. Prioritize immediate intersection containment.',
      uncertaintyFlags: ['Diagnostic cabinet data is required to isolate power surge vs. controller memory corruption.'],
    };
  }

  // 4. Water & Sewer
  if (
    normalized.includes('water') ||
    normalized.includes('leak') ||
    normalized.includes('sewer') ||
    normalized.includes('flood') ||
    normalized.includes('pipe') ||
    normalized.includes('drain') ||
    normalized.includes('burst')
  ) {
    const isCritical = normalized.includes('burst') || normalized.includes('gushing') || normalized.includes('fountain');
    return {
      category: 'WATER_SEWER',
      categoryConfidence: 0.92,
      suggestedSeverity: isCritical ? 'CRITICAL' : 'HIGH',
      severityReason: isCritical
        ? 'High-pressure main rupture reported. Risk of major roadway erosion, immediate property flooding, and potable water contamination.'
        : 'Continuous minor overflow reported near storm drain grate, indicating moderate clog or sub-surface drainage backup.',
      department: 'Water & Sanitary Sewer Authority (Emergency Response)',
      priority: isCritical ? 1 : 2,
      actions: [
        'Deploy hydro-excavation crew to isolate and close the segment main gate valve.',
        'Initiate vacuum extraction of accumulated street water.',
        'Issue local boiling water advisory if pressure drops below 20 PSI.'
      ],
      inspectNearby: true,
      nearbyRecommendation: 'Check adjacent catch basins and downstream sewer manholes for sediment load accumulation.',
      uncertaintyFlags: ['Full volume of sub-surface soil voiding / road washouts is unknown.'],
    };
  }

  // 5. Sanitation / Litter
  if (
    normalized.includes('trash') ||
    normalized.includes('garbage') ||
    normalized.includes('dump') ||
    normalized.includes('litter') ||
    normalized.includes('debris') ||
    normalized.includes('illegal')
  ) {
    const isHigh = normalized.includes('hazard') || normalized.includes('smell') || normalized.includes('toxic');
    return {
      category: 'SANITATION',
      categoryConfidence: 0.95,
      suggestedSeverity: isHigh ? 'HIGH' : 'LOW',
      severityReason: isHigh
        ? 'Illegal dumping of potentially hazardous materials, blocking pedestrian sidewalk access or creating biological pest vectors.'
        : 'Accumulated general litter in public park bins requiring routine pickup collection.',
      department: 'Environmental Services Department (Refuse & Sanitation)',
      priority: isHigh ? 3 : 5,
      actions: [
        'Dispatch hazardous materials validation agent to test contents.',
        'Deploy heavy roll-off container truck for bulk pickup.',
        'File incident record for code enforcement surveillance review.'
      ],
      inspectNearby: false,
      nearbyRecommendation: 'Monitor nearby empty parcels for secondary illegal dump patterns.',
      uncertaintyFlags: ['Chemical toxicity level of dumped items is unconfirmed without physical sample tests.'],
    };
  }

  // 6. Parks & Trees
  if (
    normalized.includes('tree') ||
    normalized.includes('branch') ||
    normalized.includes('grass') ||
    normalized.includes('limb') ||
    normalized.includes('park') ||
    normalized.includes('bush') ||
    normalized.includes('root')
  ) {
    const isHigh = normalized.includes('wire') || normalized.includes('line') || normalized.includes('blocking');
    return {
      category: 'PARKS_TREES',
      categoryConfidence: 0.91,
      suggestedSeverity: isHigh ? 'HIGH' : 'MEDIUM',
      severityReason: isHigh
        ? 'Large mature tree branch hanging hazardously over high-voltage power lines or completely blocking a vehicular travel lane.'
        : 'Overgrown weeds or dead shrubbery restricting standard visual clearance at a secondary crosswalk.',
      department: 'Department of Parks, Recreation & Forestry (Urban Forestry Division)',
      priority: isHigh ? 2 : 4,
      actions: [
        'Coordinate with local electric utility to cut back power-line interference safely.',
        'Dispatch tree pruning unit with chipper equipment.',
        'Clear street lane debris to restore transit access.'
      ],
      inspectNearby: true,
      nearbyRecommendation: 'Examine adjacent ash/elm trees for matching borer infestations or root rot disease.',
      uncertaintyFlags: ['Interior fungal decay of the tree trunk cannot be verified visually from surface bark.'],
    };
  }

  // 7. Signage
  if (
    normalized.includes('sign') ||
    normalized.includes('stop') ||
    normalized.includes('yield') ||
    normalized.includes('graffiti')
  ) {
    const isStop = normalized.includes('stop') || normalized.includes('yield');
    return {
      category: 'SIGNAGE',
      categoryConfidence: 0.96,
      suggestedSeverity: isStop ? 'HIGH' : 'LOW',
      severityReason: isStop
        ? 'Missing or knocked-down regulatory Stop/Yield sign at major intersection compromises intersection right-of-way routing.'
        : 'Non-regulatory informative sign has suffered minor damage or graffiti defacement.',
      department: 'Bureau of Street Signage & Pavement Markings',
      priority: isStop ? 2 : 5,
      actions: [
        'Deploy immediate emergency sign installation truck.',
        'Erect a temporary temporary stop sign within 1 hour.',
        'Record asset serial tag for inventory replacement reconciliation.'
      ],
      inspectNearby: false,
      nearbyRecommendation: 'Verify speed limit signage in the immediate 200m block is upright and visible.',
      uncertaintyFlags: [],
    };
  }

  // Default Fallback
  return {
    category: 'OTHER',
    categoryConfidence: 0.85,
    suggestedSeverity: 'MEDIUM',
    severityReason: 'General civic infrastructure issue reported requiring general municipal inspection.',
    department: 'Central Civic Maintenance Division',
    priority: 3,
    actions: [
      'Schedule a physical inspection by a district municipal inspector.',
      'Assign to appropriate sub-agency upon verification.',
      'Log into the centralized smart-city asset ledger.'
    ],
    inspectNearby: false,
    nearbyRecommendation: 'Review historical municipal logs for repeating complaints in this coordinate grid sector.',
    uncertaintyFlags: ['Unclear context. The description lacks specific category keywords.'],
  };
}

/**
 * Simulates a full multimodal AI orchestration pipeline
 */
export function runSimulatedAiPipeline(
  description: string,
  imagePreviewUrl: string | null,
  resolvedAddress: string,
  coordinates: { lat: number; lng: number },
  onStepChange: (steps: PipelineStep[]) => void,
  onComplete: (report: ProcessedIncidentReport) => void
) {
  // Define steps
  const steps: PipelineStep[] = [
    { id: 'img_load', name: 'Gemini Image Processing', status: 'idle', message: 'Extracting features...' },
    { id: 'nlp_descr', name: 'Gemma Language Parsing', status: 'idle', message: 'Analyzing report text...' },
    { id: 'spatial_ref', name: 'Google Maps Spatial Reference', status: 'idle', message: 'Verifying coordinate sector...' },
    { id: 'multimodal_reason', name: 'Multimodal Fusion Model', status: 'idle', message: 'Fusing image and text tensors...' },
    { id: 'db_dispatch', name: 'Smart Routing Dispatch', status: 'idle', message: 'Mapping municipal department...' },
  ];

  // Inform of initial state
  onStepChange([...steps]);

  // Execute steps sequentially
  let currentStepIndex = 0;

  const runNextStep = () => {
    if (currentStepIndex >= steps.length) {
      // Completed! Build final processed report
      const analysis = analyzeDescription(description);
      const mockId = 'INC-' + Math.floor(100000 + Math.random() * 900000);

      const processedReport: ProcessedIncidentReport = {
        id: mockId,
        createdAt: new Date().toISOString(),
        draft: {
          imagePreviewUrl,
          description,
          coordinates,
          resolvedAddress,
        },
        aiAnalysis: {
          category: analysis.category,
          categoryConfidence: analysis.categoryConfidence,
          severity: analysis.suggestedSeverity,
          severityConfidence: +(0.85 + Math.random() * 0.12).toFixed(2),
          severityReasoning: analysis.severityReason,
          assignedDepartment: analysis.department,
          repairPriority: analysis.priority,
          immediateActions: analysis.actions,
          inspectNearbyInfrastructure: analysis.inspectNearby,
          nearbyInfrastructureRecommendation: analysis.nearbyRecommendation,
          uncertaintyFlags: analysis.uncertaintyFlags,
          structuredJson: JSON.stringify(
            {
              id: mockId,
              source: 'CityLens AI Pipeline v2.1',
              timestamp: new Date().toISOString(),
              coordinates,
              category: analysis.category,
              severity: analysis.suggestedSeverity,
              department: analysis.department,
              repairPriority: analysis.priority,
              immediateActions: analysis.actions,
              inspectNearby: analysis.inspectNearby,
              uncertaintyFlags: analysis.uncertaintyFlags,
            },
            null,
            2
          ),
        },
        status: 'SUBMITTED',
        actionItems: analysis.actions.map((act, idx) => ({
          id: `act-${idx}`,
          label: act,
          completed: false,
        })),
        voterCount: Math.floor(Math.random() * 8),
      };

      onComplete(processedReport);
      return;
    }

    // Mark current step as running
    steps[currentStepIndex].status = 'running';
    steps[currentStepIndex].message = getStepRunningMessage(steps[currentStepIndex].id);
    onStepChange([...steps]);

    // Simulate work delay
    setTimeout(() => {
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].message = getStepCompletedMessage(steps[currentStepIndex].id);
      steps[currentStepIndex].durationMs = Math.floor(400 + Math.random() * 600);
      currentStepIndex++;

      // Trigger next step
      if (currentStepIndex < steps.length) {
        runNextStep();
      } else {
        // Complete final trigger
        runNextStep();
      }
    }, 1200);
  };

  runNextStep();
}

function getStepRunningMessage(id: string): string {
  switch (id) {
    case 'img_load':
      return 'Analyzing visual pixels for edge boundaries, pavement damage, and risk factors...';
    case 'nlp_descr':
      return 'Tokenizing description. Searching for urgency semantics and structural keywords...';
    case 'spatial_ref':
      return 'Georeferencing coordinates. Querying street indices and searching for nearest municipality water, lighting or road assets...';
    case 'multimodal_reason':
      return 'Running cross-attention layers. Mapping visual objects to language tokens...';
    case 'db_dispatch':
      return 'Determining department jurisdiction and queue levels. Generating dispatch record...';
    default:
      return 'Processing...';
  }
}

function getStepCompletedMessage(id: string): string {
  switch (id) {
    case 'img_load':
      return 'Image feature vectors extracted successfully.';
    case 'nlp_descr':
      return 'Description semantic syntax analyzed.';
    case 'spatial_ref':
      return 'Spatial coordinates verified against nearest city assets.';
    case 'multimodal_reason':
      return 'Multimodal fusion reasoning complete. Severity and priority converged.';
    case 'db_dispatch':
      return 'Routing dispatch completed. Report created.';
    default:
      return 'Step complete.';
  }
}

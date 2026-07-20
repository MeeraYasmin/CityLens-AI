/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IncidentReportDraft } from '../types';
import { Eye, ShieldCheck, Database, Image as ImageIcon, MapPin, AlignLeft } from 'lucide-react';

interface ReportReviewCardProps {
  draft: IncidentReportDraft;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ReportReviewCard({ draft, onSubmit, onBack, isSubmitting }: ReportReviewCardProps) {
  // Construct what the transmitted JSON payload actually looks like
  const payloadPreview = {
    source: 'CityLens Citizen Client v1.0',
    timestamp: new Date().toISOString(),
    citizenFeedback: {
      description: draft.description,
      hasPhotographicEvidence: !!draft.imageFile,
      imageMetaData: draft.imageFile
        ? {
            fileName: draft.imageFile.name,
            fileSize: `${(draft.imageFile.size / (1024 * 1024)).toFixed(2)} MB`,
            mimeType: draft.imageFile.type,
          }
        : null,
    },
    spatialData: {
      coordinates: draft.coordinates,
      clientVerifiedAddress: draft.resolvedAddress,
      isCustomLocation: draft.isCustomLocation,
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Citizen Pre-Submission Audit</h3>
          <p className="text-xs text-slate-500 font-medium">Verify your incident details before triggering the municipal AI orchestration pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Side: Summary Fields */}
        <div className="space-y-4">
          {/* Image */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-indigo-500" /> Evidence Image
            </p>
            {draft.imagePreviewUrl ? (
              <div className="aspect-video w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-900">
                <img
                  src={draft.imagePreviewUrl}
                  alt="Pre-submission audit"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold p-4">
                <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                <span>No Photo Evidence Provided</span>
                <span className="text-[9px] text-slate-400 mt-1 italic font-medium">Only language report will be used</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlignLeft className="w-3 h-3 text-indigo-500" /> Natural Description
            </p>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-700 italic font-medium">
              "{draft.description || 'No description provided.'}"
            </div>
          </div>

          {/* Geolocation */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-500" /> Location Details
            </p>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 text-xs font-medium text-slate-700">
              <p className="font-bold text-slate-800">{draft.resolvedAddress}</p>
              <p className="font-mono text-[10px] text-slate-500">
                Latitude: {draft.coordinates.lat.toFixed(6)}° • Longitude: {draft.coordinates.lng.toFixed(6)}°
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Network Payload JSON */}
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-500" /> Outgoing JSON Client Payload
          </p>
          <div className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-indigo-300 overflow-y-auto max-h-[280px] shadow-inner select-all">
            <pre className="whitespace-pre-wrap">{JSON.stringify(payloadPreview, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center border-t border-slate-100 pt-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200/50 disabled:opacity-50"
        >
          GO BACK & EDIT
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !draft.description}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all duration-300 shadow-md shadow-indigo-100 flex items-center gap-1.5 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
        >
          <ShieldCheck className="w-4 h-4" />
          {isSubmitting ? 'DISPATCHING TO CLOUD...' : 'SUBMIT INCIDENT REPORT'}
        </button>
      </div>
    </div>
  );
}

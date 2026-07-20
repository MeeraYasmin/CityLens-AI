/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ProcessedIncidentReport, SeverityLevel, IncidentCategory } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  MapPin,
  Clock,
  UserCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  FileCode,
  Wrench,
  ThumbsUp,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface MunicipalityDashboardProps {
  reports: ProcessedIncidentReport[];
  onUpdateReportStatus: (id: string, newStatus: ProcessedIncidentReport['status']) => void;
  onToggleActionItem: (reportId: string, itemId: string) => void;
  onUpvote: (id: string) => void;
}

export function MunicipalityDashboard({
  reports,
  onUpdateReportStatus,
  onToggleActionItem,
  onUpvote,
}: MunicipalityDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );
  const [showJsonDump, setShowJsonDump] = useState(false);

  // Find active selected report
  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Filtering
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.draft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.draft.resolvedAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || rep.aiAnalysis.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'ALL' || rep.aiAnalysis.category === selectedCategory;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  // Calculate high-level stats
  const totalCount = reports.length;
  const criticalCount = reports.filter((r) => r.aiAnalysis.severity === 'CRITICAL').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'DISPATCHED').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  const severityColors: Record<SeverityLevel, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  };

  const statusColors = {
    SUBMITTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DISPATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 h-full overflow-hidden bg-slate-50">
      {/* Left Column: Metrics & List Explorer */}
      <div className="w-full md:w-[420px] flex flex-col gap-5 shrink-0 overflow-hidden h-full">
        {/* Bento Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
              <div className="p-1 bg-slate-100 text-slate-600 rounded">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
            <span className="text-[9px] text-slate-400 font-bold mt-1 block">Live Incident Ledger</span>
          </div>

          <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Critical Issues</span>
              <div className="p-1 bg-red-100/60 text-red-600 rounded">
                <Flame className="w-3.5 h-3.5 animate-bounce" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-red-700 mt-1">{criticalCount}</p>
            <span className="text-[9px] text-red-400 font-bold mt-1 block">High accident probability</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Crews</span>
              <div className="p-1 bg-blue-100/50 text-blue-600 rounded">
                <Wrench className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{inProgressCount}</p>
            <span className="text-[9px] text-slate-400 font-bold mt-1 block">In progress or dispatched</span>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
              <div className="p-1 bg-emerald-100/60 text-emerald-600 rounded">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">{resolvedCount}</p>
            <span className="text-[9px] text-emerald-500 font-bold mt-1 block">Fully patched & closed</span>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm shrink-0 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by street, description, ID..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white placeholder-slate-400 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full text-[10px] p-1.5 border border-slate-300 rounded bg-white text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">ALL SEVERITIES</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-[10px] p-1.5 border border-slate-300 rounded bg-white text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">ALL CATEGORIES</option>
                <option value="ROAD_SURFACE">ROAD SURFACE</option>
                <option value="STREET_LIGHT">STREET LIGHT</option>
                <option value="TRAFFIC_SIGNAL">TRAFFIC SIGNAL</option>
                <option value="WATER_SEWER">WATER / SEWER</option>
                <option value="SANITATION">SANITATION</option>
                <option value="PARKS_TREES">PARKS / FORESTRY</option>
                <option value="SIGNAGE">SIGNAGE</option>
                <option value="PUBLIC_SAFETY">PUBLIC SAFETY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incidents List Explorer */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full space-y-2">
              <Filter className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold">No match found.</p>
              <p className="text-[10px] text-slate-400">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReports.map((report) => {
                const isActive = report.id === selectedReportId;
                const dateStr = new Date(report.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full p-4 flex gap-3 text-left transition-all hover:bg-slate-50 focus:outline-none ${
                      isActive ? 'bg-indigo-50/40 border-r-4 border-indigo-600' : ''
                    }`}
                  >
                    {/* Circle Indicator depending on status */}
                    <div className="mt-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          report.aiAnalysis.severity === 'CRITICAL'
                            ? 'bg-red-500 animate-ping'
                            : report.aiAnalysis.severity === 'HIGH'
                            ? 'bg-orange-400'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{report.id}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{dateStr}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate" title={report.draft.resolvedAddress}>
                        {report.draft.resolvedAddress}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic">
                        "{report.draft.description}"
                      </p>

                      <div className="flex gap-1.5 items-center pt-1 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-extrabold rounded uppercase tracking-wider">
                          {report.aiAnalysis.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wider border ${
                            severityColors[report.aiAnalysis.severity]
                          }`}
                        >
                          {report.aiAnalysis.severity}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded uppercase tracking-wider border ${
                            statusColors[report.status]
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Detailed Inspector Workspace */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[480px]">
        {selectedReport ? (
          <>
            {/* Inspector Header with Status Controls */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-sm">
                  {selectedReport.id.split('-')[1]?.slice(0, 2) || 'IQ'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-wider uppercase font-mono">
                      {selectedReport.id}
                    </h3>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5 truncate flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedReport.draft.resolvedAddress}
                  </p>
                </div>
              </div>

              {/* Status workflow toggler */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workflow Status:</span>
                <select
                  value={selectedReport.status}
                  onChange={(e) => onUpdateReportStatus(selectedReport.id, e.target.value as any)}
                  className="text-xs p-1.5 border border-slate-300 rounded bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="DISPATCHED">DISPATCHED Crew</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">CLOSED / RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Inspector Workspace Grid */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Block: Image Evidence & Original Complaint (Column span 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 leading-none">
                      Photographic Proof
                    </h4>
                    {selectedReport.draft.imagePreviewUrl ? (
                      <div className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group">
                        <img
                          src={selectedReport.draft.imagePreviewUrl}
                          alt="Incident inspection"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono rounded">
                          GPS: {selectedReport.draft.coordinates.lat.toFixed(5)}° N, {selectedReport.draft.coordinates.lng.toFixed(5)}° W
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4">
                        <AlertTriangle className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="text-xs font-bold text-slate-500">No Photographic Evidence</span>
                        <span className="text-[9px] text-slate-400 mt-1 italic font-medium">Citizen description used for reasoning</span>
                      </div>
                    )}
                  </div>

                  {/* Citizen Input Box */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                    <h5 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">
                      Citizen Testimony Description
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed italic font-semibold">
                      "{selectedReport.draft.description}"
                    </p>
                  </div>

                  {/* Validate button section ("Me too" / upvote counters) */}
                  <div className="flex items-center justify-between p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Citizen Validation</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1.5">{selectedReport.voterCount} residents reported similar issue</p>
                    </div>
                    <button
                      onClick={() => onUpvote(selectedReport.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-all ${
                        selectedReport.hasVoted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {selectedReport.hasVoted ? 'VALIDATED!' : 'UPVOTE / ME TOO'}
                    </button>
                  </div>
                </div>

                {/* Right Block: AI Micro-Decision Orchestration (Column span 7) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="p-4 border border-indigo-100 bg-white rounded-xl shadow-sm space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Gemini Multimodal Reasoning
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        Model: Gemini Pro Multimodal
                      </span>
                    </div>

                    {/* Category & Department row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none mb-1.5">AI Category</p>
                        <p className="text-xs font-extrabold text-slate-800 uppercase">
                          {selectedReport.aiAnalysis.category.replace('_', ' ')}
                        </p>
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          Confidence: {(selectedReport.aiAnalysis.categoryConfidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none mb-1.5">Routed Department</p>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedReport.aiAnalysis.assignedDepartment}
                        </p>
                      </div>
                    </div>

                    {/* Severity Reason explaining reasoning */}
                    <div className="p-3 border-l-4 border-red-500 bg-red-50/50 rounded-r-lg space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-red-600 uppercase font-extrabold tracking-widest leading-none">Severity & Explainability reasoning</p>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${severityColors[selectedReport.aiAnalysis.severity]}`}>
                          {selectedReport.aiAnalysis.severity}
                        </span>
                      </div>
                      <p className="text-xs text-red-900 leading-relaxed font-semibold mt-1">
                        {selectedReport.aiAnalysis.severityReasoning}
                      </p>
                    </div>

                    {/* Nearby Infrastructure Scan */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed">
                      <p className="font-extrabold text-slate-600 uppercase text-[10px] tracking-widest mb-1.5">
                        Nearby Infrastructure Scan Recommendation
                      </p>
                      <p className="text-slate-700 font-medium">
                        {selectedReport.aiAnalysis.nearbyInfrastructureRecommendation}
                      </p>
                    </div>

                    {/* Uncertainty Warnings */}
                    {selectedReport.aiAnalysis.uncertaintyFlags.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs space-y-1">
                        <p className="font-extrabold text-yellow-700 uppercase text-[10px] tracking-widest flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          AI Pipeline Uncertainty Warning
                        </p>
                        <ul className="list-disc pl-4 text-yellow-800 space-y-0.5 font-medium text-[11px]">
                          {selectedReport.aiAnalysis.uncertaintyFlags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Immediate Action Items Checklist */}
                  <div className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm space-y-3.5">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                      Immediate Action Items Checklist
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      These task actions were auto-prescribed by CityLens AI logic. Check off items as they are deployed in the field.
                    </p>
                    <div className="space-y-2.5">
                      {selectedReport.actionItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onToggleActionItem(selectedReport.id, item.id)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-left transition-colors font-medium"
                        >
                          <div className="mt-0.5 text-indigo-600 shrink-0">
                            {item.completed ? (
                              <CheckSquare className="w-4 h-4 fill-indigo-100 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <p className={`text-xs text-slate-700 leading-tight ${item.completed ? 'line-through text-slate-400' : ''}`}>
                            {item.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code toggle block */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowJsonDump(!showJsonDump)}
                      className="text-xs font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 tracking-wider uppercase font-mono"
                    >
                      <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                      {showJsonDump ? 'HIDE DETAILED STRUCTURAL JSON' : 'VIEW DETAILED STRUCTURAL JSON'}
                    </button>
                    {showJsonDump && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-[220px]">
                        <pre className="whitespace-pre">{selectedReport.aiAnalysis.structuredJson}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-2 animate-bounce" />
            <p className="text-xs font-bold">No report selected.</p>
          </div>
        )}
      </div>
    </div>
  );
}

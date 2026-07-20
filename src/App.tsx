/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CitizenReportingInterface } from './components/CitizenReportingInterface';
import { MunicipalityDashboard } from './components/MunicipalityDashboard';
import { ProcessedIncidentReport } from './types';
import { subscribeToReports } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'citizen' | 'municipal'>('citizen');
  const [reports, setReports] = useState<ProcessedIncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to real-time reports from Google Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeToReports(
      (data) => {
        setReports(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to real-time reports:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 1. Citizen submits a new incident report draft, append dynamically
  const handleReportCreated = (newReport: ProcessedIncidentReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  // 2. Municipal updates status workflow via real PATCH
  const handleUpdateReportStatus = async (id: string, newStatus: ProcessedIncidentReport['status']) => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) => prev.map((rep) => (rep.id === id ? updatedReport : rep)));
      } else {
        console.error('Failed to update report status on backend');
      }
    } catch (err) {
      console.error('Error updating report status:', err);
    }
  };

  // 3. Check off individual action items inside incident details via real PATCH
  const handleToggleActionItem = async (reportId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/action-items/${itemId}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) => prev.map((rep) => (rep.id === reportId ? updatedReport : rep)));
      } else {
        console.error('Failed to toggle action item on backend');
      }
    } catch (err) {
      console.error('Error toggling action item:', err);
    }
  };

  // 4. Resident Upvoting Counter via real POST
  const handleUpvote = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}/upvote`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) => prev.map((rep) => (rep.id === id ? updatedReport : rep)));
      } else {
        console.error('Failed to toggle upvote on backend');
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    }
  };

  // Unsubmitted drafts and critical queues
  const pendingReportsCount = reports.filter((r) => r.status === 'SUBMITTED').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'citizen' ? (
          <CitizenReportingInterface onReportCreated={handleReportCreated} />
        ) : (
          <MunicipalityDashboard
            reports={reports}
            onUpdateReportStatus={handleUpdateReportStatus}
            onToggleActionItem={handleToggleActionItem}
            onUpvote={handleUpvote}
          />
        )}
      </main>

      {/* Footer conforming to Geometric Balance aesthetics */}
      <footer className="h-12 border-t border-slate-200 bg-white px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
        <div className="truncate">Powered by Google Cloud & Gemini Multimodal Reasoning</div>
        <div className="hidden sm:flex gap-6 items-center shrink-0">
          <span>Scalability Tier: Enterprise</span>
          <span>Orchestration: Event-Driven</span>
          <span className="font-mono">Lat: 40.7128 Lng: -74.0060</span>
        </div>
      </footer>
    </div>
  );
}

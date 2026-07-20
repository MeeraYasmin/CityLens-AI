/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileText, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: 'citizen' | 'municipal';
  setActiveTab: (tab: 'citizen' | 'municipal') => void;
  pendingReportsCount: number;
}

export function Header({ activeTab, setActiveTab, pendingReportsCount }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        {/* Geometric Balance Logo Mark */}
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
          <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">CityLens AI</h1>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
            See it. Say it. Solve it.
          </p>
        </div>
      </div>

      {/* Center Tab Toggle (Citizen Reporting vs. Municipality Dashboard) */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 max-w-sm">
        <button
          onClick={() => setActiveTab('citizen')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeTab === 'citizen'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Switch to Citizen Portal"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          Citizen Portal
        </button>
        <button
          onClick={() => setActiveTab('municipal')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 relative ${
            activeTab === 'municipal'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Switch to Municipality Hub"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
          Municipal Hub
          {pendingReportsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold border-2 border-white animate-bounce">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* Right Side Info Block */}
      <div className="hidden md:flex gap-6 items-center">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">System Operational</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-widest">Active Node</p>
          <p className="text-xs font-mono text-slate-700">GCP-US-CENTRAL-1</p>
        </div>
      </div>
    </header>
  );
}

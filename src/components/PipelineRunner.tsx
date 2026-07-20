/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PipelineStep } from '../types';
import { Cpu, CheckCircle2, RotateCw, AlertCircle, Sparkles } from 'lucide-react';

interface PipelineRunnerProps {
  steps: PipelineStep[];
}

export function PipelineRunner({ steps }: PipelineRunnerProps) {
  // Calculate total progress percentage
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const runningStep = steps.find((s) => s.status === 'running');
  const percent = Math.floor((completedSteps / steps.length) * 100);

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-5 shadow-2xl max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center animate-pulse">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              Multimodal AI Orchestration Pipeline
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Event-driven model execution on server nodes</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-indigo-400">{percent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Running Subtitle */}
      {runningStep && (
        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex items-start gap-2.5">
          <div className="p-1 bg-indigo-500/10 rounded text-indigo-400 mt-0.5 animate-spin">
            <RotateCw className="w-3 h-3" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest leading-none">
              ACTIVE NODE: {runningStep.name}
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-normal font-medium">{runningStep.message}</p>
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isIdle = step.status === 'idle';
          const isRunning = step.status === 'running';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isRunning
                  ? 'bg-slate-800/80 border-indigo-500 shadow-md shadow-indigo-500/5'
                  : isCompleted
                  ? 'bg-slate-900/40 border-slate-800/80'
                  : 'bg-slate-950/20 border-slate-900/40 opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Visual Circle Indicator */}
                <div className="flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
                  ) : isRunning ? (
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {index + 1}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200">{step.name}</h4>
                  {isRunning && (
                    <p className="text-[10px] text-indigo-400 mt-0.5 animate-pulse font-medium">Processing multimodal tensor grids...</p>
                  )}
                  {isCompleted && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{step.message}</p>
                  )}
                </div>
              </div>

              {/* Timing */}
              {isCompleted && step.durationMs && (
                <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-800">
                  {step.durationMs}ms
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { useDataMode } from '../../config/dataConfig';
import { Database, Cloud, RefreshCw, CheckCircle2, AlertCircle, Sparkles, X, ChevronRight } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const DataModeBadge: React.FC = () => {
  const { role } = useAuth();
  const { isMockData, toggleDataMode, syncWithCloud } = useERP();
  const { resetToDefault } = useDataMode();
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Security hardening: Only SuperAdmin is authorized to view or toggle data pipelines
  if (role !== 'superadmin') {
    return null;
  }

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      if (syncWithCloud) {
        const res = await syncWithCloud();
        if (res.success) {
          setSyncStatus(`Successfully synced data to Google Cloud Firestore!`);
        } else {
          setSyncStatus(`Sync notice: ${res.error || 'Check network connection'}`);
        }
      }
    } catch (e: any) {
      setSyncStatus(`Sync error: ${e?.message || 'Failed'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer active:scale-95 duration-150 ${
          isMockData
            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
        }`}
        title="Click to view or toggle Data Handling Mode (Mock vs Live Firebase)"
      >
        {isMockData ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>Mock Data</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span>Live Firestore</span>
          </>
        )}
      </button>

      {/* Configuration Details & Toggle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isMockData ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>
                  {isMockData ? <Database className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Data Mode Configuration</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mock vs. Real Cloud Database</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Current Active Mode Card */}
              <div className={`p-4 rounded-xl border ${isMockData ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' : 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Pipeline</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${isMockData ? 'bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200' : 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'}`}>
                    {isMockData ? 'Local Mock Data' : 'Live Firestore'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isMockData
                    ? 'Using high-fidelity local datasets from src/data/mockData.ts for fast, smooth testing and UI demos without network dependency.'
                    : 'Actively connected to Google Cloud Firestore. Attendance, students, teachers, and exam marks read and write directly to the cloud.'}
                </p>
              </div>

              {/* Mode Toggle Action */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Switch Data Pipeline</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Currently: <strong className="text-slate-700 dark:text-slate-300">{isMockData ? 'Mock Mode' : 'Live Cloud Mode'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleDataMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                    isMockData
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {isMockData ? 'Switch to Live Firestore' : 'Switch to Mock Data'}
                </button>
              </div>

              {/* Environment Variable Information */}
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200">Environment Variable Flag:</p>
                <div className="font-mono text-[11px] p-2 bg-slate-900 text-slate-200 rounded-md">
                  VITE_USE_MOCK_DATA="true" | "false"
                </div>
                <p className="text-[11px] pt-1 text-slate-500">
                  You can set <code className="text-indigo-600 dark:text-indigo-400">VITE_USE_MOCK_DATA="false"</code> in your environment to default to live Firestore on boot.
                </p>
              </div>

              {/* Live Cloud Tools */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Firestore Seed / Baseline Sync:</span>
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncToFirestore}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Seed Data to Firestore'}</span>
                  </button>
                </div>
                {syncStatus && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{syncStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  resetToDefault();
                  setSyncStatus('Reset override to match environment variable.');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-semibold cursor-pointer"
              >
                Reset to .env default
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

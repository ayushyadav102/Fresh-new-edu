import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Bus,
  RefreshCw
} from 'lucide-react';

export const BusPassScreen: React.FC = () => {
  const { student } = useAuth();
  const { applyBusPass } = useERP();

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Route 14');
  const [selectedStop, setSelectedStop] = useState('Central Park Cross Road');

  const busPass = student?.busPass;

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyBusPass(selectedRoute, 'Campus Direct', selectedStop);
    setTimeout(() => {
      setRenewModalOpen(false);
      alert('Bus pass renewed successfully for Semester 5!');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-md transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 font-bold">
              <Bus className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Digital Campus Bus Pass</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NFC & QR-enabled digital transport ID pass for daily campus shuttle access
          </p>
        </div>

        <button
          onClick={() => setRenewModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Apply / Renew Bus Pass</span>
        </button>
      </div>

      {/* Main Digital Bus ID Card */}
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-teal-500/30 overflow-hidden">
          {/* Card Accent Lights */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base font-serif tracking-tight text-white">CENTRAL UNIVERSITY SHUTTLE</h3>
                <p className="text-[10px] text-teal-300 font-semibold tracking-wider uppercase">DIGITAL ACCESS PASS</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {busPass?.status || 'Active'}
            </span>
          </div>

          {/* Card Body Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 py-6 border-b border-white/10 relative z-10">
            {/* Student Photo & Info (7 Cols) */}
            <div className="sm:col-span-7 flex items-start gap-4">
              <UserAvatar
                avatar={student?.avatar}
                name={student?.name}
                role="student"
                size="lg"
              />
              <div className="space-y-1">
                <p className="text-xs text-teal-300 font-semibold uppercase">Student Name</p>
                <h4 className="font-bold text-white text-base font-serif">{student?.name}</h4>
                <p className="text-xs text-slate-300 font-mono">ID: {student?.studentId}</p>
                <p className="text-xs text-slate-400">{student?.program}</p>
              </div>
            </div>

            {/* Dynamic Animated Mock QR Code (5 Cols) */}
            <div className="sm:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col items-center justify-center text-center space-y-2">
              {/* Dynamic SVG QR Code */}
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path fill="#0f172a" d="M10 10h30v30H10zM60 10h30v30H60zM10 60h30v30H10z" />
                  <path fill="#0d9488" d="M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20z" />
                  <path fill="#0f172a" d="M50 10h5v10h-5zM50 30h10v5h-10zM60 60h10v10H60zM80 60h10v20H80zM50 80h20v10H50z" />
                </svg>
              </div>
              <span className="text-[10px] text-teal-200 font-mono font-semibold">Scan at Bus Entry Scanner</span>
            </div>
          </div>

          {/* Card Footer Details */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-xs relative z-10">
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Route No</span>
              <span className="font-bold text-white">{busPass?.routeNo || 'Route 14'}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Bus Stop</span>
              <span className="font-bold text-white truncate block">{busPass?.busStop || 'Central Park'}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase block">Valid Until</span>
              <span className="font-bold text-emerald-400">{busPass?.validTill || '2025-06-30'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Schedule & Guidelines Table */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-md transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg font-serif mb-4">University Shuttle Route Schedules</h3>

        <div className="space-y-3">
          {[
            { route: 'Route 14', name: 'Metro Station - Campus Direct', stop: 'Central Park Cross Road', timing: '07:30 AM & 08:15 AM' },
            { route: 'Route 07', name: 'North Square - Main Gate', stop: 'City Center Mall', timing: '07:45 AM & 08:30 AM' },
            { route: 'Route 21', name: 'Railway Station - Tech Block', stop: 'South Junction', timing: '07:15 AM & 08:00 AM' }
          ].map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                  {r.route}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{r.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Boarding Stop: {r.stop}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700">
                  ⏰ Morning Buses: {r.timing}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renew Bus Pass Modal */}
      <Modal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title="Digital Bus Pass Application & Renewal"
      >
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900/60 text-teal-900 dark:text-teal-200 text-xs space-y-1">
            <p className="font-bold">Student: {student?.name} ({student?.studentId})</p>
            <p className="text-teal-700 dark:text-teal-300">Digital pass will be generated instantly upon submission.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Bus Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-600 focus:outline-hidden"
            >
              <option value="Route 14">Route 14 - Metro Station Campus Direct</option>
              <option value="Route 07">Route 07 - North Square Main Gate</option>
              <option value="Route 21">Route 21 - Railway Station Tech Block</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Designated Bus Stop
            </label>
            <input
              type="text"
              required
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setRenewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              Issue Digital Bus Pass
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Sparkles, TrendingUp, BookOpen, Sprout, Upload, RotateCcw } from 'lucide-react';

export type AcademicStreamType = 'science' | 'agriculture' | 'commerce' | 'arts';

interface StreamAttendanceVisualProps {
  streamType: AcademicStreamType;
  overallPct: number;
  totalAttended: number;
  totalAbsent: number;
  totalLeave: number;
  totalSessions?: number;
  showStreamToggle?: boolean;
}

export const StreamAttendanceVisual: React.FC<StreamAttendanceVisualProps> = ({
  streamType,
  overallPct,
  totalAttended,
  totalAbsent,
  totalLeave,
  totalSessions,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [customTreeImage, setCustomTreeImage] = useState<string>(() => {
    try {
      return localStorage.getItem('custom_agri_tree_image') || '';
    } catch {
      return '';
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomTreeImage(dataUrl);
        try {
          localStorage.setItem('custom_agri_tree_image', dataUrl);
        } catch (err) {
          console.warn('Failed to save image to localStorage', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTreeImage('');
    try {
      localStorage.removeItem('custom_agri_tree_image');
    } catch {
      // ignore
    }
  };

  const activeTreeSrc = customTreeImage || '/pngtree-green-tree-png-image_18720036.png';

  const validPct = Math.max(0, Math.min(100, overallPct));
  const calculatedTotal = totalSessions ?? (totalAttended + totalAbsent + totalLeave);

  // Safe margin status based on CBSE 75% rule
  const isAboveCbse = validPct >= 75;
  const isSafe = validPct >= 75 && validPct < 85;

  let statusText = `+${(validPct - 75).toFixed(1)}% above minimum`;
  let badgeBorder = 'border-emerald-200 dark:border-emerald-800/60';
  let badgeBg = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
  let themeGlow = 'rgba(16, 185, 129, 0.3)';

  if (!isAboveCbse) {
    statusText = `-${(75 - validPct).toFixed(1)}% below CBSE 75%`;
    badgeBorder = 'border-rose-200 dark:border-rose-800/60';
    badgeBg = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
    themeGlow = 'rgba(244, 63, 94, 0.35)';
  } else if (isSafe) {
    statusText = `+${(validPct - 75).toFixed(1)}% Safe margin`;
    badgeBorder = 'border-teal-200 dark:border-teal-800/60';
    badgeBg = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300';
    themeGlow = 'rgba(20, 184, 166, 0.3)';
  }

  // Stream-specific metadata labels
  const streamMeta: Record<AcademicStreamType, { label: string; sub: string }> = {
    science: { label: 'Science Laboratory', sub: 'Liquid Beaker Wave' },
    agriculture: { label: 'Agriculture Science', sub: 'Botanical Growth' },
    commerce: { label: 'Commerce & Finance', sub: 'Ledger Trajectory' },
    arts: { label: 'Arts & Humanities', sub: 'Illuminated Pages' }
  };

  const meta = streamMeta[streamType] || streamMeta.science;

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      {/* GRAPHIC CONTAINER (UNOBSTRUCTED, COMPACT & NORMAL PROPORTIONS) */}
      <div
        className={`relative flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'scale-[1.03]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="img"
        aria-label={`${meta.label} Attendance: ${validPct.toFixed(1)}%`}
      >
        {/* Ambient Subtle Glow */}
        <div
          className="absolute w-40 sm:w-48 h-40 sm:h-48 rounded-full blur-2xl opacity-25 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: themeGlow }}
        />

        {/* 1. SCIENCE STREAM: LIQUID BEAKER / BOWL (UNOBSTRUCTED) */}
        {streamType === 'science' && (
          <div className="relative w-40 sm:w-44 h-44 sm:h-48 flex flex-col items-center justify-end">
            {/* Flared Glass Top Rim */}
            <div className="w-[106%] h-2 -mb-[1px] z-20 rounded-t-md bg-gradient-to-r from-slate-200 via-white to-slate-200 dark:from-slate-700 dark:via-slate-500 dark:to-slate-700 border-2 border-slate-300/90 dark:border-slate-600/90 shadow-2xs shrink-0 flex items-center justify-center">
              <div className="w-12 h-0.5 bg-white/80 dark:bg-slate-400/60 rounded-full" />
            </div>

            {/* U-Shaped Glass Vessel */}
            <div
              className="relative w-full flex-1 rounded-b-[36px] sm:rounded-b-[40px] rounded-t-xs border-2 border-t-0 border-slate-300/90 dark:border-slate-600/80 bg-gradient-to-b from-slate-100/40 via-white/20 to-slate-200/50 dark:from-slate-800/40 dark:via-slate-900/30 dark:to-slate-950/60 backdrop-blur-xs overflow-hidden flex flex-col justify-end shadow-inner"
              style={{
                boxShadow:
                  validPct > 0
                    ? `inset 0 -4px 12px ${themeGlow}, 0 4px 12px rgba(0,0,0,0.04)`
                    : 'inset 0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              {/* Graduation Ticks & 75% CBSE line */}
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* 100% Mark */}
                <div className="absolute top-[5%] left-2.5 flex items-center gap-1 opacity-60">
                  <div className="w-2.5 h-[1.5px] bg-slate-400 dark:bg-slate-500 rounded" />
                  <span className="text-[7.5px] font-mono font-bold text-slate-400 dark:text-slate-500">100%</span>
                </div>

                {/* 75% CBSE line */}
                <div className="absolute top-[25%] left-0 right-0 flex items-center justify-between px-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-[2px] bg-emerald-500 dark:bg-emerald-400 rounded" />
                    <span className="text-[7.5px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/90 dark:bg-slate-900/90 px-1 py-0.5 rounded border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs">
                      75%
                    </span>
                  </div>
                  <div className="flex-1 mx-1.5 border-b border-dashed border-emerald-500/40 dark:border-emerald-400/40" />
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
                </div>

                {/* 50% line */}
                <div className="absolute top-[50%] left-2.5 flex items-center gap-1 opacity-50">
                  <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
                  <span className="text-[7px] font-mono font-bold text-slate-400 dark:text-slate-500">50%</span>
                </div>

                {/* 25% line */}
                <div className="absolute top-[75%] left-2.5 flex items-center gap-1 opacity-50">
                  <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
                  <span className="text-[7px] font-mono font-bold text-slate-400 dark:text-slate-500">25%</span>
                </div>
              </div>

              {/* Dynamic Fluid Liquid */}
              {validPct > 0 ? (
                <div
                  className="w-full flex flex-col justify-end transition-all duration-700 ease-out z-10 relative overflow-hidden"
                  style={{
                    height: `${validPct}%`,
                    filter: `drop-shadow(0 0 8px ${themeGlow})`
                  }}
                >
                  {/* Fluid Surface Rolling Wave */}
                  <div className="relative w-full h-3 -mb-1 shrink-0 overflow-hidden pointer-events-none">
                    <div
                      className={`absolute inset-0 w-[200%] flex opacity-50 ${
                        isAboveCbse ? 'text-emerald-300 dark:text-emerald-400' : 'text-rose-300 dark:text-rose-400'
                      }`}
                      style={{ animation: 'liquidWaveBack 3.6s linear infinite' }}
                    >
                      <svg viewBox="0 0 120 12" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
                        <path d="M 0,6 Q 30,12 60,6 T 120,6 L 120,12 L 0,12 Z" fill="currentColor" />
                      </svg>
                      <svg viewBox="0 0 120 12" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
                        <path d="M 0,6 Q 30,12 60,6 T 120,6 L 120,12 L 0,12 Z" fill="currentColor" />
                      </svg>
                    </div>

                    <div
                      className={`absolute inset-0 w-[200%] flex opacity-90 ${
                        isAboveCbse ? 'text-emerald-400 dark:text-emerald-300' : 'text-rose-400 dark:text-rose-300'
                      }`}
                      style={{ animation: 'liquidWaveFront 2.2s linear infinite' }}
                    >
                      <svg viewBox="0 0 120 12" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
                        <path d="M 0,6 Q 30,0 60,6 T 120,6 L 120,12 L 0,12 Z" fill="currentColor" />
                      </svg>
                      <svg viewBox="0 0 120 12" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
                        <path d="M 0,6 Q 30,0 60,6 T 120,6 L 120,12 L 0,12 Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>

                  {/* Fluid Gradient Body */}
                  <div
                    className={`w-full flex-1 bg-gradient-to-b ${
                      isAboveCbse
                        ? 'from-emerald-400 via-emerald-500 to-teal-600 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-700'
                        : 'from-rose-400 via-rose-500 to-red-600 dark:from-rose-500 dark:via-rose-600 dark:to-red-700'
                    } relative`}
                    style={{ minHeight: '4px' }}
                  >
                    {/* Rising Bubbles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div
                        className="absolute w-1.5 h-1.5 rounded-full bg-white/70 left-[25%]"
                        style={{ animation: 'bubbleRise 2.4s infinite ease-in' }}
                      />
                      <div
                        className="absolute w-2 h-2 rounded-full bg-white/50 left-[65%]"
                        style={{ animation: 'bubbleRise 3.2s infinite 0.8s ease-in' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-end pb-3 pointer-events-none">
                  <div className="w-6 h-1 rounded-full bg-slate-300/40 dark:bg-slate-700/40" />
                </div>
              )}

              {/* Specular Highlights */}
              <div className="absolute inset-y-2 left-1.5 w-1 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-full pointer-events-none z-30" />
              <div className="absolute top-3 right-1.5 w-0.5 h-6 bg-white/40 rounded-full pointer-events-none z-30" />
            </div>
          </div>
        )}

        {/* 2. AGRICULTURE STREAM: REALISTIC DETAILED GREEN TREE (DYNAMIC BOTTOM-UP FILL) */}
        {streamType === 'agriculture' && (
          <div className="relative w-44 sm:w-48 h-44 sm:h-48 rounded-2xl border-2 border-emerald-300/80 dark:border-emerald-700/60 bg-gradient-to-b from-emerald-50/60 via-white/40 to-emerald-100/50 dark:from-emerald-950/30 dark:via-slate-900/40 dark:to-emerald-900/30 backdrop-blur-xs p-2.5 flex flex-col items-center justify-between overflow-hidden shadow-xs">
            {/* Top Toolbar: 75% Safe Line indicator & Custom Image Upload */}
            <div className="absolute top-[8%] left-2 right-2 flex items-center justify-between z-20">
              <span className="text-[7.5px] font-mono font-black text-emerald-700 dark:text-emerald-400 bg-white/95 dark:bg-slate-900/95 px-1 py-0.5 rounded border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs pointer-events-none">
                75% BLOOM
              </span>
              <div className="flex-1 mx-1.5 border-b border-dashed border-emerald-500/50 dark:border-emerald-400/50 pointer-events-none" />
              
              <div className="flex items-center gap-1">
                {customTreeImage && (
                  <button
                    type="button"
                    onClick={handleResetImage}
                    title="Default image par reset karein"
                    aria-label="Reset tree image"
                    className="p-1 rounded-md bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
                <label
                  htmlFor="agri-tree-upload-input"
                  title="Apne device se PNG Tree image upload karein"
                  className="cursor-pointer p-1 rounded-md bg-white/95 dark:bg-slate-800/95 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-300/80 dark:border-emerald-700 shadow-xs transition flex items-center gap-0.5 text-[8px] font-semibold"
                >
                  <Upload className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Upload</span>
                  <input
                    id="agri-tree-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            {/* Tree Canvas with Realistic Asset & Dynamic Fill */}
            <div className="relative w-full h-32 sm:h-34 flex items-center justify-center my-auto overflow-hidden">
              {/* Layer 1: Dormant Silhouette / Blueprint (Dormant Tree Shape) */}
              <img
                src={activeTreeSrc}
                alt="Agriculture Tree Base"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter grayscale opacity-25 brightness-95 dark:brightness-75 contrast-75 pointer-events-none select-none"
              />

              {/* Layer 2: Dynamic Rising Realistic Tree (Bottom-Up CSS Clipping Mask) */}
              <div
                className="absolute inset-0 transition-all duration-700 ease-out pointer-events-none overflow-hidden flex items-center justify-center"
                style={{
                  clipPath: `inset(${100 - validPct}% 0% 0% 0%)`
                }}
              >
                <img
                  src={activeTreeSrc}
                  alt="Dynamic Realistic Green Tree"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_10px_rgba(16,185,129,0.35)]"
                />
              </div>

              {/* Dynamic Water/Growth Crest Boundary Line */}
              {validPct > 0 && validPct < 100 && (
                <div
                  className="absolute left-2 right-2 pointer-events-none transition-all duration-700 ease-out z-20"
                  style={{ bottom: `calc(${validPct}% - 1px)` }}
                >
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.9)] opacity-85" />
                </div>
              )}

              {/* Sparkling Golden Harvest Fruit Buds when >= 75% */}
              {isAboveCbse && (
                <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
                  <span className="absolute top-[28%] left-[46%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse" />
                  <span className="absolute top-[34%] right-[32%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse delay-150" />
                  <span className="absolute top-[44%] left-[30%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse delay-300" />
                  <span className="absolute top-[22%] right-[44%] w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse delay-500" />
                </div>
              )}
            </div>

            {/* Bottom Soil Base & Typography Tracking Tags */}
            <div className="w-full pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[8px] font-bold text-emerald-800 dark:text-emerald-300">
              <span>Roots (0%)</span>
              <span className="flex items-center gap-1 font-mono">
                {validPct >= 100 ? 'Harvest (100%)' : `Growth: ${validPct.toFixed(1)}%`}
                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              </span>
            </div>
          </div>
        )}

        {/* 3. COMMERCE STREAM: FINANCIAL BAR CHART / LEDGER (UNOBSTRUCTED) */}
        {streamType === 'commerce' && (
          <div className="relative w-40 sm:w-44 h-44 sm:h-48 rounded-2xl border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/60 via-white/40 to-amber-100/50 dark:from-amber-950/30 dark:via-slate-900/40 dark:to-amber-900/30 backdrop-blur-xs p-2.5 flex flex-col items-center justify-between overflow-hidden shadow-xs">
            {/* 75% Safe Margin Ledger Benchmark Line */}
            <div className="absolute top-[25%] left-2 right-2 flex items-center justify-between pointer-events-none z-15">
              <span className="text-[7.5px] font-mono font-black text-amber-700 dark:text-amber-400 bg-white/95 dark:bg-slate-900/95 px-1 py-0.5 rounded border border-amber-300/60 shadow-xs">
                75% BREAK-EVEN
              </span>
              <div className="flex-1 mx-1.5 border-b border-dashed border-amber-500/40" />
              <TrendingUp className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Financial Ledger Bars */}
            <div className="relative w-full flex-1 flex items-end justify-between px-2 pt-6 pb-1 gap-2">
              {[
                { label: 'Q1', targetHeight: 45 },
                { label: 'Q2', targetHeight: 65 },
                { label: 'Q3', targetHeight: 80 },
                { label: 'Q4', targetHeight: 100 }
              ].map((col, idx) => {
                const barFill = Math.min(100, Math.max(0, (validPct / 100) * col.targetHeight));
                return (
                  <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end">
                    <div className="w-full h-full bg-slate-200/50 dark:bg-slate-800/50 rounded-t-lg relative flex flex-col justify-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                          isAboveCbse
                            ? 'bg-gradient-to-t from-amber-500 via-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-t from-rose-500 via-orange-500 to-amber-500'
                        }`}
                        style={{ height: `${barFill}%` }}
                      />
                    </div>
                    <span className="text-[7.5px] font-bold text-slate-400 mt-1">{col.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer */}
            <div className="w-full pt-1 border-t border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-[8px] font-bold text-amber-800 dark:text-amber-300">
              <span>Capital Growth</span>
              <span className="flex items-center gap-1 font-mono">
                {isAboveCbse ? 'SURPLUS' : 'DEFICIT'}
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              </span>
            </div>
          </div>
        )}

        {/* 4. ARTS / HUMANITIES STREAM: OPEN BOOK & QUILL (UNOBSTRUCTED) */}
        {streamType === 'arts' && (
          <div className="relative w-40 sm:w-44 h-44 sm:h-48 rounded-2xl border-2 border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-b from-purple-50/60 via-white/40 to-indigo-50/50 dark:from-purple-950/30 dark:via-slate-900/40 dark:to-indigo-900/30 backdrop-blur-xs p-2.5 flex flex-col items-center justify-between overflow-hidden shadow-xs">
            {/* 75% Safe Margin Ribbon Line */}
            <div className="absolute top-[25%] left-2 right-2 flex items-center justify-between pointer-events-none z-15">
              <span className="text-[7.5px] font-mono font-black text-purple-700 dark:text-purple-400 bg-white/95 dark:bg-slate-900/95 px-1 py-0.5 rounded border border-purple-300/60 shadow-xs">
                75% SCHOLAR
              </span>
              <div className="flex-1 mx-1.5 border-b border-dashed border-purple-500/40" />
              <BookOpen className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
            </div>

            {/* Book Graphics Canvas */}
            <div className="relative w-36 h-32 flex items-center justify-center my-auto">
              <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-sm">
                <defs>
                  <linearGradient id="artParch" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#faf5ff" />
                    <stop offset="100%" stopColor="#f3e8ff" />
                  </linearGradient>
                </defs>

                {/* Open Book Left & Right Leaves */}
                <path d="M50,15 C35,10 15,12 8,16 L8,64 C15,60 35,58 50,64 Z" fill="url(#artParch)" stroke="#c084fc" strokeWidth="1.5" />
                <path d="M50,15 C65,10 85,12 92,16 L92,64 C85,60 65,58 50,64 Z" fill="url(#artParch)" stroke="#c084fc" strokeWidth="1.5" />
                <line x1="50" y1="15" x2="50" y2="64" stroke="#7e22ce" strokeWidth="2" strokeLinecap="round" />

                {/* Feather Quill Pen */}
                <path d="M78,8 C74,18 68,26 62,34 L60,37 L63,38 C69,32 75,22 80,10 Z" fill="#c084fc" opacity="0.9" />
                <circle cx="60" cy="37" r="1.5" fill={isAboveCbse ? '#10b981' : '#f43f5e'} />
              </svg>

              {/* Flowing Ink Progress Fill */}
              <div
                className="absolute bottom-2 left-3 right-3 rounded-b-lg overflow-hidden transition-all duration-700 ease-out"
                style={{ height: `${(validPct / 100) * 34}px` }}
              >
                <div
                  className={`w-full h-full bg-gradient-to-t ${
                    isAboveCbse
                      ? 'from-purple-600 via-indigo-500 to-emerald-400'
                      : 'from-rose-600 via-orange-500 to-amber-400'
                  } opacity-35 rounded-b-lg`}
                />
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="w-full pt-1 border-t border-purple-200 dark:border-purple-800/50 flex items-center justify-between text-[8px] font-bold text-purple-800 dark:text-purple-300">
              <span>Literary Wisdom</span>
              <span className="flex items-center gap-1">
                Ink: {validPct.toFixed(0)}%
                <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BEAUTIFULLY STYLED PERCENTAGE & STATUS DISPLAY (NICHE / BELOW THE VISUAL) */}
      <div className="flex flex-col items-center justify-center text-center mt-3.5 w-full">
        {/* Large Crisp Percentage Display */}
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {validPct.toFixed(1)}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-500">
            %
          </span>
        </div>

        {/* Stream Subtitle & Status Badge */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-1.5">
          <span className="text-[10px] sm:text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            {meta.label}
          </span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold border shadow-2xs ${badgeBg} ${badgeBorder}`}
          >
            {isAboveCbse ? (
              <ShieldCheck className="w-3 h-3 shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 shrink-0" />
            )}
            <span>{statusText}</span>
          </div>
        </div>

        {/* Sessions Attended Subtext */}
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
          {totalAttended} of {calculatedTotal} total sessions attended
        </p>
      </div>
    </div>
  );
};

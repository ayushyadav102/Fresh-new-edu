import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface HeroLiquidAttendanceBowlProps {
  overallPct: number;
  totalAttended: number;
  totalAbsent: number;
  totalLeave: number;
  totalSessions?: number;
}

export const HeroLiquidAttendanceBowl: React.FC<HeroLiquidAttendanceBowlProps> = ({
  overallPct,
  totalAttended,
  totalAbsent,
  totalLeave,
  totalSessions
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  // Clamp percentage between 0 and 100
  const validPct = Math.max(0, Math.min(100, overallPct));
  const calculatedTotal = totalSessions ?? (totalAttended + totalAbsent + totalLeave);

  // Status tiers
  const isHealthy = validPct >= 85;
  const isSafe = validPct >= 75 && validPct < 85;
  const isWarning = validPct >= 50 && validPct < 75;
  const isCritical = validPct < 50;

  // Fluid color schemes
  let fluidGradient = 'from-emerald-400 via-emerald-500 to-teal-600 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-700';
  let frontWaveColor = 'text-emerald-400 dark:text-emerald-300';
  let backWaveColor = 'text-emerald-300/60 dark:text-emerald-400/40';
  let fluidGlow = 'rgba(16, 185, 129, 0.45)';
  let bowlGlowBorder = 'rgba(16, 185, 129, 0.3)';
  let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  let statusText = `+${(validPct - 75).toFixed(1)}% above minimum`;

  if (isSafe) {
    fluidGradient = 'from-teal-400 via-emerald-500 to-teal-600 dark:from-teal-500 dark:via-emerald-600 dark:to-teal-700';
    frontWaveColor = 'text-teal-400 dark:text-teal-300';
    backWaveColor = 'text-teal-300/60 dark:text-teal-400/40';
    fluidGlow = 'rgba(20, 184, 166, 0.45)';
    bowlGlowBorder = 'rgba(20, 184, 166, 0.3)';
    badgeColor = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
    statusText = `+${(validPct - 75).toFixed(1)}% above minimum`;
  } else if (isWarning) {
    fluidGradient = 'from-amber-400 via-amber-500 to-orange-500 dark:from-amber-500 dark:via-orange-500 dark:to-orange-600';
    frontWaveColor = 'text-amber-400 dark:text-amber-300';
    backWaveColor = 'text-amber-300/60 dark:text-amber-400/40';
    fluidGlow = 'rgba(245, 158, 11, 0.45)';
    bowlGlowBorder = 'rgba(245, 158, 11, 0.3)';
    badgeColor = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    statusText = `-${(75 - validPct).toFixed(1)}% below CBSE threshold`;
  } else if (isCritical) {
    fluidGradient = 'from-rose-400 via-rose-500 to-red-600 dark:from-rose-500 dark:via-rose-600 dark:to-red-700';
    frontWaveColor = 'text-rose-400 dark:text-rose-300';
    backWaveColor = 'text-rose-300/60 dark:text-rose-400/40';
    fluidGlow = 'rgba(244, 63, 94, 0.5)';
    bowlGlowBorder = 'rgba(244, 63, 94, 0.35)';
    badgeColor = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    statusText = `-${(75 - validPct).toFixed(1)}% Critical Deficit`;
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none w-full my-1">
      {/* Outer Glow Halo */}
      <div
        className="absolute w-48 sm:w-56 h-48 sm:h-56 rounded-full blur-2xl opacity-25 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: fluidGlow.replace('0.45', '0.2').replace('0.5', '0.2')
        }}
      />

      {/* THE U-SHAPED HERO BOWL CONTAINER (Compact & Normal Proportions) */}
      <div
        className={`relative w-44 sm:w-48 h-48 sm:h-52 flex flex-col items-center justify-end transition-all duration-300 cursor-pointer ${
          isHovered || isTapped ? 'scale-[1.02]' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsTapped(false);
        }}
        onClick={() => setIsTapped(prev => !prev)}
        role="region"
        aria-label={`Official Attendance Bowl: ${validPct.toFixed(1)}%`}
      >
        {/* Glass Flared Top Rim Lip */}
        <div className="w-[106%] h-2 -mb-[1px] z-25 rounded-t-md bg-gradient-to-r from-slate-200 via-white to-slate-200 dark:from-slate-700 dark:via-slate-500 dark:to-slate-700 border-2 border-slate-300/90 dark:border-slate-600/90 shadow-2xs shrink-0 flex items-center justify-center">
          <div className="w-12 h-0.5 bg-white/80 dark:bg-slate-400/60 rounded-full" />
        </div>

        {/* U-Shaped Glass Beaker / Bowl Body */}
        <div
          className="relative w-full flex-1 rounded-b-[36px] sm:rounded-b-[40px] rounded-t-xs border-2 border-t-0 border-slate-300/90 dark:border-slate-600/80 bg-gradient-to-b from-slate-100/40 via-white/20 to-slate-200/50 dark:from-slate-800/40 dark:via-slate-900/30 dark:to-slate-950/60 backdrop-blur-xs overflow-hidden flex flex-col justify-end shadow-inner transition-colors duration-300"
          style={{
            boxShadow:
              validPct > 0
                ? `inset 0 -4px 12px ${bowlGlowBorder}, 0 4px 14px rgba(0,0,0,0.05)`
                : 'inset 0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          {/* GRADUATION MEASUREMENT TICKS & 75% CBSE ETCHED LINE */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* 100% Mark */}
            <div className="absolute top-[4%] left-2.5 flex items-center gap-1 opacity-60">
              <div className="w-2.5 h-[1.5px] bg-slate-400 dark:bg-slate-500 rounded" />
              <span className="text-[7.5px] font-mono font-bold text-slate-400 dark:text-slate-500">100%</span>
            </div>

            {/* 75% CBSE CRITICAL SAFE THRESHOLD LINE */}
            <div
              className="absolute top-[25%] left-0 right-0 flex items-center justify-between px-2"
              title="CBSE Mandatory 75% Attendance Requirement"
            >
              {/* Left tick */}
              <div className="flex items-center gap-1">
                <div className="w-3 h-[2px] bg-emerald-500/80 dark:bg-emerald-400/80 rounded" />
                <span className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/90 dark:bg-slate-900/90 px-1 py-0.5 rounded border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs">
                  75% MIN
                </span>
              </div>

              {/* Dashed line across bowl */}
              <div className="flex-1 mx-1.5 border-b border-dashed border-emerald-500/40 dark:border-emerald-400/40" />

              {/* Right tick with indicator icon */}
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
                <div className="w-3 h-[2px] bg-emerald-500/80 dark:bg-emerald-400/80 rounded" />
              </div>
            </div>

            {/* 50% Halfway Line */}
            <div className="absolute top-[50%] left-2.5 flex items-center gap-1 opacity-50">
              <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
              <span className="text-[7px] font-mono font-bold text-slate-400 dark:text-slate-500">50%</span>
            </div>
            <div className="absolute top-[50%] right-2.5 flex items-center gap-1 opacity-50">
              <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
            </div>

            {/* 25% Line */}
            <div className="absolute top-[75%] left-2.5 flex items-center gap-1 opacity-50">
              <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
              <span className="text-[7px] font-mono font-bold text-slate-400 dark:text-slate-500">25%</span>
            </div>
            <div className="absolute top-[75%] right-2.5 flex items-center gap-1 opacity-50">
              <div className="w-2 h-[1px] bg-slate-300 dark:bg-slate-600 rounded" />
            </div>
          </div>

          {/* DYNAMIC LIQUID FLUID WAVE */}
          {validPct > 0 ? (
            <div
              className="w-full flex flex-col justify-end transition-all duration-1000 ease-out z-10 relative overflow-hidden"
              style={{
                height: `${validPct}%`,
                filter: `drop-shadow(0 0 10px ${fluidGlow})`
              }}
            >
              {/* WAVE SURFACE CREST */}
              <div className="relative w-full h-4 sm:h-5 -mb-1 shrink-0 overflow-hidden pointer-events-none">
                {/* Back Wave (rolling counter-direction for multi-layer depth) */}
                <div
                  className={`absolute inset-0 w-[200%] flex opacity-50 ${backWaveColor}`}
                  style={{
                    animation: 'liquidWaveBack 4s linear infinite'
                  }}
                >
                  <svg
                    viewBox="0 0 120 12"
                    className="w-1/2 h-full shrink-0"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,6 Q 30,12 60,6 T 120,6 L 120,12 L 0,12 Z"
                      fill="currentColor"
                    />
                  </svg>
                  <svg
                    viewBox="0 0 120 12"
                    className="w-1/2 h-full shrink-0"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,6 Q 30,12 60,6 T 120,6 L 120,12 L 0,12 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Front Wave (crisp, continuous rolling crest) */}
                <div
                  className={`absolute inset-0 w-[200%] flex opacity-90 ${frontWaveColor}`}
                  style={{
                    animation: 'liquidWaveFront 2.5s linear infinite'
                  }}
                >
                  <svg
                    viewBox="0 0 120 12"
                    className="w-1/2 h-full shrink-0"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,6 Q 30,0 60,6 T 120,6 L 120,12 L 0,12 Z"
                      fill="currentColor"
                    />
                  </svg>
                  <svg
                    viewBox="0 0 120 12"
                    className="w-1/2 h-full shrink-0"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,6 Q 30,0 60,6 T 120,6 L 120,12 L 0,12 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {/* Liquid Body Gradient Fill */}
              <div
                className={`w-full flex-1 bg-gradient-to-b ${fluidGradient} relative`}
                style={{ minHeight: '6px' }}
              >
                {/* Floating Bubbles Rising Inside the Fluid */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute w-2 h-2 rounded-full bg-white/70 left-[20%]"
                    style={{ animation: 'bubbleRise 2.8s infinite ease-in' }}
                  />
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-white/50 left-[50%]"
                    style={{ animation: 'bubbleRise 3.5s infinite 1.2s ease-in' }}
                  />
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/60 left-[75%]"
                    style={{ animation: 'bubbleRise 3s infinite 0.5s ease-in' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY BOWL ZERO STATE (0%) */
            <div className="w-full h-full flex flex-col items-center justify-end pb-3 pointer-events-none">
              <div className="w-8 h-1.5 rounded-full bg-slate-300/50 dark:bg-slate-700/50 border border-slate-300/70 dark:border-slate-600/70" />
              <span className="text-[10px] font-bold text-slate-400 mt-1">Empty (0%)</span>
            </div>
          )}

          {/* Curved Specular Glass Reflections */}
          <div className="absolute inset-y-2 left-2 w-1.5 bg-gradient-to-b from-white/80 via-white/20 to-transparent rounded-full pointer-events-none z-30" />
          <div className="absolute top-4 right-2 w-1 h-8 bg-white/40 rounded-full pointer-events-none z-30" />

          {/* CENTER DISPLAY PLAQUE (Ensures 100% crystal-clear readability over liquid) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-25 pointer-events-none px-3">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-md border border-white/80 dark:border-slate-700/80 flex flex-col items-center justify-center text-center transition-transform duration-300">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {validPct.toFixed(1)}
                <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 ml-0.5">
                  %
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-black text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest">
                Overall Aggregate
              </span>

              <div
                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-extrabold border ${badgeColor}`}
              >
                {validPct < 75 ? (
                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE TAP / HOVER QUICK HINT */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {totalAttended} of {calculatedTotal} total sessions attended
        </span>
      </div>
    </div>
  );
};

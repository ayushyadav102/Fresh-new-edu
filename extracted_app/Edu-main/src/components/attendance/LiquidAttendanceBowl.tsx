import React, { useState } from 'react';

interface LiquidAttendanceBowlProps {
  percentage: number;
  attended: number;
  total: number;
  subjectName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LiquidAttendanceBowl: React.FC<LiquidAttendanceBowlProps> = ({
  percentage,
  attended,
  total,
  subjectName,
  size = 'md'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  // Clamp percentage between 0 and 100
  const validPct = Math.max(0, Math.min(100, Math.round(percentage)));

  // Color logic according to specs:
  // >= 75% -> Healthy/Safe glowing green
  // < 75% -> Warning / Critical (amber/red/rose fluid)
  const isHealthy = validPct >= 85;
  const isSafe = validPct >= 75 && validPct < 85;
  const isWarning = validPct >= 50 && validPct < 75;
  const isCritical = validPct < 50;

  // Fluid themes with exact wave colors and gradients
  let frontWaveColor = 'text-emerald-400 dark:text-emerald-300';
  let backWaveColor = 'text-emerald-300/60 dark:text-emerald-400/50';
  let bodyGradient = 'from-emerald-400 via-emerald-500 to-teal-600 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-700';
  let fluidGlow = 'rgba(16, 185, 129, 0.4)';
  let bowlBorderGlow = 'rgba(16, 185, 129, 0.25)';
  let statusBadge = {
    label: validPct === 100 && total > 0 ? 'Perfect' : 'Healthy',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    dotColor: '#10b981'
  };

  if (isSafe) {
    frontWaveColor = 'text-teal-400 dark:text-teal-300';
    backWaveColor = 'text-teal-300/60 dark:text-teal-400/50';
    bodyGradient = 'from-teal-400 via-emerald-500 to-teal-600 dark:from-teal-500 dark:via-emerald-600 dark:to-teal-700';
    fluidGlow = 'rgba(20, 184, 166, 0.4)';
    bowlBorderGlow = 'rgba(20, 184, 166, 0.25)';
    statusBadge = {
      label: 'Safe',
      textColor: 'text-teal-600 dark:text-teal-400',
      dotColor: '#14b8a6'
    };
  } else if (isWarning) {
    frontWaveColor = 'text-amber-400 dark:text-amber-300';
    backWaveColor = 'text-amber-300/60 dark:text-amber-400/50';
    bodyGradient = 'from-amber-400 via-amber-500 to-orange-500 dark:from-amber-500 dark:via-orange-500 dark:to-orange-600';
    fluidGlow = 'rgba(245, 158, 11, 0.4)';
    bowlBorderGlow = 'rgba(245, 158, 11, 0.25)';
    statusBadge = {
      label: 'Low',
      textColor: 'text-amber-600 dark:text-amber-400',
      dotColor: '#f59e0b'
    };
  } else if (isCritical) {
    frontWaveColor = 'text-rose-400 dark:text-rose-300';
    backWaveColor = 'text-rose-300/60 dark:text-rose-400/50';
    bodyGradient = 'from-rose-400 via-rose-500 to-red-600 dark:from-rose-500 dark:via-rose-600 dark:to-red-700';
    fluidGlow = 'rgba(244, 63, 94, 0.45)';
    bowlBorderGlow = 'rgba(244, 63, 94, 0.25)';
    statusBadge = {
      label: 'Critical',
      textColor: 'text-rose-600 dark:text-rose-400',
      dotColor: '#f43f5e'
    };
  }

  // Dimensions based on size
  const dimensions = {
    sm: {
      width: 'w-10 sm:w-11',
      height: 'h-12 sm:h-13',
      rounded: 'rounded-b-[18px] sm:rounded-b-[20px]'
    },
    md: {
      width: 'w-11 sm:w-12',
      height: 'h-13 sm:h-14',
      rounded: 'rounded-b-[20px] sm:rounded-b-[22px]'
    },
    lg: {
      width: 'w-13 sm:w-14',
      height: 'h-15 sm:h-16',
      rounded: 'rounded-b-[24px] sm:rounded-b-[26px]'
    }
  }[size];

  return (
    <div
      className="relative flex items-center justify-center select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onClick={() => setIsTapped(prev => !prev)}
      role="img"
      aria-label={`${subjectName || 'Subject'}: ${validPct}% attendance`}
    >
      {/* Interactive Tooltip on Hover or Tap */}
      {(isHovered || isTapped) && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
          <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap border border-slate-700/60 flex items-center gap-2 backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: statusBadge.dotColor }}
            />
            <span>
              {attended}/{total} Sessions ({validPct}%) • {validPct >= 75 ? 'Safe' : 'Needs 75%'}
            </span>
          </div>
          {/* Tooltip caret arrow */}
          <div className="w-2 h-2 bg-slate-900/95 dark:bg-slate-800/95 rotate-45 mx-auto -mt-1 border-r border-b border-slate-700/60" />
        </div>
      )}

      {/* U-SHAPED BOWL VESSEL */}
      <div
        className={`relative ${dimensions.width} ${dimensions.height} flex flex-col items-center justify-end transition-all duration-300 ${
          isHovered || isTapped ? 'scale-105' : ''
        }`}
      >
        {/* Glass Flared Top Lip/Rim */}
        <div className="w-[110%] h-1.5 -mb-[1px] z-25 rounded-t-sm bg-gradient-to-r from-slate-200/90 via-white to-slate-200/90 dark:from-slate-700/90 dark:via-slate-500/80 dark:to-slate-700/90 border border-slate-300/90 dark:border-slate-600/90 shadow-[0_1px_2px_rgba(0,0,0,0.08)] shrink-0" />

        {/* U-Shaped Glass Container Body */}
        <div
          className={`relative w-full flex-1 ${dimensions.rounded} rounded-t-xs border-2 border-t-0 border-slate-300/90 dark:border-slate-600/90 bg-gradient-to-b from-slate-100/50 via-white/40 to-slate-200/60 dark:from-slate-800/50 dark:via-slate-900/40 dark:to-slate-950/70 backdrop-blur-xs overflow-hidden shadow-inner flex flex-col justify-end transition-colors duration-300`}
          style={{
            boxShadow:
              validPct > 0
                ? `inset 0 -4px 10px ${bowlBorderGlow}, 0 2px 6px rgba(0,0,0,0.06)`
                : 'inset 0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          {/* Graduation Measurement Ticks on Glass Wall */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-70">
            {/* 75% CBSE Mandatory Attendance Threshold Line */}
            <div
              className="absolute top-[25%] right-0.5 flex items-center gap-0.5"
              title="75% Mandatory Attendance Line"
            >
              <span className="text-[5.5px] font-mono font-bold text-slate-400 dark:text-slate-500 select-none scale-90 origin-right">
                75
              </span>
              <div className="w-1.5 h-[1.5px] bg-slate-400 dark:bg-slate-500 rounded-l" />
            </div>

            {/* 50% Halfway Line */}
            <div className="absolute top-[50%] right-0.5 flex items-center">
              <div className="w-1 h-[1px] bg-slate-300 dark:bg-slate-600 rounded-l" />
            </div>

            {/* 25% Line */}
            <div className="absolute top-[75%] right-0.5 flex items-center">
              <div className="w-1 h-[1px] bg-slate-300 dark:bg-slate-600 rounded-l" />
            </div>
          </div>

          {/* DYNAMIC LIQUID FLUID (Fills according to validPct) */}
          {validPct > 0 ? (
            <div
              className="w-full flex flex-col justify-end transition-all duration-700 ease-out z-10 relative overflow-hidden"
              style={{
                height: `${validPct}%`,
                filter: `drop-shadow(0 0 6px ${fluidGlow})`
              }}
            >
              {/* THE SURFACE WAVE CREST */}
              <div className="relative w-full h-2.5 -mb-0.5 shrink-0 overflow-hidden pointer-events-none">
                {/* Back Wave (rolling counter-direction with opacity for depth) */}
                <div
                  className={`absolute inset-0 w-[200%] flex opacity-50 ${backWaveColor}`}
                  style={{
                    animation: 'liquidWaveBack 3.4s linear infinite'
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
                    animation: 'liquidWaveFront 2.1s linear infinite'
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

              {/* Liquid Body (fills seamlessly from wave surface down to bowl bottom) */}
              <div
                className={`w-full flex-1 bg-gradient-to-b ${bodyGradient} relative`}
                style={{ minHeight: '3px' }}
              >
                {/* Micro Bubbles Rising inside fluid */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute w-1 h-1 rounded-full bg-white/70 left-[25%]"
                    style={{ animation: 'bubbleRise 2.4s infinite ease-in' }}
                  />
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/50 left-[68%]"
                    style={{ animation: 'bubbleRise 3.1s infinite 0.9s ease-in' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY BOWL STATE (0%) */
            <div className="w-full h-full flex flex-col items-center justify-end pb-1.5 pointer-events-none">
              {/* Clean dry glass bottom indicator */}
              <div className="w-4 h-1 rounded-full bg-slate-300/40 dark:bg-slate-700/40 border border-slate-300/60 dark:border-slate-600/60" />
            </div>
          )}

          {/* Curved Specular Glass Highlights (Reflective Sheen) */}
          <div className="absolute inset-y-1 left-1 w-1 bg-gradient-to-b from-white/75 via-white/20 to-transparent rounded-full pointer-events-none z-30" />
          <div className="absolute top-2 right-1 w-0.5 h-3 bg-white/45 rounded-full pointer-events-none z-30" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface SubjectDeskIllustrationProps {
  className?: string;
  variant?: 'teal' | 'indigo' | 'purple' | 'amber';
}

export const SubjectDeskIllustration: React.FC<SubjectDeskIllustrationProps> = ({
  className = 'w-full h-full min-h-[90px]',
  variant = 'teal'
}) => {
  const getGradient = () => {
    switch (variant) {
      case 'indigo':
        return 'from-[#3b82f6] to-[#1d4ed8]';
      case 'purple':
        return 'from-[#8b5cf6] to-[#6d28d9]';
      case 'amber':
        return 'from-[#f59e0b] to-[#d97706]';
      case 'teal':
      default:
        // Authentic teal color matching screenshot: #3da49c
        return 'from-[#42a8a0] via-[#35978f] to-[#2b837c]';
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${getGradient()} flex items-center justify-center p-2 shadow-inner select-none ${className}`}
    >
      {/* Background Chalk / Abstract Academic Mesh Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 stroke-white/40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20%" cy="30%" r="40" fill="none" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="85%" cy="70%" r="60" fill="none" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 0 60 Q 50 10 120 40 T 240 80" fill="none" strokeWidth="1" />
        <path d="M 30 10 L 45 25 M 45 10 L 30 25" strokeWidth="1" />
      </svg>

      {/* Main Vector Artwork (Desktop + Graduation Cap + Stacked Books) */}
      <svg
        viewBox="0 0 180 110"
        className="w-full h-full max-h-[85px] max-w-[130px] drop-shadow-md z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Desk Line / Base Shadow */}
        <ellipse cx="90" cy="100" rx="75" ry="5" fill="#000" fillOpacity="0.15" />

        {/* --- DESKTOP MONITOR --- */}
        {/* Stand Base */}
        <path
          d="M 52 94 L 72 94 L 68 85 L 56 85 Z"
          fill="#1e293b"
        />
        {/* Monitor Frame */}
        <rect
          x="30"
          y="35"
          width="64"
          height="48"
          rx="5"
          fill="#0f172a"
        />
        {/* Monitor Screen (Light / Displaying Book) */}
        <rect
          x="33"
          y="38"
          width="58"
          height="40"
          rx="3"
          fill="#f8fafc"
        />
        {/* Open Book Graphic on Screen */}
        <path
          d="M 45 47 Q 56 49 61 52 Q 67 49 78 47 L 78 68 Q 67 70 61 73 Q 56 70 45 68 Z"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {/* Book Spine Center Line */}
        <line x1="61" y1="52" x2="61" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Page text lines */}
        <line x1="48" y1="53" x2="57" y2="54" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="48" y1="58" x2="57" y2="59" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="48" y1="63" x2="55" y2="64" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="65" y1="54" x2="75" y2="53" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="65" y1="59" x2="75" y2="58" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        <line x1="65" y1="64" x2="72" y2="63" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

        {/* --- GRADUATION MORTARBOARD CAP PERCHED ON TOP LEFT OF MONITOR --- */}
        <g transform="translate(48, 22) rotate(-14)">
          {/* Cap Skull Skull-cap underneath */}
          <path d="M 12 10 Q 22 17 32 10 L 32 14 Q 22 21 12 14 Z" fill="#1e3a8a" />
          {/* Diamond Top Cap Board */}
          <polygon points="22,0 44,7 22,14 0,7" fill="#1d4ed8" stroke="#1e40af" strokeWidth="0.8" />
          {/* Cap Center Button */}
          <circle cx="22" cy="7" r="1.8" fill="#f59e0b" />
          {/* Orange Tassel string & drop */}
          <path d="M 22 7 Q 35 9 38 18" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="18" r="1.5" fill="#ea580c" />
          <path d="M 36.5 18 L 39.5 24 L 36.5 24 Z" fill="#ea580c" />
        </g>

        {/* --- STACKED BOOKS & STANDING BOOKS ON RIGHT DESK --- */}
        {/* Bottom Flat Book 1 (Coral/Red) */}
        <rect x="100" y="87" width="46" height="7" rx="1.5" fill="#f43f5e" />
        <rect x="102" y="89" width="42" height="3" fill="#fff" fillOpacity="0.9" />

        {/* Middle Flat Book 2 (White / Light Blue) */}
        <rect x="103" y="79" width="42" height="7" rx="1.5" fill="#38bdf8" />
        <rect x="105" y="81" width="38" height="3" fill="#f8fafc" />

        {/* Top Flat Book 3 (Orange) */}
        <rect x="107" y="72" width="37" height="6.5" rx="1.5" fill="#f97316" />
        <rect x="109" y="74" width="33" height="2.5" fill="#fff" />

        {/* Small Yellow Pencil on Top of Books */}
        <line x1="110" y1="70" x2="135" y2="70" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <polygon points="135,69 138,70 135,71" fill="#78350f" />

        {/* Vertical Book 1 (Navy Blue) standing beside monitor */}
        <rect x="114" y="52" width="7" height="26" rx="1" fill="#1e3a8a" />
        <rect x="115.5" y="54" width="4" height="22" fill="#3b82f6" />
        {/* Book Title Stripe on spine */}
        <line x1="117.5" y1="58" x2="117.5" y2="68" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />

        {/* Vertical Book 2 (Bright Orange/Gold) */}
        <rect x="122" y="47" width="7" height="31" rx="1" fill="#ea580c" />
        <rect x="123.5" y="49" width="4" height="27" fill="#fb923c" />
        {/* Book bookmark sticking out at top */}
        <polygon points="124,47 127,47 125.5,41" fill="#ffffff" />
      </svg>
    </div>
  );
};

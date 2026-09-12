import re

with open('src/components/teacher/TeacherAttendanceView.tsx', 'r') as f:
    content = f.read()

start_str = "              {/* Data Path */}"
end_str = "            </div>\n          </div>"

idx1 = content.find(start_str)
idx2 = content.find(end_str, idx1) + len(end_str)

block_to_remove = content[idx1:idx2]

new_block = """              {/* Data Path */}
              <path d={svgPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />
              {/* Area Under Path */}
              <path d={chartData.length > 0 ? `${svgPath} L 400 100 L 0 100 Z` : ''} fill="url(#blueGradient)" />
              
              {/* Data Points */}
              {chartData.map((d, i) => {
                const stepX = chartData.length > 1 ? 400 / (chartData.length - 1) : 0;
                const x = i * stepX;
                const y = Math.max(0, Math.min(100, (100 - d.pct) * 4));
                const isToday = i === chartData.length - 1;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={isToday ? "4" : "2.5"} fill={isToday ? "#10B981" : "#2563EB"} className={isToday ? "animate-pulse" : ""} />
                    {isToday && (
                      <text x={x > 50 ? x - 40 : x} y={y - 8} fontSize="9" fill="#10B981" fontWeight="bold">
                        {d.pct}% Today
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* X Axis Labels */}
            <div className="flex items-center justify-between mt-4 text-[9px] font-bold text-slate-500 relative w-full px-1">
              {chartData.map((d, i) => (
                <span key={i} className={`text-center leading-tight absolute transform -translate-x-1/2 ${i === chartData.length - 1 ? 'text-slate-800' : ''}`} style={{ left: `${chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 0}%` }}>
                  {d.label === 'Today' ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : `${d.label} ${new Date().toLocaleDateString("en-GB", { month: "short" })}`}<br/>({d.pct}%)
                </span>
              ))}
            </div>
          </div>"""

content = content.replace(block_to_remove, new_block)

with open('src/components/teacher/TeacherAttendanceView.tsx', 'w') as f:
    f.write(content)

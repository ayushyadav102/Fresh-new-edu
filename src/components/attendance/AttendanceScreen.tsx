import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { downloadOrShareCSV } from '../../utils/fileExportUtils';
import { isStudentEnrolledInSubject } from '../../utils/subjectStreamMatcher';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpDown,
  ListOrdered,
  CalendarDays,
  RotateCcw,
  BookOpen,
  Download,
  Fingerprint,
  FileText,
  LayoutDashboard,
  History
} from 'lucide-react';
import { LiquidAttendanceBowl } from './LiquidAttendanceBowl';

interface TimelineLog {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  date: string;
  time: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Pending';
  topic: string;
}

export const AttendanceScreen: React.FC = () => {
  const { attendance: rawAttendance, resetAttendanceToDefaults } = useERP();
  const { student } = useAuth();
  
  const attendance = React.useMemo(() => {
    if (!student) return rawAttendance;
    return rawAttendance.filter((subj) =>
      isStudentEnrolledInSubject(student, subj.subjectName, student.className) &&
      isStudentEnrolledInSubject(student, subj.subjectCode, student.className)
    );
  }, [rawAttendance, student]);

  const [expandedSubject, setExpandedSubject] = useState<string | null>(() =>
    attendance?.[0]?.subjectCode || '042'
  );
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'Present' | 'Absent' | 'Leave' | 'Pending'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'subjects' | 'timeline'>('subjects');
  const [resetMessage, setResetMessage] = useState<string>('');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const weekProgressPct = useMemo(() => {
    const currentDay = currentTime.getDay(); 
    const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    if (currentDayIndex > 5) return 100;
    
    const dayBasePct = (currentDayIndex / 6) * 100;
    
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    const timeInHours = hours + minutes / 60 + seconds / 3600;
    const timeFraction = timeInHours / 24; 
    
    const todayPct = timeFraction * (100 / 6);
    
    return Math.min(100, Math.max(0, dayBasePct + todayPct));
  }, [currentTime]);

  // Keep expandedSubject and selectedSubjectFilter valid when student changes or attendance updates
  useEffect(() => {
    if (attendance.length > 0) {
      if (!expandedSubject || !attendance.some((a) => a.subjectCode === expandedSubject)) {
        setExpandedSubject(attendance[0].subjectCode);
      }
      if (selectedSubjectFilter !== 'ALL' && !attendance.some((a) => a.subjectCode === selectedSubjectFilter)) {
        setSelectedSubjectFilter('ALL');
      }
    }
  }, [attendance, expandedSubject, selectedSubjectFilter]);

  const handleResetAttendance = () => {
    if (window.confirm('Sabhi students ki attendance 0/0 karke refresh karni hai (Aaj se new session attendance start hogi)?')) {
      resetAttendanceToDefaults();
      setResetMessage('Attendance successfully refreshed to 0/0 for all students! New attendance can be marked from today.');
      setTimeout(() => setResetMessage(''), 4000);
    }
  };

  const handleExportStudentAttendance = () => {
    const headers = ['Subject Code', 'Subject Name', 'Date', 'Time', 'Faculty', 'Status', 'Topic'];
    const rows = allChronologicalLogs.map((log) => [
      log.subjectCode,
      `"${log.subjectName}"`,
      log.date,
      `"${log.time}"`,
      `"${log.facultyName}"`,
      log.status,
      `"${log.topic || 'Regular lecture'}"`
    ]);

    const summaryBlock = [
      ['ST. XAVIER SENIOR SECONDARY SCHOOL - STUDENT ATTENDANCE LOG'],
      [`Total Marked Sessions: ${totalClasses}`, `Attended Classes: ${totalAttended}`, `Overall Percentage: ${overallPct.toFixed(1)}%`],
      [`Export Date: ${new Date().toLocaleDateString()}`],
      [],
      headers
    ];

    const csvContent =
      summaryBlock.map((r) => r.join(',')).join('\n') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    downloadOrShareCSV({
      filename: `Student_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`,
      title: 'Student Attendance Report',
      csvContent
    });
  };

  // Helper date formatting
  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return 'N/A';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getDayOfWeek = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }
      return '';
    } catch {
      return '';
    }
  };

  // Compute overall stats strictly from recorded marked lecture logs (excluding Pending)
  const totalClasses = useMemo(() => {
    return attendance.reduce((acc, curr) => {
      const logCount = curr.logs 
        ? curr.logs.filter((l) => l.status === 'Present' || l.status === 'Absent' || l.status === 'Leave').length 
        : curr.totalClasses;
      return acc + logCount;
    }, 0);
  }, [attendance]);

  const totalAttended = useMemo(() => {
    return attendance.reduce((acc, curr) => {
      const attended = curr.logs ? curr.logs.filter((l) => l.status === 'Present').length : curr.attendedClasses;
      return acc + attended;
    }, 0);
  }, [attendance]);

  const totalAbsent = useMemo(() => {
    return attendance.reduce((acc, curr) => {
      const absent = curr.logs ? curr.logs.filter((l) => l.status === 'Absent').length : curr.absentClasses;
      return acc + absent;
    }, 0);
  }, [attendance]);
  const totalLeave = useMemo(() => {
    return attendance.reduce((acc, curr) => {
      const leave = curr.logs ? curr.logs.filter((l) => l.status === 'Leave').length : 0;
      return acc + leave;
    }, 0);
  }, [attendance]);

  const totalPending = useMemo(() => {
    return attendance.reduce((acc, curr) => {
      const pending = curr.logs ? curr.logs.filter((l) => l.status === 'Pending').length : (curr.pendingClasses || 0);
      return acc + pending;
    }, 0);
  }, [attendance]);

  const overallPct = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 100;

  const filteredAttendance = selectedSubjectFilter === 'ALL'
    ? attendance
    : attendance.filter((a) => a.subjectCode === selectedSubjectFilter);

  // Unified chronological timeline of all session logs across subjects
  const allChronologicalLogs = useMemo(() => {
    const combined: TimelineLog[] = [];

    const seenSubjectDates = new Set<string>();

    attendance.forEach((subj) => {
      (subj.logs || []).forEach((log) => {
        const key = `${subj.subjectCode}_${log.date}`;
        if (!seenSubjectDates.has(key)) {
          seenSubjectDates.add(key);
          combined.push({
            id: log.id,
            subjectCode: subj.subjectCode,
            subjectName: subj.subjectName,
            facultyName: subj.facultyName,
            date: log.date,
            time: log.time,
            status: log.status,
            topic: log.topic
          });
        }
      });
    });

    // Filter by subject if selected
    let filtered = combined;
    if (selectedSubjectFilter !== 'ALL') {
      filtered = filtered.filter((l) => l.subjectCode === selectedSubjectFilter);
    }

    // Filter by status if selected
    if (selectedStatusFilter !== 'ALL') {
      filtered = filtered.filter((l) => l.status === selectedStatusFilter);
    }

    // Sort chronologically
    return filtered.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [attendance, selectedSubjectFilter, selectedStatusFilter, sortOrder]);

  // Group timeline by date
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, TimelineLog[]> = {};
    allChronologicalLogs.forEach((item) => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item);
    });
    return groups;
  }, [allChronologicalLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Header & Cumulative Aggregate Redesign */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={student?.avatar || `https://ui-avatars.com/api/?name=${student?.name || 'Student'}&background=0D8ABC&color=fff`}
              alt={student?.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {student?.name || 'Tanmay Singh'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {student?.stream ? `${student.stream} STREAM` : 'SECONDARY BOARD (CBSE) STREAM'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Class {student?.className || 'Class 12-A'} • Roll No. {student?.rollNo || '01'} • Adm #{student?.admissionNumber || '9421'}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="w-full flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shadow-inner">
        <button
          onClick={() => setViewMode('subjects')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
            viewMode === 'subjects'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> Overview
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
            viewMode === 'timeline'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4 sm:w-5 sm:h-5" /> Day-by-Day
        </button>
      </div>

      {viewMode === 'subjects' && (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          {/* Aggregate Card */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm tracking-widest uppercase">
                OFFICIAL ATTENDANCE RATE
              </h3>
              <span className="inline-flex px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold items-center gap-1.5 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> CBSE SAFE MARGIN &ge; 75%
              </span>
            </div>

            {/* Circular Aggregate Attendance Rate Ring */}
            <div className="flex justify-center my-6 sm:my-8 relative">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  {/* Background Track Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="15"
                    className="text-slate-100 dark:text-slate-800/60"
                  />
                  {/* Dynamic Animated Progress Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="transparent"
                    stroke="#1E60F3"
                    strokeWidth="15"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={2 * Math.PI * 80 * (1 - Math.min(Math.max(overallPct, 0), 100) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Inner Content Exactly As In Screenshot */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {overallPct.toFixed(1)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-400 dark:text-slate-500 ml-1">
                      %
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
                    OVERALL AGGREGATE
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold mt-1.5 ${
                      overallPct >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {overallPct >= 75
                      ? `+${(overallPct - 75).toFixed(1)}% above minimum`
                      : `-${(75 - overallPct).toFixed(1)}% below minimum`}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 relative z-10">
              <div className="bg-[#f8fafc] dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105 duration-200">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Present
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                  {totalAttended}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                  Days Regular
                </div>
              </div>

              <div className="bg-[#f8fafc] dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105 duration-200">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Absent
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                  {totalAbsent}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                  Unexcused
                </div>
              </div>

              <div className="bg-[#f8fafc] dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105 duration-200">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Sanctioned
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                  {totalLeave}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                  Leaves Paid
                </div>
              </div>
            </div>
          </div>

      {/* Weekly Attendance Pulse */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Weekly Attendance Pulse
          </h3>
          <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Present
          </span>
        </div>
        
        {/* Strip */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
            const dateObj = new Date();
            const currentDayIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1; // 0=Mon, 5=Sat
            const diff = idx - currentDayIndex;
            dateObj.setDate(dateObj.getDate() + diff);
            const dateNum = dateObj.getDate();
            const isToday = idx === currentDayIndex;
            const isFuture = idx > currentDayIndex;
            
            let status = 'Pending';
            if (!isFuture) {
              // Mocking a status sequence for UI matching
              if (idx === 2) status = 'Leave'; // Wed
              else if (idx === 4) status = 'Absent'; // Fri mock
              else if (isToday) status = 'Present'; // Today
              else status = 'On-Time';
            }

            return (
              <div key={day} className={`flex-1 min-w-[60px] flex flex-col items-center justify-center p-3 rounded-2xl border ${isToday ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isToday ? 'Today' : day}
                </span>
                <span className={`text-lg sm:text-xl font-black mb-2 ${isToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {dateNum}
                </span>
                <div className={`flex flex-col items-center gap-1 ${isToday ? 'text-white' : ''}`}>
                  {status === 'On-Time' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  {status === 'Present' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  {status === 'Leave' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                  {status === 'Absent' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                  {status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>}
                  <span className={`text-[9px] sm:text-[10px] font-bold ${isToday ? 'text-blue-50' : status === 'On-Time' ? 'text-emerald-600 dark:text-emerald-400' : status === 'Leave' ? 'text-amber-600 dark:text-amber-400' : status === 'Absent' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-Time Weekly Progress Line */}
        <div className="mt-5 mb-2 relative px-2">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear relative" 
              style={{ width: `${weekProgressPct}%` }}
            >
               <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          {/* Blinking Live Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#0a0a0a] shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10 animate-pulse transition-all duration-1000 ease-linear"
            style={{ left: `calc(${weekProgressPct}% - 2px)` }}
          ></div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Biometric Machine #02 logged at 08:24 AM today</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Leave</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent</span>
          </div>
        </div>
      </div>

      {/* Subject Attendance Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
             Subject Attendance Breakdown
          </h3>
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-md">{attendance.length} Compulsory</span>
        </div>

        <div className="space-y-3">
          {attendance.map((subj, idx) => {
            const subjAttended = subj.logs ? subj.logs.filter(l => l.status === 'Present').length : subj.attendedClasses;
            const subjTotal = subj.logs ? subj.logs.filter(l => ['Present', 'Absent', 'Leave'].includes(l.status)).length : subj.totalClasses;
            const subjPct = subjTotal > 0 ? (subjAttended / subjTotal) * 100 : 100;

            const isHealthy = subjPct >= 85;
            const isSafe = subjPct >= 75 && subjPct < 85;
            const isCritical = subjPct < 75;
            const isPerfect = subjPct === 100 && subjTotal > 0;

            return (
              <div key={subj.subjectCode || idx} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
                  <div className={`h-full ${isPerfect || isHealthy ? 'bg-emerald-500' : isSafe ? 'bg-blue-500' : 'bg-rose-500'}`} style={{ width: `${subjPct}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{subj.subjectName}</h4>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded shrink-0">{subj.subjectCode}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                        {subj.facultyName} • {subjAttended}/{subjTotal} Sessions
                      </p>
                    </div>
                  </div>

                  {/* Interactive U-Shaped Liquid Bowl Wave Indicator & Numerical Percentage */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                    <LiquidAttendanceBowl
                      percentage={subjPct}
                      attended={subjAttended}
                      total={subjTotal}
                      subjectName={subj.subjectName}
                      size="md"
                    />

                    <div className="text-right shrink-0 min-w-[52px] sm:min-w-[58px]">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                        {subjPct.toFixed(0)}<span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 ml-0.5">%</span>
                      </div>
                      <div className="mt-1">
                        {isPerfect ? (
                          <span className="inline-block text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Perfect
                          </span>
                        ) : isHealthy ? (
                          <span className="inline-block text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Healthy
                          </span>
                        ) : isSafe ? (
                          <span className="inline-block text-[9px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                            Safe
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            Critical
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
             Recent Audit Logs
          </h3>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Last 48 hrs</span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">RFID Morning Turnstile</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Today • 08:24 AM • Gate A</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold tracking-wide">Verified</span>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ListOrdered className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Physics Lab Digital Roll Call</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Yesterday • Period 2-3 (Lab 4)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold tracking-wide">Verified</span>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Medical Sanction Approved</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Wed, 19 Feb • Signed by Dr. Sharma</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[10px] font-bold tracking-wide">Sanctioned</span>
            </div>
          </div>
        </div>
      </div>

        </div>
      )}
      {/* DAY-BY-DAY TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Chronological Attendance Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every lecture arranged by date (Pending days excluded from %)</p>
              </div>
              <span className="inline-flex px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-bold items-center border border-slate-200 dark:border-slate-700">
                Total {allChronologicalLogs.length} Lectures
              </span>
            </div>

            <div className="space-y-6">
              {Object.keys(groupedTimeline).length === 0 ? (
                <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 font-medium text-sm">No attendance logs found matching criteria.</p>
                </div>
              ) : (
                (Object.entries(groupedTimeline) as [string, TimelineLog[]][]).map(([dateStr, logs]) => {
                  const markedDayLogs = logs.filter((l) => l.status === 'Present' || l.status === 'Absent' || l.status === 'Leave');
                  const dayPresentCount = logs.filter((l) => l.status === 'Present').length;
                  const dayTotalCount = markedDayLogs.length;
                  const dayPct = dayTotalCount > 0 ? Math.round((dayPresentCount / dayTotalCount) * 100) : 100;
                  
                  return (
                    <div key={dateStr} className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Date Header */}
                      <div className="bg-slate-50 dark:bg-slate-900/80 px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-xs uppercase tracking-wider">
                            {getDayOfWeek(dateStr)}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{formatDateDisplay(dateStr)}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{dateStr}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                            {dayPresentCount}/{dayTotalCount} Attended
                          </span>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            dayTotalCount === 0 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                            : dayPct === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : dayPct >= 75 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                          }`}>
                            {dayTotalCount === 0 ? 'Pending' : `${dayPct}%`}
                          </span>
                        </div>
                      </div>

                      {/* Class List */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {logs.map((log, idx) => (
                          <div key={`${log.id}_${idx}`} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <div className="flex items-start gap-3">
                              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold text-[10px]">
                                {log.subjectCode}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{log.subjectName}</p>
                                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Topic: {log.topic}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                              <span className="text-[10px] sm:text-xs font-mono font-medium text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                                {log.time}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                log.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                : log.status === 'Absent' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                                : log.status === 'Leave' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                                : 'bg-slate-50 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}>
                                {log.status === 'Present' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                : log.status === 'Absent' ? <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
                                : log.status === 'Leave' ? <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
                                : <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                                {log.status === 'Pending' ? 'Unmarked' : log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  Clock,
  Calendar,
  Building,
  User,
  Printer,
  RotateCcw,
  BookOpen,
  FlaskConical,
  Utensils,
  AlertTriangle,
  MapPin,
  Layers,
  Search,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ShieldCheck,
  GraduationCap,
  Users
} from 'lucide-react';
import {
  sortTimetableSlots,
  TEACHING_PERIODS,
  STANDARD_SCHOOL_PERIODS,
  getTodayDateString,
  getTodayDayName,
  getDayNameFromDateString,
  generateSessionDateOptions,
  getSlotAttendance,
  getStudentTimetableSlots
} from '../../utils/timetableUtils';

export const TimetableScreen: React.FC = () => {
  const { student } = useAuth();
  const { timetable, attendance, classes, resetTimetableToDefaults } = useERP();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

  // Filter timetable strictly for this student's class and section (e.g. 11-A PCM only sees 11-A PCM)
  const studentTimetable = useMemo(() => {
    return getStudentTimetableSlots(timetable, student, classes);
  }, [timetable, student, classes]);

  // Anchored dynamically to today's actual day of week & date
  const todayDateStr = getTodayDateString();
  const todayDayStr = getTodayDayName();

  const [selectedDate, setSelectedDate] = useState<string>(() => todayDateStr);
  const [selectedDay, setSelectedDay] = useState<typeof days[number]>(() => {
    const day = getDayNameFromDateString(todayDateStr);
    return day === 'Sunday' ? 'Monday' : (day as any);
  });
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [resetNotice, setResetNotice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Present' | 'Absent' | 'Leave' | 'Pending'>('ALL');
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // update every 10s for smoother progress
    return () => clearInterval(timer);
  }, []);


  // Dynamic session dates generated starting from today
  const availableDates = generateSessionDateOptions(8);

  const parseTime = (t: string) => {
    if (!t) return 0;
    const parts = t.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (!parts) return 0;
    let h = parseInt(parts[1], 10);
    const m = parseInt(parts[2], 10);
    const ampm = parts[3] ? parts[3].toLowerCase() : '';
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return h * 60 + m;
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const dayFromDate = getDayNameFromDateString(newDate);
    if (dayFromDate !== 'Sunday') {
      setSelectedDay(dayFromDate as any);
    }
  };

  // Helper to lookup student attendance for a timetable slot
  const getSlotAttendanceInfo = (subjectCode: string, subjectName: string) => {
    return getSlotAttendance(subjectCode, subjectName, selectedDate, attendance);
  };

  // Strictly sort by chronological time and apply search & status filter
  const dayTimetable = sortTimetableSlots(
    studentTimetable.filter((slot) => slot.day === selectedDay)
  );

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isTodaySchedule = selectedDate === todayDateStr;

  const filteredTimetable = dayTimetable.filter((slot) => {
    const attInfo = getSlotAttendanceInfo(slot.subjectCode, slot.subjectName);
    
    // Status filter
    if (statusFilter !== 'ALL' && attInfo.status !== statusFilter) {
      return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      slot.subjectName.toLowerCase().includes(q) ||
      slot.facultyName.toLowerCase().includes(q) ||
      slot.roomNo.toLowerCase().includes(q) ||
      slot.building.toLowerCase().includes(q) ||
      slot.type.toLowerCase().includes(q) ||
      slot.startTime.toLowerCase().includes(q) ||
      attInfo.status.toLowerCase().includes(q) ||
      attInfo.topic.toLowerCase().includes(q)
    );
  });

  // Calculate day's attendance summary counters
  const daySummary = dayTimetable.reduce(
    (acc, slot) => {
      const info = getSlotAttendanceInfo(slot.subjectCode, slot.subjectName);
      if (info.isMarked && info.status === 'Present') acc.present += 1;
      else if (info.isMarked && info.status === 'Absent') acc.absent += 1;
      else if (info.isMarked && info.status === 'Leave') acc.leave += 1;
      else if (info.status === 'Pending') acc.pending += 1;
      else acc.scheduled += 1;
      return acc;
    },
    { present: 0, absent: 0, leave: 0, pending: 0, scheduled: 0 }
  );

  const handlePrintTimetable = () => {
    window.print();
  };

  const handleResetTimetable = () => {
    if (window.confirm('Reset timetable to standard CBSE Class 11 school periods in exact chronological order?')) {
      resetTimetableToDefaults();
      setResetNotice('Timetable successfully restored to standard 6-day school schedule!');
      setTimeout(() => setResetNotice(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Class Timetable & Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Academic Session 2025-26 • Class Timetable for <strong className="text-slate-800 dark:text-slate-200">{student?.className || 'Class 11'} ({student?.section || 'Section A'})</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {student && (
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{student.className} • {student.section}</span>
            </div>
          )}
          {/* View Mode Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly Grid
            </button>
          </div>

          <button
            onClick={handlePrintTimetable}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {resetNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in flex items-center justify-between">
          <span>{resetNotice}</span>
          <button onClick={() => setResetNotice('')} className="p-1 hover:bg-emerald-200 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Official Timetable & Session Date Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-slate-50 dark:from-slate-900 dark:via-blue-950/50 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Viewing Date: <span className="text-blue-600 dark:text-blue-400 font-mono">{selectedDate}</span>
              </span>
              {selectedDate === todayDateStr && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  TODAY'S ACTIVE SCHEDULE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Official attendance verified and marked by subject faculty in their teacher portal.</span>
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Switcher */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {availableDates.map((d) => (
                <option key={d.date} value={d.date} className="dark:bg-slate-900">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker for arbitrary date */}
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs focus:outline-hidden"
            title="Choose custom date"
          />
        </div>
      </div>

      {/* Day Tabs Bar & Filter Tools (Daily View) */}
      {viewMode === 'daily' && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Day selection tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto custom-scrollbar transition-colors flex-1">
            <div className="flex items-center gap-2 min-w-max">
              {days.map((day) => {
                const count = timetable.filter((t) => t.day === day).length;
                const isSelected = selectedDay === day;
                const isToday = todayDayStr === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{day}</span>
                    {isToday && (
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      }`}>
                        Today
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filters: Search and Status toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Buttons */}
            <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-1 shadow-xs overflow-x-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({dayTimetable.length})
              </button>
              <button
                onClick={() => setStatusFilter('Present')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  statusFilter === 'Present'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Present ({daySummary.present})</span>
              </button>
              <button
                onClick={() => setStatusFilter('Absent')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  statusFilter === 'Absent'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <XCircle className="w-3 h-3 text-rose-600" />
                <span>Absent ({daySummary.absent})</span>
              </button>
              {daySummary.leave > 0 && (
                <button
                  onClick={() => setStatusFilter('Leave')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    statusFilter === 'Leave'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Leave ({daySummary.leave})</span>
                </button>
              )}
              {daySummary.pending > 0 && (
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    statusFilter === 'Pending'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>⏳</span>
                  <span>Pending ({daySummary.pending})</span>
                </button>
              )}
            </div>

            {/* In-module Search input */}
            <div className="relative min-w-[180px] sm:w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-xs flex items-center">
              <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Search subject, faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily View Slots List (View-only for students with verified status badge) */}
      {viewMode === 'daily' ? (
        <div className="space-y-6">
          {/* Summary Header */}
          {filteredTimetable.length > 0 && (
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {selectedDay}'s Schedule • {filteredTimetable.length} Periods
                </span>
              </div>
              {filteredTimetable.filter(s => {
                  const att = getSlotAttendanceInfo(s.subjectCode, s.subjectName);
                  return att.status === 'Leave';
              }).length > 0 && (
                <div className="px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  {filteredTimetable.filter(s => getSlotAttendanceInfo(s.subjectCode, s.subjectName).status === 'Leave').length} Faculty On Leave
                </div>
              )}
            </div>
          )}

          {filteredTimetable.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {dayTimetable.length === 0
                  ? `No Timetable Published for ${selectedDay}`
                  : `No Classes Matching Filter for ${selectedDay}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {dayTimetable.length === 0
                  ? "The Principal has not added the daily period schedule for this day yet. Once entered and published from the Principal desk, your schedule will appear here live."
                  : 'Try selecting "All" in the status filter or clearing your search term.'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {filteredTimetable.map((slot, index) => {
                const periodNumber = slot.periodNo || index + 1;
                const att = getSlotAttendanceInfo(slot.subjectCode, slot.subjectName);
                
                let IconComponent = Clock;
                if (slot.type === 'Lab') IconComponent = FlaskConical;
                else if (slot.type === 'Lecture') IconComponent = BookOpen;
                else if (slot.type === 'Break' ) IconComponent = Utensils;
                else if (slot.type === 'Activity' || slot.type === 'Tutorial') IconComponent = Calendar;

                const showLunchBreak = periodNumber === 4 && !searchQuery.trim() && statusFilter === 'ALL';

                
                const lunchStartM = parseTime("11:20 AM");
                const lunchEndM = parseTime("12:00 PM");
                const isLunchActive = isTodaySchedule && currentMinutes >= lunchStartM && currentMinutes < lunchEndM;
                const isLunchPast = isTodaySchedule && currentMinutes >= lunchEndM;
                const lunchProgress = isLunchActive ? Math.max(0, Math.min(100, ((currentMinutes - lunchStartM) / (lunchEndM - lunchStartM)) * 100)) : (isLunchPast ? 100 : 0);

                const mStart = parseTime(slot.startTime);
                const mEnd = parseTime(slot.endTime);
                const isActive = isTodaySchedule && currentMinutes >= mStart && currentMinutes < mEnd;
                const isPast = isTodaySchedule && currentMinutes >= mEnd;
                const progressPct = isActive ? Math.max(0, Math.min(100, ((currentMinutes - mStart) / (mEnd - mStart)) * 100)) : (isPast ? 100 : 0);

                // Calculate duration roughly
                let durationStr = "50m";
                try {
                  if (mEnd > mStart) {
                    durationStr = `${mEnd - mStart}m`;
                  }
                } catch (e) {}

                const isHoliday = slot.type === 'Holiday' || (slot.subjectName && slot.subjectName.toLowerCase().includes('holiday'));
                const isNoClass = slot.type === 'No Class' || (slot.subjectName && (slot.subjectName.toLowerCase().includes('no class') || slot.subjectName.toLowerCase().includes('free period')));

                return (
                  <React.Fragment key={slot.id}>
                    {showLunchBreak && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-5">
                        {/* Vertical line segment */}
                        <div className="absolute top-0 bottom-0 left-5 md:left-1/2 w-0.5 -translate-x-px bg-slate-200 dark:bg-neutral-800 z-0">
                           {(isLunchPast || isLunchActive) && (
                             <div className="absolute top-0 left-0 w-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] z-0 transition-all duration-1000 ease-linear" style={{ height: `${lunchProgress}%` }}></div>
                           )}
                           {isLunchActive && (
                             <div className="absolute left-1/2 -translate-x-1/2 -ml-[1px] w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" style={{ top: `${lunchProgress}%` }}></div>
                           )}
                        </div>

                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${isLunchActive ? 'border-amber-200 dark:border-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-110' : 'border-white dark:border-[#0a0a0a] shadow'} bg-amber-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all`}>
                          <Utensils className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 rounded-2xl border transition-all ${isLunchActive ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 shadow-md ring-2 ring-amber-500/30' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/60 shadow-sm'}`}>
                          <div className="space-y-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">11:20 AM - 12:00 PM</span>
                              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                40 Mins
                              </span>
                              {isLunchActive && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Live
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Mid-Day Recess & Lunch Break</p>
                          </div>
                          <div className="mt-3 text-center md:text-left">
                            <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold shadow-xs border border-amber-200 dark:border-amber-800">
                              Cafeteria Open
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${index === filteredTimetable.length - 1 ? 'pb-2' : 'pb-5'}`}>
                      {/* Vertical line segment */}
                      <div className="absolute top-0 bottom-0 left-5 md:left-1/2 w-0.5 -translate-x-px bg-slate-200 dark:bg-neutral-800 z-0 overflow-visible">
                         {(isPast || isActive) && (
                           <div className="absolute top-0 left-0 w-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-0 transition-all duration-1000 ease-linear" style={{ height: `${progressPct}%` }}></div>
                         )}
                         {isActive && (
                           <div className="absolute left-1/2 -translate-x-1/2 -ml-[1px] w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse" style={{ top: `${progressPct}%` }}></div>
                         )}
                      </div>
                      
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${isActive ? 'border-blue-200 dark:border-blue-900 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110 bg-blue-600 text-white' : isPast ? 'border-white dark:border-[#0a0a0a] bg-slate-200 dark:bg-neutral-800 text-slate-400' : 'border-white dark:border-[#0a0a0a] bg-slate-100 dark:bg-neutral-800 text-blue-600 dark:text-blue-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 sm:p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-400 shadow-md ring-2 ring-blue-500/30' : 'bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md'}`}>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                              slot.type === 'Lab' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                              slot.type === 'Lecture' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                              'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                            }`}>
                              Period {periodNumber} • {slot.type || 'Lecture'}
                            </div>
                            {isActive && (
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider animate-pulse border border-rose-200 dark:border-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Live Now
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{slot.startTime}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">to {slot.endTime} • {durationStr}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                              {slot.subjectName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                              Code: {slot.subjectCode} • Teacher: {slot.facultyName}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                            <MapPin className="w-3.5 h-3.5" /> Room {slot.roomNo}
                          </div>
                          <div className="flex items-center gap-2">
                            {isHoliday ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                                🏖️ Official Holiday
                              </span>
                            ) : isNoClass ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                🚫 Free Period
                              </span>
                            ) : att.status === 'Present' ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled & Live
                              </span>
                            ) : att.status === 'Absent' ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Absent/Cancelled
                              </span>
                            ) : att.status === 'Leave' ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Faculty On Leave
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px] w-full">
              {/* Header Row */}
              <div className="grid grid-cols-[120px_repeat(6,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center border-r border-slate-200 dark:border-slate-800">
                  <Clock className="w-4 h-4 mr-2" /> Time
                </div>
                {days.map(day => (
                  <div key={day} className={`p-4 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${day === todayDayStr ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-sm font-bold ${day === todayDayStr ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                      </span>
                      {day === todayDayStr && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full mt-1">Today</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {STANDARD_SCHOOL_PERIODS.map((period, idx) => {
                  if (period.isBreak) {
                    return (
                      <div key={`break-${idx}`} className="flex items-center justify-center p-3 bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-400">
                        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                          <Utensils className="w-4 h-4" />
                          <span className="text-sm font-bold">{period.label}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100/50 dark:bg-amber-900/50">{period.startTime} - {period.endTime}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`period-${period.periodNo}`} className="grid grid-cols-[120px_repeat(6,1fr)] hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors group/row">
                      {/* Time Column */}
                      <div className="p-3 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Period {period.periodNo}</span>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{period.startTime}</div>
                        <div className="text-[10px] text-slate-400">to {period.endTime}</div>
                      </div>

                      {/* Day Columns */}
                      {days.map(day => {
                        const slot = studentTimetable.find(s => s.day === day && s.periodNo === period.periodNo);
                        const isToday = day === todayDayStr;
                        
                        if (!slot) {
                          return (
                            <div key={`${day}-${period.periodNo}`} className={`p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex items-center justify-center ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
                              <span className="text-slate-300 dark:text-slate-700 text-xs">-</span>
                            </div>
                          );
                        }

                        const isLab = slot.type === 'Lab';
                        
                        return (
                          <div key={slot.id} className={`p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 relative group/cell ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                            <div className={`h-full rounded-xl p-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              isLab ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-slate-50/50 dark:bg-slate-900/40'
                            }`}>
                              <div>
                                <div className="flex items-start justify-between mb-1.5 gap-1">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                    isLab 
                                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  }`}>
                                    {slot.type || 'Lecture'}
                                  </span>
                                  {slot.isCombined && (
                                    <Users className="w-3 h-3 text-purple-500" />
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2" title={slot.subjectName}>
                                  {slot.subjectName}
                                </h4>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate" title={slot.facultyName}>{slot.facultyName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate font-medium">{slot.roomNo}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { TimetableSlot, StudentProfile } from '../../types';
import {
  sortTimetableSlots,
  getTeacherScheduleFromTimetable,
  getTodayDayName,
  getTodayDateString,
  getSlotAttendance,
  TEACHING_PERIODS
} from '../../utils/timetableUtils';
import {
  Clock,
  Calendar,
  MapPin,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  Printer,
  Sparkles,
  Layers,
  Info,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  School,
  Users
} from 'lucide-react';

interface TeacherScheduleViewProps {
  onNavigateToAttendance?: (classCode: '11' | '12', subjectName?: string) => void;
}

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
  onNavigateToAttendance
}) => {
  const { teacher } = useAuth();
  const { timetable, attendance, setActiveTeacherClass, setTeacherActiveSubTab } = useERP();

  const todayDay = getTodayDayName();
  const todayDate = getTodayDateString();

  const [activeDay, setActiveDay] = useState<typeof DAYS_LIST[number] | 'TODAY' | 'WEEKLY_MATRIX' | 'ALL'>('TODAY');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [scheduleScope, setScheduleScope] = useState<'MY_LECTURES' | 'FULL_CLASS_VIEW'>('MY_LECTURES');
  const [selectedFullClass, setSelectedFullClass] = useState<'11' | '12'>('11');

  // Derive all slots assigned to this teacher across the entire master timetable
  const allTeacherSlots = useMemo(() => {
    return getTeacherScheduleFromTimetable(timetable, teacher, 'ALL');
  }, [timetable, teacher]);

  // Derive today's slots for this teacher
  const todaySlots = useMemo(() => {
    return getTeacherScheduleFromTimetable(timetable, teacher, todayDay);
  }, [timetable, teacher, todayDay]);

  // Derive full class slots if in FULL_CLASS_VIEW mode
  const fullClassSlots = useMemo(() => {
    return timetable.filter((s) => {
      const cls = s.className || (s.classCode ? `Class ${s.classCode}` : '');
      return cls.includes(selectedFullClass) || s.classCode === selectedFullClass;
    });
  }, [timetable, selectedFullClass]);

  // Filter slots based on active day view and scope
  const currentViewSlots = useMemo(() => {
    if (scheduleScope === 'FULL_CLASS_VIEW') {
      let list = fullClassSlots;
      if (activeDay === 'TODAY') {
        list = list.filter((s) => s.day === todayDay);
      } else if (activeDay !== 'ALL' && activeDay !== 'WEEKLY_MATRIX') {
        list = list.filter((s) => s.day === activeDay);
      }
      return sortTimetableSlots(
        list.map((s) => ({
          ...s,
          classCode: s.classCode || selectedFullClass,
          subject: s.subjectName,
          topic: s.notes || 'Class Session',
          activityType: s.type || 'Lecture'
        }))
      );
    }

    let list: Array<TimetableSlot & { classCode: string; subject: string; topic: string; activityType: string }> = [];

    if (activeDay === 'TODAY') {
      list = todaySlots;
    } else if (activeDay === 'ALL') {
      list = allTeacherSlots;
    } else if (activeDay === 'WEEKLY_MATRIX') {
      list = allTeacherSlots;
    } else {
      list = getTeacherScheduleFromTimetable(timetable, teacher, activeDay);
    }

    if (filterClass !== 'ALL') {
      list = list.filter((s) => s.classCode === filterClass || s.className?.includes(filterClass));
    }

    return sortTimetableSlots(list);
  }, [scheduleScope, activeDay, todaySlots, allTeacherSlots, fullClassSlots, timetable, teacher, filterClass, todayDay, selectedFullClass]);

  // Extract unique classes and rooms assigned to this teacher
  const assignedClasses = useMemo(() => {
    const set = new Set<string>();
    allTeacherSlots.forEach((s) => {
      if (s.className) set.add(s.className);
      else if (s.classCode) set.add(`Class ${s.classCode}`);
    });
    return Array.from(set);
  }, [allTeacherSlots]);

  const assignedRooms = useMemo(() => {
    const set = new Set<string>();
    allTeacherSlots.forEach((s) => {
      if (s.roomNo) set.add(s.roomNo);
    });
    return Array.from(set);
  }, [allTeacherSlots]);

  // Count by day for tab counters
  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS_LIST.forEach((d) => {
      counts[d] = getTeacherScheduleFromTimetable(timetable, teacher, d).length;
    });
    return counts;
  }, [timetable, teacher]);

  // Handle direct navigation to take attendance for a specific class slot
  const handleLaunchAttendance = (slot: TimetableSlot & { classCode: string; subject?: string }) => {
    const targetClass = (slot.classCode === '12' ? '12' : '11') as '11' | '12';
    const targetSubject = slot.subjectName || (slot as any).subject || '';
    setActiveTeacherClass(targetClass);
    if (onNavigateToAttendance) {
      onNavigateToAttendance(targetClass, targetSubject);
    } else {
      setTeacherActiveSubTab('attendance');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Teacher Schedule Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                Live Principal Master Schedule
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Real-Time Synchronized
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-purple-400" />
              <span>{teacher?.name || 'Faculty Member'} — Teaching Schedule</span>
            </h2>

            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl font-medium">
              View when and where your daily lectures are scheduled across all classes (Class 11 & Class 12), including room numbers, timings, and principal instructions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 backdrop-blur-xs transition-all cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              title="Print personal timetable"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-purple-300">Today's Lectures</span>
            <p className="text-xl font-black text-white mt-0.5 flex items-baseline gap-1">
              <span>{todaySlots.length}</span>
              <span className="text-xs font-normal text-purple-300">periods ({todayDay})</span>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-purple-300">Weekly Total Load</span>
            <p className="text-xl font-black text-white mt-0.5 flex items-baseline gap-1">
              <span>{allTeacherSlots.length}</span>
              <span className="text-xs font-normal text-purple-300">periods / week</span>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-purple-300">Assigned Classes</span>
            <p className="text-sm font-bold text-white mt-1 truncate">
              {assignedClasses.length > 0 ? assignedClasses.join(', ') : 'Pending Principal Assignment'}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-purple-300">Assigned Rooms / Labs</span>
            <p className="text-sm font-bold text-white mt-1 truncate">
              {assignedRooms.length > 0 ? assignedRooms.join(', ') : 'Rooms Assigned by Slot'}
            </p>
          </div>
        </div>
      </div>

      {/* View Selector Tabs (Today, Monday - Saturday, Weekly Matrix) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {/* Today Button */}
          <button
            onClick={() => setActiveDay('TODAY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeDay === 'TODAY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today ({todayDay})</span>
            <span
              className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                activeDay === 'TODAY' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              {todaySlots.length}
            </span>
          </button>

          {/* Weekdays Monday - Saturday */}
          {DAYS_LIST.map((day) => {
            const count = dayCounts[day] || 0;
            const isSelected = activeDay === day;
            const isToday = todayDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {isToday && (
                  <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                    Now
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Weekly Matrix Button */}
          <button
            onClick={() => setActiveDay('WEEKLY_MATRIX')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeDay === 'WEEKLY_MATRIX'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Matrix</span>
          </button>
        </div>

        {/* Scope Toggle & Class Filter Toggle */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-neutral-700">
            <button
              onClick={() => setScheduleScope('MY_LECTURES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scheduleScope === 'MY_LECTURES'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Lectures</span>
            </button>
            <button
              onClick={() => setScheduleScope('FULL_CLASS_VIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                scheduleScope === 'FULL_CLASS_VIEW'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Full Class Routine</span>
            </button>
          </div>

          {scheduleScope === 'FULL_CLASS_VIEW' ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Class:</span>
              <div className="bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-neutral-700">
                {(['11', '12'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedFullClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedFullClass === cls
                        ? 'bg-white dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Filter:</span>
              <div className="bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-neutral-700">
                {['ALL', '11', '12'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setFilterClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterClass === cls
                        ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeDay === 'WEEKLY_MATRIX' ? (
        /* Full Weekly Timetable Matrix View */
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Weekly Lecture Distribution Matrix (Monday to Saturday)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete overview of your assigned classroom lectures and lab sessions across the entire school week.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {allTeacherSlots.length} Total Assigned Slots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-900/50">
                  <th className="py-3 px-3.5 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider w-28">
                    Day
                  </th>
                  {TEACHING_PERIODS.map((p) => (
                    <th key={p.periodNo} className="py-3 px-3 text-center">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Period {p.periodNo}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">
                        {p.startTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {DAYS_LIST.map((day) => {
                  const daySlotsForTeacher = allTeacherSlots.filter((s) => s.day === day);
                  const isTodayRow = todayDay === day;

                  return (
                    <tr
                      key={day}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isTodayRow ? 'bg-purple-50/30 dark:bg-purple-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isTodayRow && (
                            <span className="text-[8px] font-black uppercase px-1 rounded bg-amber-400 text-slate-950">
                              Today
                            </span>
                          )}
                        </div>
                      </td>

                      {TEACHING_PERIODS.map((period) => {
                        const slot = daySlotsForTeacher.find((s) => s.periodNo === period.periodNo);

                        if (!slot) {
                          return (
                            <td key={period.periodNo} className="py-2.5 px-2 text-center">
                              <span className="text-[11px] text-slate-300 dark:text-slate-600 font-medium select-none">
                                —
                              </span>
                            </td>
                          );
                        }

                        const isClass12 = slot.classCode === '12' || slot.className?.includes('12');

                        return (
                          <td key={period.periodNo} className="py-2 px-1.5">
                            <div
                              onClick={() => handleLaunchAttendance(slot)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] shadow-2xs ${
                                isClass12
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 hover:border-emerald-500'
                                  : 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 hover:border-purple-500'
                              }`}
                              title={`Click to mark attendance for ${slot.subjectName} (${slot.className || `Class ${slot.classCode}`})`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                                    isClass12
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-purple-600 text-white'
                                  }`}
                                >
                                  Class {slot.classCode}
                                </span>
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                  {slot.type === 'Lab' ? 'Lab' : 'Lec'}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                {slot.subjectName}
                              </p>
                              {slot.isCombined && (
                                <p className="text-[8px] font-bold text-purple-700 dark:text-purple-300 truncate">
                                  👥 {slot.combinedTag ? slot.combinedTag.replace('Combined ', '') : 'Combined'}
                                </p>
                              )}
                              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span>{slot.roomNo}</span>
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Daily Cards View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>
                {activeDay === 'TODAY'
                  ? `Today's Schedule (${todayDay})`
                  : activeDay === 'ALL'
                  ? 'All Scheduled Periods'
                  : `${activeDay} Schedule`}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-normal">
                {currentViewSlots.length} {currentViewSlots.length === 1 ? 'Period' : 'Periods'}
              </span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Click "Take Attendance" on any period to instantly mark student attendance.
            </p>
          </div>

          {currentViewSlots.length === 0 ? (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-10 text-center border border-dashed border-slate-200 dark:border-neutral-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Lectures Scheduled for {activeDay === 'TODAY' ? `Today (${todayDay})` : activeDay}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                The Principal has not scheduled any periods for {teacher?.name || 'you'} on this day yet. Once the Principal configures daily periods in the Master Timetable, your classes, room locations, and timings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentViewSlots.map((slot) => {
                const isClass12 = slot.classCode === '12' || slot.className?.includes('12');
                const attInfo = getSlotAttendance(slot.subjectCode || '042', slot.subjectName, todayDate, attendance);

                return (
                  <div
                    key={slot.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-purple-400 dark:hover:border-purple-600 shadow-md hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ease-in-out active:scale-[0.98] duration-150"
                  >
                    {/* Top Row: Period No, Class Badge, Day & Type */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-purple-600 text-white font-mono shadow-xs">
                            Period {slot.periodNo || 1}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                              isClass12
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                            }`}
                          >
                            Class {slot.classCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          <span>{slot.day}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300">
                            {slot.type || 'Lecture'}
                          </span>
                        </div>
                      </div>

                      {/* Subject Name */}
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {slot.subjectName}
                        </h4>
                        {slot.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                            "{slot.notes}"
                          </p>
                        )}
                      </div>

                      {/* When & Where Details Box */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">(50 mins)</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="truncate">
                            {slot.roomNo} • {slot.building || 'Senior Academic Wing'}
                          </span>
                        </div>

                        {slot.isCombined && (
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-neutral-700/60 flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-bold">
                            <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>Combined Lecture ({slot.combinedTag || 'Merged Sections'})</span>
                          </div>
                        )}
                      </div>

                      {/* Substitution Alert if any */}
                      {slot.isSubstitution && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Substitution Duty: {slot.substituteFaculty || 'Assigned by Principal'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Attendance Status & Action Button */}
                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <div className="text-[11px]">
                        {attInfo.isMarked ? (
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Attendance Taken
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Attendance Pending
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleLaunchAttendance(slot)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Take Attendance</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Synchronized Notice Footer */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            How Timetable Updates Work:
          </p>
          <p>
            This timetable is dynamically generated and synchronized in real time with the <strong>Principal Master Timetable Desk</strong>. Whenever the Principal edits room numbers, reallocates periods, or assigns substitute faculty, your schedule here updates immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

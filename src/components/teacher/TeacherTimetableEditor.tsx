import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { TimetableSlot, StudentProfile } from '../../types';
import {
  sortTimetableSlots,
  STANDARD_SCHOOL_PERIODS,
  TEACHING_PERIODS,
  getTodayDateString,
  getTodayDayName,
  getDayNameFromDateString,
  getSlotAttendance
} from '../../utils/timetableUtils';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  RotateCcw,
  Save,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

interface TeacherTimetableEditorProps {
  selectedClass: string;
  isAssignedClassTeacher: boolean;
  classStudents: StudentProfile[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const SUBJECT_OPTIONS = [
  { code: '042', name: 'Physics (Theory)', faculty: 'Mr. Rajesh Sharma', room: 'Room 101', type: 'Lecture' as const },
  { code: '042', name: 'Physics Lab & Practical', faculty: 'Mr. Rajesh Sharma', room: 'Physics Lab', type: 'Lab' as const },
  { code: '043', name: 'Chemistry (Theory)', faculty: 'Mrs. Sunita Verma', room: 'Room 101', type: 'Lecture' as const },
  { code: '043', name: 'Chemistry Lab & Experiments', faculty: 'Mrs. Sunita Verma', room: 'Chemistry Lab', type: 'Lab' as const },
  { code: '041', name: 'Mathematics', faculty: 'Mr. Vikram Singh', room: 'Room 101', type: 'Lecture' as const },
  { code: '083', name: 'Computer Science', faculty: 'Mr. Amit Kumar', room: 'Computer Lab 1', type: 'Lecture' as const },
  { code: '083', name: 'Computer Science Hands-on Lab', faculty: 'Mr. Amit Kumar', room: 'Computer Lab 1', type: 'Lab' as const },
  { code: '301', name: 'English Core', faculty: 'Mrs. Rekha Sharma', room: 'Room 101', type: 'Lecture' as const },
  { code: '044', name: 'Biology (Theory & Lab)', faculty: 'Mrs. Ananya Gupta', room: 'Biology Lab', type: 'Lecture' as const },
  { code: '048', name: 'Physical Education & Sports', faculty: 'Mr. D. S. Rawat', room: 'Sports Complex', type: 'Activity' as const },
  { code: 'YOGA', name: 'Yoga & Health Wellness', faculty: 'Mr. D. S. Rawat', room: 'Auditorium Hall', type: 'Activity' as const },
  { code: '055', name: 'Accountancy', faculty: 'Mr. Sanjay Singhania', room: 'Commerce Room 201', type: 'Lecture' as const },
  { code: '054', name: 'Business Studies', faculty: 'Mrs. Pooja Bhatia', room: 'Commerce Room 201', type: 'Lecture' as const },
  { code: '030', name: 'Economics', faculty: 'Mr. Pradeep Jain', room: 'Commerce Room 201', type: 'Lecture' as const }
];

export const TeacherTimetableEditor: React.FC<TeacherTimetableEditorProps> = ({
  selectedClass,
  isAssignedClassTeacher,
  classStudents
}) => {
  const { teacher } = useAuth();
  const {
    timetable,
    classes,
    attendance,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    clearDayTimetable,
    resetTimetableToDefaults,
    updateStudentAttendanceBatch
  } = useERP();

  const todayDay = getTodayDayName();
  const todayDate = getTodayDateString();

  const [activeDay, setActiveDay] = useState<typeof DAYS[number] | 'ALL'>(todayDay);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form state for Adding/Editing
  const [formData, setFormData] = useState({
    day: todayDay as typeof DAYS[number],
    periodNo: 1,
    subjectCode: '042',
    subjectName: 'Physics (Theory)',
    type: 'Lecture' as 'Lecture' | 'Lab' | 'Tutorial' | 'Activity',
    startTime: '08:30 AM',
    endTime: '09:20 AM',
    facultyName: teacher?.name || 'Mr. Rajesh Sharma',
    roomNo: 'Room 101',
    building: 'Senior Science Block'
  });

  // Period Attendance Modal
  const [attendanceSlot, setAttendanceSlot] = useState<TimetableSlot | null>(null);
  const [attDate, setAttDate] = useState<string>(todayDate);
  const [attTopic, setAttTopic] = useState<string>('Standard Classroom Lecture');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Handle Preset Period Selection
  const handleSelectPresetPeriod = (p: typeof TEACHING_PERIODS[0]) => {
    setFormData((prev) => ({
      ...prev,
      periodNo: p.periodNo,
      startTime: p.startTime,
      endTime: p.endTime
    }));
  };

  // Handle Preset Subject Selection
  const handleSelectPresetSubject = (s: typeof SUBJECT_OPTIONS[0]) => {
    setFormData((prev) => ({
      ...prev,
      subjectCode: s.code,
      subjectName: s.name,
      facultyName: s.faculty,
      roomNo: s.room,
      type: s.type
    }));
  };

  const openAddModal = (forDay?: typeof DAYS[number]) => {
    const dayToUse = forDay || (activeDay === 'ALL' ? todayDay : activeDay);
    const existingCount = timetable.filter((t) => t.day === dayToUse).length;
    const nextPeriod = Math.min(6, existingCount + 1);
    const preset = TEACHING_PERIODS.find((p) => p.periodNo === nextPeriod) || TEACHING_PERIODS[0];

    setFormData({
      day: dayToUse,
      periodNo: nextPeriod,
      subjectCode: '042',
      subjectName: teacher?.subjectsTaught?.[0] || 'Physics (Theory)',
      type: 'Lecture',
      startTime: preset.startTime,
      endTime: preset.endTime,
      facultyName: teacher?.name || 'Mr. Rajesh Sharma',
      roomNo: 'Room 101',
      building: 'Senior Science Block'
    });
    setEditingSlot(null);
    setShowAddModal(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      periodNo: slot.periodNo || 1,
      subjectCode: slot.subjectCode || '042',
      subjectName: slot.subjectName,
      type: slot.type as any,
      startTime: slot.startTime,
      endTime: slot.endTime,
      facultyName: slot.facultyName,
      roomNo: slot.roomNo,
      building: slot.building
    });
    setShowAddModal(true);
  };

  // Matched class object for current selectedClass prop
  const currentClassObj = useMemo(() => {
    return classes.find(
      (c) =>
        c.id === selectedClass ||
        c.className === selectedClass ||
        `${c.className} - ${c.section}` === selectedClass ||
        c.classCode === selectedClass
    ) || (selectedClass.includes('11') ? classes.find(c => c.className === 'Class 11') : classes.find(c => c.className === 'Class 12'));
  }, [classes, selectedClass]);

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectName.trim()) {
      alert('Please enter a valid subject name.');
      return;
    }

    const payload = {
      ...formData,
      className: currentClassObj ? `${currentClassObj.className} - ${currentClassObj.section}` : selectedClass,
      classCode: currentClassObj ? currentClassObj.classCode : (selectedClass.includes('11') ? '11-A' : '12-A')
    };

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, payload);
      setSuccessMessage(`Updated ${formData.subjectName} (${formData.day} • Period ${formData.periodNo})`);
    } else {
      addTimetableSlot(payload);
      setSuccessMessage(`Added ${formData.subjectName} to ${formData.day} Schedule!`);
    }

    setShowAddModal(false);
    setEditingSlot(null);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Quick Attendance Modal for a Slot
  const openSlotAttendance = (slot: TimetableSlot) => {
    setAttendanceSlot(slot);
    setAttDate(todayDate);
    setAttTopic(`${slot.subjectName} - Period ${slot.periodNo || 1}`);

    // Pre-fill statuses from existing logs or default to Present
    const initial: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    (classStudents || []).forEach((s) => {
      initial[s.studentId] = 'Present';
    });
    setStudentStatuses(initial);
  };

  const handleSaveSlotAttendance = () => {
    if (!attendanceSlot) return;
    const records = Object.entries(studentStatuses).map(([studentId, status]) => ({
      studentId,
      status
    }));

    updateStudentAttendanceBatch(
      selectedClass,
      attendanceSlot.subjectName,
      attDate,
      records
    );

    setSuccessMessage(`✅ Attendance for ${attendanceSlot.subjectName} on ${attDate} successfully recorded & synced!`);
    setAttendanceSlot(null);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Slots for active view filter - strictly isolated to current class
  const displayedSlots = useMemo(() => {
    return sortTimetableSlots(
      timetable.filter((s) => {
        if (activeDay !== 'ALL' && s.day !== activeDay) return false;

        if (currentClassObj) {
          if (s.classCode && (s.classCode === currentClassObj.classCode || s.classCode === currentClassObj.id)) return true;
          if (s.className === `${currentClassObj.className} - ${currentClassObj.section}` || s.className === currentClassObj.section) return true;
          if (s.className === currentClassObj.className && (!s.classCode || s.classCode === currentClassObj.classCode)) return true;
          return false;
        }

        const isMatch =
          s.className === selectedClass ||
          s.classCode === selectedClass ||
          (selectedClass.includes('11') && (s.className?.includes('11') || s.classCode?.startsWith('11'))) ||
          (selectedClass.includes('12') && (s.className?.includes('12') || s.classCode?.startsWith('12')));

        return isMatch;
      })
    );
  }, [timetable, activeDay, currentClassObj, selectedClass]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-800 dark:via-purple-950/40 dark:to-slate-800 p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-600 text-white font-bold shadow-xs">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Class Timetable Period Manager ({selectedClass})
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Full Monday to Saturday live schedule editor. Classes scheduled here appear directly on student apps and sync with real-time attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset timetable to standard CBSE 6-day periods in exact chronological order?')) {
                resetTimetableToDefaults();
                setSuccessMessage('Timetable reset to CBSE standard periods!');
                setTimeout(() => setSuccessMessage(''), 4000);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs ease-in-out active:scale-[0.98] transition-all duration-150"
            title="Reset to default CBSE periods"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standards</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] duration-150 ease-in-out"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule New Period</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Monday - Saturday Day Switcher Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar pb-2 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          {DAYS.map((day) => {
            const count = timetable.filter((t) => t.day === day).length;
            const isSelected = activeDay === day;
            const isToday = todayDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                    Today
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setActiveDay('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeDay === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>All 6 Days</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200">
              {timetable.length}
            </span>
          </button>
        </div>

        {activeDay !== 'ALL' && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAddModal(activeDay)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 cursor-pointer flex items-center gap-1 ease-in-out active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to {activeDay}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Clear all scheduled periods for ${activeDay} (${selectedClass})?`)) {
                  clearDayTimetable(activeDay, selectedClass);
                  setSuccessMessage(`All periods for ${activeDay} (${selectedClass}) cleared.`);
                  setTimeout(() => setSuccessMessage(''), 4000);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center gap-1 ease-in-out active:scale-[0.98] transition-all duration-150"
              title={`Clear ${activeDay}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Day</span>
            </button>
          </div>
        )}
      </div>

      {/* Timetable Period Cards Grid */}
      {displayedSlots.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-[#0a0a0a]/50 space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
            No classes scheduled for {activeDay === 'ALL' ? 'the selected days' : activeDay}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "+ Schedule New Period" to add periods (Period 1 to Period 6) or click "Reset Standards" to restore default CBSE periods.
          </p>
          <button
            onClick={() => openAddModal(activeDay === 'ALL' ? 'Monday' : activeDay)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-700 shadow-md cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98] transition-all duration-150 ease-in-out"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Period</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayedSlots.map((slot) => {
            const attInfo = getSlotAttendance(slot.subjectCode, slot.subjectName, todayDate, attendance);

            return (
              <div
                key={slot.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-[#0a0a0a] shadow-md hover:shadow-md transition-all flex flex-col justify-between group space-y-3 ease-in-out active:scale-[0.98] duration-150"
              >
                {/* Top Row: Day, Period #, Type & Time */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {slot.day}
                      </span>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        Period {slot.periodNo || 1}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-300">
                        {slot.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(slot)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        title="Edit Period Slot"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${slot.subjectName} period from ${slot.day}?`)) {
                            deleteTimetableSlot(slot.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        title="Delete Period"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Name & Timing */}
                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                    {slot.subjectName}
                  </h4>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Faculty: <strong className="text-slate-800 dark:text-slate-200">{slot.facultyName}</strong> • Room: <strong className="text-slate-800 dark:text-slate-200">{slot.roomNo}</strong> ({slot.building})
                  </p>
                  {slot.isSubstitution && (
                    <div className="mt-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-[10px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Principal Substituted: {slot.substituteFaculty}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Attendance Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {attInfo.isMarked ? (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Today: {attInfo.status}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Not Marked Today
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openSlotAttendance(slot)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-2xs active:scale-[0.98] duration-150 ease-in-out"
                    title="Take class attendance for this period"
                  >
                    <Users className="w-3 h-3" />
                    <span>Mark Attendance</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT PERIOD MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-xl rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-600 text-white font-bold">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingSlot ? 'Edit Timetable Period' : 'Schedule New Timetable Period'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets for Periods */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                Quick Select Standard School Bell Period
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {TEACHING_PERIODS.map((p) => {
                  const isMatch = formData.periodNo === p.periodNo && formData.startTime === p.startTime;
                  return (
                    <button
                      key={p.periodNo}
                      type="button"
                      onClick={() => handleSelectPresetPeriod(p)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-purple-600 text-white border-purple-600 font-black shadow-xs'
                          : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50'
                      }`}
                    >
                      <span className="text-[11px] font-black block">P-{p.periodNo}</span>
                      <span className="text-[9px] block opacity-80">{p.startTime.replace(':00', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets for CBSE Subjects */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                Quick Select Subject & Faculty
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {SUBJECT_OPTIONS.slice(0, 8).map((s) => (
                  <button
                    key={s.code + s.name}
                    type="button"
                    onClick={() => handleSelectPresetSubject(s)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-neutral-900 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 hover:text-purple-700 shrink-0 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer ease-in-out active:scale-[0.98] duration-150"
                  >
                    {s.name.split(' ')[0]} ({s.code})
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Day of Week</label>
                  <select
                    value={formData.day || 'Monday'}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Period Number</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formData.periodNo ?? 1}
                    onChange={(e) => setFormData({ ...formData, periodNo: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Period Type</label>
                  <select
                    value={formData.type || 'Lecture'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Practical Lab</option>
                    <option value="Tutorial">Tutorial / Doubts</option>
                    <option value="Activity">Activity / Sports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formData.subjectName || ''}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                    placeholder="e.g. Physics (Theory)"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Subject Code (CBSE)</label>
                  <input
                    type="text"
                    value={formData.subjectCode || ''}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-mono font-bold"
                    placeholder="e.g. 042"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                    placeholder="08:30 AM"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                    placeholder="09:20 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Faculty In-Charge</label>
                  <input
                    type="text"
                    value={formData.facultyName || ''}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Classroom / Lab</label>
                  <input
                    type="text"
                    value={formData.roomNo || ''}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                    placeholder="Room 101"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300">Campus Wing</label>
                  <input
                    type="text"
                    value={formData.building || ''}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                    placeholder="Senior Science Block"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSlot ? 'Save Changes' : 'Add to Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUICK PERIOD ATTENDANCE MODAL --- */}
      {attendanceSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-600 text-white font-bold">
                    <Users className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Mark Attendance: {attendanceSlot.subjectName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Class {selectedClass} • Period {attendanceSlot.periodNo} ({attendanceSlot.startTime} - {attendanceSlot.endTime}) • {attendanceSlot.day}
                </p>
              </div>
              <button
                onClick={() => setAttendanceSlot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date & Topic Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Attendance Session Date</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full mt-1 p-2 bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Class Topic / Unit</label>
                <input
                  type="text"
                  value={attTopic}
                  onChange={(e) => setAttTopic(e.target.value)}
                  className="w-full mt-1 p-2 bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl font-bold"
                  placeholder="e.g. Chapter 4 Numerical Problems"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allP: Record<string, 'Present'> = {};
                    classStudents.forEach((s) => { allP[s.studentId] = 'Present'; });
                    setStudentStatuses(allP);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  All Present (✅)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allA: Record<string, 'Absent'> = {};
                    classStudents.forEach((s) => { allA[s.studentId] = 'Absent'; });
                    setStudentStatuses(allA);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  All Absent (❌)
                </button>
              </div>

              <span className="text-xs font-extrabold text-slate-500">
                {(classStudents || []).length} Students in Class {selectedClass}
              </span>
            </div>

            {/* Student Roster Table */}
            <div className="border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-neutral-900 text-slate-500 uppercase font-black sticky top-0">
                  <tr>
                    <th className="p-2.5">Roll</th>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(classStudents || []).map((s) => {
                    const st = studentStatuses[s.studentId] || 'Present';
                    return (
                      <tr key={s.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all active:scale-[0.98] duration-150 ease-in-out">
                        <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{s.rollNo}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          {s.name}
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setStudentStatuses((prev) => ({ ...prev, [s.studentId]: 'Present' }))}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer ${
                                st === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-500 hover:bg-emerald-50'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentStatuses((prev) => ({ ...prev, [s.studentId]: 'Absent' }))}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer ${
                                st === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-500 hover:bg-rose-50'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudentStatuses((prev) => ({ ...prev, [s.studentId]: 'Leave' }))}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer ${
                                st === 'Leave'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-500 hover:bg-amber-50'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAttendanceSlot(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlotAttendance}
                className="px-6 py-2.5 rounded-xl font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5 text-xs active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <Save className="w-4 h-4" />
                <span>Save & Sync Attendance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { TimetableSlot, SchoolClassInfo, TeacherProfile } from '../../types';
import {
  sortTimetableSlots,
  STANDARD_SCHOOL_PERIODS,
  TEACHING_PERIODS,
  getTodayDateString,
  getTodayDayName,
  getDayNameFromDateString
} from '../../utils/timetableUtils';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  RotateCcw,
  Save,
  X,
  Check,
  AlertTriangle,
  Copy,
  UserCheck,
  Send,
  Building,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Layers,
  CalendarDays,
  Zap,
  ShieldAlert,
  Wand2
} from 'lucide-react';

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const STANDARD_CBSE_SUBJECTS = [
  { code: 'FREE', name: 'No Class (Free Period)', faculty: 'Self Study / Free Period', room: 'Classroom / Library', type: 'No Class' as const, building: 'Academic Block' },
  { code: 'HOLIDAY', name: 'School Holiday', faculty: 'Official Holiday', room: 'Campus Closed', type: 'Holiday' as const, building: 'Campus Closed' },
  { code: '042', name: 'Physics (Theory)', faculty: 'Mr. Rajesh Sharma', room: 'Room 101', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '042', name: 'Physics Lab & Practical', faculty: 'Mr. Rajesh Sharma', room: 'Physics Lab', type: 'Lab' as const, building: 'Senior Science Block' },
  { code: '043', name: 'Chemistry (Theory)', faculty: 'Mrs. Sunita Verma', room: 'Room 101', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '043', name: 'Chemistry Lab & Experiments', faculty: 'Mrs. Sunita Verma', room: 'Chemistry Lab', type: 'Lab' as const, building: 'Senior Science Block' },
  { code: '041', name: 'Mathematics', faculty: 'Mr. Vikram Singh', room: 'Room 101', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '083', name: 'Computer Science', faculty: 'Mr. Amit Kumar', room: 'Computer Lab 1', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '083', name: 'Computer Science Hands-on Lab', faculty: 'Mr. Amit Kumar', room: 'Computer Lab 1', type: 'Lab' as const, building: 'Senior Science Block' },
  { code: '301', name: 'English Core', faculty: 'Mrs. Rekha Sharma', room: 'Room 101', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '302', name: 'Hindi Core', faculty: 'Mr. Arvind Tiwari', room: 'Room 102', type: 'Lecture' as const, building: 'Senior Arts Block' },
  { code: '044', name: 'Biology (Theory & Lab)', faculty: 'Mrs. Ananya Gupta', room: 'Biology Lab', type: 'Lecture' as const, building: 'Senior Science Block' },
  { code: '048', name: 'Physical Education & Sports', faculty: 'Mr. D. S. Rawat', room: 'Sports Ground', type: 'Activity' as const, building: 'Sports Complex' },
  { code: 'YOGA', name: 'Yoga & Health Wellness', faculty: 'Mr. D. S. Rawat', room: 'Auditorium Hall', type: 'Activity' as const, building: 'Sports Complex' },
  { code: '055', name: 'Accountancy', faculty: 'Mr. Sanjay Singhania', room: 'Commerce Room 201', type: 'Lecture' as const, building: 'Commerce Wing' },
  { code: '054', name: 'Business Studies', faculty: 'Mrs. Pooja Bhatia', room: 'Commerce Room 201', type: 'Lecture' as const, building: 'Commerce Wing' },
  { code: '030', name: 'Economics', faculty: 'Mr. Pradeep Jain', room: 'Commerce Room 201', type: 'Lecture' as const, building: 'Commerce Wing' }
];

interface PrincipalTimetableManagerProps {
  initialClass?: string;
}

export const PrincipalTimetableManager: React.FC<PrincipalTimetableManagerProps> = ({ initialClass }) => {
  const {
    timetable,
    classes,
    teachers,
    staffLeaves,
    principalAddTimetableSlot,
    principalUpdateTimetableSlot,
    principalDeleteTimetableSlot,
    principalDuplicateDaySchedule,
    principalApplyClassScheduleTemplate,
    principalGenerateFullConflictFreeTimetable,
    checkTeacherAvailability,
    getTimetableConflicts,
    principalSetSlotSubstitution,
    principalClearTimetable,
    resetTimetableToDefaults,
    principalBroadcast
  } = useERP();

  const todayDay = getTodayDayName();
  const todayDate = getTodayDateString();

  // Live Timetable Conflict Analysis
  const timetableConflicts = useMemo(() => {
    return getTimetableConflicts();
  }, [timetable, getTimetableConflicts]);

  // Filters & Active Selection
  const [selectedClass, setSelectedClass] = useState<string>('cls_11_sci');
  const [classFilterCategory, setClassFilterCategory] = useState<string>('ALL');
  const [classSearchInput, setClassSearchInput] = useState<string>('');
  const [activeDay, setActiveDay] = useState<typeof DAYS_LIST[number] | 'ALL'>(todayDay);
  const [viewMode, setViewMode] = useState<'timeline' | 'weekly_matrix'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync when initialClass prop changes from top global bar
  useEffect(() => {
    if (!initialClass) return;
    if (initialClass === 'All' || initialClass === 'ALL_CLASSES') {
      setSelectedClass('ALL_CLASSES');
      setClassFilterCategory('ALL');
    } else if (initialClass === 'Class 11') {
      setSelectedClass('cls_11_sci');
      setClassFilterCategory('11');
    } else if (initialClass === 'Class 12') {
      setSelectedClass('cls_12_sci');
      setClassFilterCategory('12');
    } else if (initialClass === 'Agriculture') {
      setSelectedClass('cls_11_ag');
      setClassFilterCategory('Agriculture');
    } else {
      const match = classes.find(
        (c) =>
          c.id === initialClass ||
          c.classCode === initialClass ||
          c.className === initialClass ||
          `${c.className} - ${c.section}` === initialClass
      );
      if (match) {
        setSelectedClass(match.id);
        if (match.className === 'Class 11') setClassFilterCategory('11');
        else if (match.className === 'Class 12') setClassFilterCategory('12');
        else if (match.className === 'Class 10') setClassFilterCategory('10');
        else if (match.className === 'Class 9') setClassFilterCategory('9');
        else if (match.stream.toLowerCase().includes('agri')) setClassFilterCategory('Agriculture');
        else if (match.stream.toLowerCase().includes('comm')) setClassFilterCategory('Commerce');
      }
    }
  }, [initialClass, classes]);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedSlotForSub, setSelectedSlotForSub] = useState<TimetableSlot | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateConfirmModal, setShowTemplateConfirmModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearScope, setClearScope] = useState<'all_school' | 'selected_class' | 'selected_day'>('selected_class');

  // Success / Feedback Alert
  const [successAlert, setSuccessAlert] = useState<string>('');

  const triggerSuccess = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(''), 4500);
  };

  // Form State for Add / Edit Slot
  const [formData, setFormData] = useState({
    day: todayDay,
    periodNo: 1,
    subjectCode: '042',
    subjectName: 'Physics (Theory)',
    type: 'Lecture' as 'Lecture' | 'Lab' | 'Tutorial' | 'Activity' | 'Break' | 'No Class' | 'Holiday',
    startTime: '08:30 AM',
    endTime: '09:20 AM',
    facultyName: 'Mr. Rajesh Sharma',
    roomNo: 'Room 101',
    building: 'Senior Science Block',
    className: 'Class 11 - Section A',
    notes: '',
    color: 'bg-blue-500/10 text-blue-700 border-blue-300',
    isCombined: false,
    combinedTag: '',
    combinedWith: [] as string[]
  });

  // Live Teacher Availability Check for Add/Edit Modal
  const teacherAvailabilityStatus = useMemo(() => {
    if (!formData.facultyName) return { available: true };
    return checkTeacherAvailability(
      formData.facultyName,
      formData.day as any,
      Number(formData.periodNo),
      editingSlot?.id
    );
  }, [formData.facultyName, formData.day, formData.periodNo, editingSlot, checkTeacherAvailability, timetable]);

  // Duplicate Day State
  const [dupSourceDay, setDupSourceDay] = useState<typeof DAYS_LIST[number]>('Monday');
  const [dupTargetDays, setDupTargetDays] = useState<typeof DAYS_LIST[number][]>(['Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  // Substitution Form State
  const [subTeacherName, setSubTeacherName] = useState<string>(teachers[0]?.name || 'Mrs. Sunita Verma');
  const [subReason, setSubReason] = useState<string>('Faculty Leave / Official CBSE Evaluation Duty');

  // Broadcast Notice State
  const [broadcastAudience, setBroadcastAudience] = useState<'All' | 'Teachers' | 'Students' | 'Class 11' | 'Class 12'>('All');
  const [broadcastTitle, setBroadcastTitle] = useState('Revised Daily Timetable Notification');
  const [broadcastMessage, setBroadcastMessage] = useState('Please note that the class timetable has been updated by the Principal. Please check your schedule for today.');
  const [broadcastPriority, setBroadcastPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Class Info lookup
  const currentClassInfo = useMemo(() => {
    if (selectedClass === 'ALL_CLASSES') {
      return {
        id: 'ALL_CLASSES',
        classCode: 'ALL',
        className: 'All School Classes',
        section: 'Master School Schedule',
        classTeacherName: 'Multi-Faculty / Principal Desk',
        roomNo: 'Campus-wide',
        capacity: classes.reduce((acc, c) => acc + (c.capacity || 40), 0),
        stream: 'All Streams (Science, Commerce, Arts, Agriculture, Secondary)',
        subjects: []
      };
    }
    return (
      classes.find(
        (c) =>
          c.id === selectedClass ||
          c.classCode === selectedClass ||
          c.className === selectedClass ||
          `${c.className} - ${c.section}` === selectedClass ||
          selectedClass.includes(c.classCode) ||
          selectedClass.includes(c.id) ||
          (selectedClass === 'Class 11' && c.className === 'Class 11') ||
          (selectedClass === 'Class 12' && c.className === 'Class 12')
      ) ||
      classes[0] || {
        id: 'cls_11_sci',
        classCode: '11-A',
        className: 'Class 11',
        section: 'Section A (Science PCM + CS)',
        classTeacherName: 'Mr. Rajesh Sharma',
        roomNo: 'Room 101',
        capacity: 40,
        stream: 'Science (PCM)',
        subjects: []
      }
    );
  }, [classes, selectedClass]);

  // Filter Timetable Slots for the Selected Class
  const classFilteredSlots = useMemo(() => {
    if (selectedClass === 'ALL_CLASSES') return timetable;

    const matchedClass = classes.find(
      (c) =>
        c.id === selectedClass ||
        c.classCode === selectedClass ||
        c.className === selectedClass ||
        `${c.className} - ${c.section}` === selectedClass
    );

    return timetable.filter((slot) => {
      // General slot without class assignment applies to all
      if (!slot.className || slot.className === 'All' || slot.className === 'ALL_CLASSES') return true;

      // Combined slot check: If slot is combined and applies to selectedClass
      if (slot.isCombined) {
        if (Array.isArray(slot.combinedWith) && slot.combinedWith.length > 0) {
          const isIncludedInCombined = slot.combinedWith.some((target) => {
            if (target === selectedClass) return true;
            if (matchedClass && (target === matchedClass.id || target === matchedClass.classCode || target === `${matchedClass.className} - ${matchedClass.section}`)) return true;
            return false;
          });
          if (isIncludedInCombined) return true;
        }
        // If combinedTag specifies all sections of this grade
        if (slot.combinedTag && matchedClass) {
          const tag = slot.combinedTag.toLowerCase();
          if (tag.includes('all sections') || tag.includes('all')) {
            const isClass11 = matchedClass.className === 'Class 11' || matchedClass.classCode.startsWith('11');
            const isClass12 = matchedClass.className === 'Class 12' || matchedClass.classCode.startsWith('12');
            if (isClass11 && tag.includes('11')) return true;
            if (isClass12 && tag.includes('12')) return true;
          }
        }
        return false;
      }

      // Exact match
      if (slot.className === selectedClass || slot.classCode === selectedClass) return true;

      if (matchedClass) {
        if (slot.classCode && (slot.classCode === matchedClass.classCode || slot.classCode === matchedClass.id)) {
          return true;
        }
        if (slot.className === `${matchedClass.className} - ${matchedClass.section}` || slot.className === matchedClass.section) {
          return true;
        }
        // If slot belongs to another specific section (e.g. slot has '11-B' and matchedClass is '11-A'), do not match
        if (slot.classCode && slot.classCode !== matchedClass.classCode && (slot.classCode.includes('-') || slot.classCode.includes('_'))) {
          return false;
        }
        // If slot name contains a different section (e.g. "Section B" when viewing Section A)
        if (slot.className && slot.className.includes('Section') && !slot.className.includes(matchedClass.section)) {
          return false;
        }
        if (slot.className === matchedClass.className && (!slot.classCode || slot.classCode === matchedClass.classCode)) {
          return true;
        }
      }

      if (selectedClass === 'Class 11' && (slot.className === 'Class 11' || slot.classCode === '11')) return true;
      if (selectedClass === 'Class 12' && (slot.className === 'Class 12' || slot.classCode === '12')) return true;

      return false;
    });
  }, [timetable, selectedClass, classes]);

  // Slots for the Active Day
  const activeDaySlots = useMemo(() => {
    const dayFiltered = activeDay === 'ALL'
      ? classFilteredSlots
      : classFilteredSlots.filter((slot) => slot.day === activeDay);

    const sorted = sortTimetableSlots(dayFiltered);

    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((s) =>
      s.subjectName.toLowerCase().includes(q) ||
      s.facultyName.toLowerCase().includes(q) ||
      s.roomNo.toLowerCase().includes(q) ||
      (s.substituteFaculty && s.substituteFaculty.toLowerCase().includes(q)) ||
      s.day.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  }, [classFilteredSlots, activeDay, searchQuery]);

  // Active Substitutions
  const activeSubstitutions = useMemo(() => {
    return classFilteredSlots.filter((s) => s.isSubstitution);
  }, [classFilteredSlots]);

  // Open Add Modal with smart presets
  const handleOpenAddModal = (forDay?: typeof DAYS_LIST[number]) => {
    const dayToUse = forDay || (activeDay === 'ALL' ? 'Monday' : activeDay);
    const existingOnDay = classFilteredSlots.filter((s) => s.day === dayToUse);
    const nextPeriodNo = Math.min(6, existingOnDay.length + 1);
    const preset = TEACHING_PERIODS.find((p) => p.periodNo === nextPeriodNo) || TEACHING_PERIODS[0];

    const defaultSubject = currentClassInfo.subjects?.[0];

    setFormData({
      day: dayToUse,
      periodNo: nextPeriodNo,
      subjectCode: defaultSubject?.code || '042',
      subjectName: defaultSubject?.name || 'Physics (Theory)',
      type: 'Lecture',
      startTime: preset.startTime,
      endTime: preset.endTime,
      facultyName: defaultSubject?.teacherName || currentClassInfo.classTeacherName || 'Mr. Rajesh Sharma',
      roomNo: currentClassInfo.roomNo || 'Room 101',
      building: (currentClassInfo as any).building || 'Senior Science Block',
      className: selectedClass === 'ALL_CLASSES' ? 'All' : `${currentClassInfo.className} - ${currentClassInfo.section}`,
      notes: '',
      color: 'bg-blue-500/10 text-blue-700 border-blue-300',
      isCombined: false,
      combinedTag: '',
      combinedWith: []
    });
    setEditingSlot(null);
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      periodNo: slot.periodNo || 1,
      subjectCode: slot.subjectCode || '042',
      subjectName: slot.subjectName,
      type: slot.type || 'Lecture',
      startTime: slot.startTime,
      endTime: slot.endTime,
      facultyName: slot.facultyName,
      roomNo: slot.roomNo,
      building: slot.building || 'Senior Science Block',
      className: slot.className || (selectedClass === 'ALL_CLASSES' ? 'All' : `${currentClassInfo.className} - ${currentClassInfo.section}`),
      notes: slot.notes || '',
      color: slot.color || 'bg-blue-500/10 text-blue-700 border-blue-300',
      isCombined: Boolean(slot.isCombined),
      combinedTag: slot.combinedTag || '',
      combinedWith: slot.combinedWith || []
    });
    setShowAddEditModal(true);
  };

  // Save Slot (Add or Update)
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectName.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    const matchingCls = classes.find(
      (c) =>
        `${c.className} - ${c.section}` === formData.className ||
        c.className === formData.className ||
        c.id === formData.className ||
        c.classCode === formData.className
    ) || (selectedClass !== 'ALL_CLASSES' ? currentClassInfo : null);

    const payload = {
      ...formData,
      classCode: matchingCls ? matchingCls.classCode : (formData.className === 'All' ? 'ALL' : formData.className.includes('11') ? '11-A' : '12-A'),
      className: matchingCls ? `${matchingCls.className} - ${matchingCls.section}` : formData.className
    };

    if (editingSlot) {
      principalUpdateTimetableSlot(editingSlot.id, payload, true);
      triggerSuccess(`Period ${payload.periodNo} (${payload.subjectName}) updated on ${payload.day} for ${payload.className}!`);
    } else {
      principalAddTimetableSlot(payload, true);
      triggerSuccess(`Period ${payload.periodNo} (${payload.subjectName}) added to ${payload.day} for ${payload.className}!`);
    }

    setShowAddEditModal(false);
    setEditingSlot(null);
  };

  // Delete Slot
  const handleDeleteSlot = (slot: TimetableSlot) => {
    if (window.confirm(`Are you sure you want to remove ${slot.subjectName} (${slot.day} • Period ${slot.periodNo})?`)) {
      principalDeleteTimetableSlot(slot.id);
      triggerSuccess(`Removed ${slot.subjectName} from ${slot.day} schedule.`);
    }
  };

  // Duplicate Day Schedule
  const handleExecuteDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (dupTargetDays.length === 0) {
      alert('Please select at least one target day to copy schedule to.');
      return;
    }

    principalDuplicateDaySchedule(
      dupSourceDay,
      dupTargetDays,
      selectedClass === 'ALL_CLASSES' ? undefined : selectedClass
    );

    setShowDuplicateModal(false);
    triggerSuccess(`Successfully copied ${dupSourceDay}'s schedule to ${dupTargetDays.join(', ')} for ${selectedClass}!`);
  };

  // Apply Substitution
  const handleOpenSubstitution = (slot: TimetableSlot) => {
    setSelectedSlotForSub(slot);
    setSubTeacherName(teachers.find((t) => t.name !== slot.facultyName)?.name || 'Mrs. Sunita Verma');
    setSubReason('Faculty on Leave / Deputed to Exam Duty');
    setShowSubstitutionModal(true);
  };

  const handleSaveSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForSub) return;

    principalSetSlotSubstitution(selectedSlotForSub.id, subTeacherName, subReason);
    setShowSubstitutionModal(false);
    triggerSuccess(`Substitute teacher ${subTeacherName} assigned for ${selectedSlotForSub.subjectName} (Period ${selectedSlotForSub.periodNo})!`);
  };

  // Quick Clear Substitution
  const handleClearSubstitution = (slotId: string) => {
    principalUpdateTimetableSlot(slotId, {
      isSubstitution: false,
      substituteFaculty: undefined,
      notes: ''
    });
    triggerSuccess(`Substitution cleared. Regular faculty restored for this slot.`);
  };

  // Apply CBSE Standard Template for selected single section
  const handleApplyTemplate = (target?: string) => {
    const targetToUse = target || selectedClass;
    principalApplyClassScheduleTemplate(targetToUse);
    setShowTemplateConfirmModal(false);
    const label = targetToUse === 'ALL_CLASSES' ? 'All Classes' : targetToUse;
    triggerSuccess(`Weekly conflict-free timetable applied strictly for ${label}! Synced across student & faculty portals.`);
  };

  // Full 9th to 12th Conflict-Free Timetable Generator
  const handleGenerateAllClassesConflictFree = () => {
    const res = principalGenerateFullConflictFreeTimetable();
    setShowTemplateConfirmModal(false);
    triggerSuccess(`🎉 Weekly conflict-free timetable generated for all ${res.totalClasses} classes (9th to 12th)! ${res.totalSlots} total periods created with 0 teacher conflicts.`);
  };

  // Broadcast Notice
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    principalBroadcast(broadcastAudience, broadcastTitle, broadcastMessage, broadcastPriority);
    setShowBroadcastModal(false);
    triggerSuccess(`Timetable update notification broadcasted to ${broadcastAudience}!`);
  };

  const handleExecuteClear = () => {
    if (clearScope === 'all_school') {
      principalClearTimetable();
      triggerSuccess('All timetable slots across all classes and days cleared completely.');
    } else if (clearScope === 'selected_class') {
      principalClearTimetable(selectedClass, 'ALL');
      triggerSuccess(`All timetable slots for ${selectedClass} cleared completely.`);
    } else if (clearScope === 'selected_day') {
      principalClearTimetable(selectedClass, activeDay === 'ALL' ? undefined : activeDay);
      triggerSuccess(`Timetable slots for ${selectedClass} on ${activeDay} cleared.`);
    }
    setShowClearModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Success Notification Alert Bar */}
      {successAlert && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Principal Master Timetable Sync
              </p>
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">{successAlert}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessAlert('')}
            className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 transition-colors active:scale-[0.98] duration-150 ease-in-out"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header & Live Sync Command Strip - Clean White Theme */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-neutral-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Principal Timetable Director Desk
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Auto-Sync Active (Students & Teachers)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white tracking-tight">
              Class-wise Daily & Weekly Timetable Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
              Create, edit, and publish daily lecture schedules per class. Any adjustments or substitutions made here are automatically synced and displayed live in student and teacher portals.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              id="principal-btn-add-period"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Period Slot</span>
            </button>

            <button
              onClick={() => setShowTemplateConfirmModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              title="Auto-generate conflict-free timetable for all 9th-12th classes or selected class"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>⚡ Conflict-Free Auto-Fill</span>
            </button>

            <button
              onClick={() => setShowDuplicateModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              title="Clone one day's timetable to multiple days"
            >
              <Copy className="w-4 h-4 text-blue-500" />
              <span>Clone Day</span>
            </button>

            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              title="Broadcast timetable update notice to classes"
            >
              <Megaphone className="w-4 h-4 text-rose-500" />
              <span>Broadcast Alert</span>
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              title="Clear/Wipe timetable slots"
            >
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Clear Schedule</span>
            </button>
          </div>
        </div>

        {/* 5 Summary Stats including Live Conflict Monitor */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-700/60">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Total Periods
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {classFilteredSlots.length} Slots{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({activeDaySlots.length} today)</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-700/60">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Active Class
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
              {selectedClass === 'ALL_CLASSES' ? 'All Classes (Master)' : `${currentClassInfo.className} • ${currentClassInfo.classCode || currentClassInfo.section}`}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-700/60">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Class Incharge
            </span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
              {currentClassInfo.classTeacherName || 'Mr. Rajesh Sharma'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-700/60">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Daily Substitutions
            </span>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
              {activeSubstitutions.length} Active{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Adjustments</span>
            </p>
          </div>

          {/* Conflict-Free Status Monitor Card */}
          <div className={`p-3 rounded-2xl border ${
            timetableConflicts.length === 0
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {timetableConflicts.length === 0 ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              )}
              Teacher Clashes
            </span>
            <p className={`text-lg font-black mt-1 ${
              timetableConflicts.length === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}>
              {timetableConflicts.length === 0 ? '0 Clashes' : `${timetableConflicts.length} Conflicts!`}
              <span className="block text-[10px] font-medium opacity-85">
                {timetableConflicts.length === 0 ? '9th-12th Conflict-Free' : 'Overlap detected'}
              </span>
            </p>
          </div>
        </div>

        {/* Live Conflict Warning & Resolution Banner if any manual conflict is present */}
        {timetableConflicts.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  {timetableConflicts.length} Teacher Double-Booking Detected (9th to 12th)
                </p>
                <div className="text-xs font-medium text-rose-800 dark:text-rose-200 mt-0.5 space-y-0.5">
                  {(timetableConflicts || []).slice(0, 2).map((c, idx) => {
                    const slotClasses = c.conflictingSlots || c.classes || [];
                    return (
                      <p key={idx}>
                        • <span className="font-bold">{c.teacherName}</span> is double-booked on <span className="font-semibold">{c.day} Period {c.periodNo}</span> in {slotClasses.map((s) => s.className || s.classCode).join(' and ')}.
                      </p>
                    );
                  })}
                  {timetableConflicts.length > 2 && (
                    <p className="text-[11px] italic">...and {timetableConflicts.length - 2} more conflict(s).</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateAllClassesConflictFree}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
            >
              <Wand2 className="w-4 h-4" />
              <span>Auto-Resolve (Regenerate 100% Conflict-Free)</span>
            </button>
          </div>
        )}
      </div>

      {/* Class Switcher & Day Navigation Toolbar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-4">
        {/* Row 1: Target Class Selector Header & Filter Controls */}
        <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    School Class Sections & Streams
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {classes.length} Total Classes
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Select any class to manage its weekly routine, assign faculty, or configure CBSE subjects
                </p>
              </div>
            </div>

            {/* Quick Stream Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              {[
                { id: 'ALL', label: `All (${classes.length})` },
                { id: '12', label: `Class 12 (${classes.filter((c) => c.className === 'Class 12').length})` },
                { id: '11', label: `Class 11 (${classes.filter((c) => c.className === 'Class 11').length})` },
                { id: '10', label: `Class 10 (${classes.filter((c) => c.className === 'Class 10').length})` },
                { id: '9', label: `Class 9 (${classes.filter((c) => c.className === 'Class 9').length})` },
                { id: 'Agriculture', label: '🌾 Agriculture' },
                { id: 'Commerce', label: '📊 Commerce' },
                { id: 'Science', label: '🧪 Science' },
                { id: 'Humanities', label: '🎨 Arts' }
              ].map((pill) => {
                const isActive = classFilterCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setClassFilterCategory(pill.id);
                      if (pill.id === 'ALL') {
                        return;
                      }
                      let target: SchoolClassInfo | undefined;
                      if (pill.id === '12') target = classes.find((c) => c.className === 'Class 12');
                      else if (pill.id === '11') target = classes.find((c) => c.className === 'Class 11');
                      else if (pill.id === '10') target = classes.find((c) => c.className === 'Class 10');
                      else if (pill.id === '9') target = classes.find((c) => c.className === 'Class 9');
                      else if (pill.id === 'Agriculture') target = classes.find((c) => c.stream.toLowerCase().includes('agri'));
                      else if (pill.id === 'Commerce') target = classes.find((c) => c.stream.toLowerCase().includes('comm'));
                      else if (pill.id === 'Science') target = classes.find((c) => c.stream.toLowerCase().includes('sci') || c.stream.toLowerCase().includes('pcm') || c.stream.toLowerCase().includes('pcb'));
                      else if (pill.id === 'Humanities') target = classes.find((c) => c.stream.toLowerCase().includes('art') || c.stream.toLowerCase().includes('human'));

                      if (target) {
                        setSelectedClass(target.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Selector Grid: Every Single Class in School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {/* Master View (All Classes) Card */}
            <button
              onClick={() => setSelectedClass('ALL_CLASSES')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedClass === 'ALL_CLASSES'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-slate-50 dark:bg-neutral-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    selectedClass === 'ALL_CLASSES' ? 'bg-white/20 text-white dark:bg-[#0a0a0a]/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    🌐 MASTER VIEW
                  </span>
                  <p className="text-sm font-black mt-1">All School Classes</p>
                </div>
                {selectedClass === 'ALL_CLASSES' && (
                  <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] opacity-80">
                <span>Campus-wide master routine</span>
                <span className="font-mono font-bold">{timetable.length} Slots</span>
              </div>
            </button>

            {/* Individual School Classes */}
            {classes
              .filter((c) => {
                if (classFilterCategory === 'ALL') return true;
                if (classFilterCategory === '12') return c.className === 'Class 12';
                if (classFilterCategory === '11') return c.className === 'Class 11';
                if (classFilterCategory === '10') return c.className === 'Class 10';
                if (classFilterCategory === '9') return c.className === 'Class 9';
                if (classFilterCategory === 'Agriculture') return c.stream.toLowerCase().includes('agri');
                if (classFilterCategory === 'Commerce') return c.stream.toLowerCase().includes('comm');
                if (classFilterCategory === 'Science') return c.stream.toLowerCase().includes('sci') || c.stream.toLowerCase().includes('pcm') || c.stream.toLowerCase().includes('pcb');
                if (classFilterCategory === 'Humanities') return c.stream.toLowerCase().includes('art') || c.stream.toLowerCase().includes('human');
                return true;
              })
              .map((c) => {
                const isSelected =
                  selectedClass === c.id ||
                  selectedClass === c.className ||
                  selectedClass === `${c.className} - ${c.section}` ||
                  (selectedClass === 'Class 11' && c.className === 'Class 11' && c.id === 'cls_11_sci') ||
                  (selectedClass === 'Class 12' && c.className === 'Class 12' && c.id === 'cls_12_sci');

                // Stream icon
                let streamIcon = '📚';
                if (c.stream.toLowerCase().includes('agri')) streamIcon = '🌾';
                else if (c.stream.toLowerCase().includes('pcm') || c.stream.toLowerCase().includes('cs')) streamIcon = '🧪';
                else if (c.stream.toLowerCase().includes('pcb') || c.stream.toLowerCase().includes('bio')) streamIcon = '🔬';
                else if (c.stream.toLowerCase().includes('comm')) streamIcon = '📊';
                else if (c.stream.toLowerCase().includes('art') || c.stream.toLowerCase().includes('human')) streamIcon = '🎨';
                else if (c.className.includes('9')) streamIcon = '📖';

                // Slots count for this specific class
                const classSlotCount = timetable.filter((s) => {
                  if (s.classCode && (s.classCode === c.classCode || s.classCode === c.id)) return true;
                  if (s.className === c.className && (!s.classCode || s.classCode === c.classCode)) return true;
                  if (s.className === `${c.className} - ${c.section}`) return true;
                  return false;
                }).length;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClass(c.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                        : 'bg-slate-50 dark:bg-neutral-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{streamIcon}</span>
                          <span className="text-xs font-black truncate">
                            {c.className} • {c.classCode || c.section.split(' ')[0] || ''}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold opacity-90 truncate mt-0.5">
                          {c.section}
                        </p>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-mono opacity-60 font-bold shrink-0">
                          {c.roomNo?.replace('Room ', 'R-') || ''}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-neutral-700/50 flex items-center justify-between text-[11px] gap-2">
                      <span className="truncate font-medium opacity-85">
                        {c.classTeacherName || 'Class Incharge'}
                      </span>
                      <span className="font-mono font-bold shrink-0 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-neutral-800/50 text-[10px]">
                        {classSlotCount} slots
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Active Class Summary Strip & View Modes */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Active Selection:
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                {currentClassInfo.className} {currentClassInfo.section ? `• ${currentClassInfo.section}` : ''}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                ({currentClassInfo.stream} • Incharge: {currentClassInfo.classTeacherName} • {currentClassInfo.roomNo})
              </span>
            </div>

            {/* View Mode Toggle (Timeline vs Weekly Grid) */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Daily Timeline</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('weekly_matrix');
                  setActiveDay('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'weekly_matrix'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Weekly Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Day Selector & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Day of Week Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Day:
            </span>
            {DAYS_LIST.map((day) => {
              const isSelected = activeDay === day;
              const isToday = day === todayDay;
              const count = classFilteredSlots.filter((s) => s.day === day).length;
              return (
                <button
                  key={day}
                  onClick={() => {
                    setActiveDay(day);
                    if (viewMode === 'weekly_matrix') setViewMode('timeline');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-black ${isSelected ? 'bg-white/20 text-amber-300 dark:bg-[#0a0a0a]/20 dark:text-amber-600' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                      Today
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${isSelected ? 'bg-white/20 text-white dark:bg-[#0a0a0a]/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setActiveDay('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeDay === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>All 6 Days</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${activeDay === 'ALL' ? 'bg-white/20 text-white dark:bg-[#0a0a0a]/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'}`}>
                {classFilteredSlots.length}
              </span>
            </button>
          </div>

          {/* Search Query */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject, faculty, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Active Substitutions Banner (If Any) */}
      {activeSubstitutions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Active Faculty Substitutions for {selectedClass === 'ALL_CLASSES' ? 'School' : selectedClass} ({activeSubstitutions.length})
              </h4>
            </div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Auto-notified to Students & Faculty
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {activeSubstitutions.map((sub) => (
              <div key={sub.id} className="p-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {sub.day} • Period {sub.periodNo}: {sub.subjectName}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Substituted by: <span className="font-bold">{sub.substituteFaculty}</span>
                  </p>
                  {sub.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[200px]">
                      Note: {sub.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleClearSubstitution(sub.id)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-colors shrink-0 ml-2 active:scale-[0.98] duration-150 ease-in-out"
                  title="Clear substitution and restore original faculty"
                >
                  Clear Sub
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule View: Mode 1 - Daily Timeline Cards */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {activeDay === 'ALL' ? 'Weekly Timetable Overview' : `${activeDay} Schedule (${selectedClass})`}
              </h3>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {activeDaySlots.length} Periods Configured
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal(activeDay === 'ALL' ? 'Monday' : activeDay)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period to {activeDay === 'ALL' ? 'Schedule' : activeDay}</span>
              </button>
            </div>
          </div>

          {activeDaySlots.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0a0a0a] border border-dashed border-slate-300 dark:border-neutral-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Periods Scheduled for {activeDay === 'ALL' ? 'this filter' : activeDay}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You can add individual periods manually or click "CBSE Auto-Fill" to generate a standard 6-period daily routine instantly.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenAddModal(activeDay === 'ALL' ? 'Monday' : activeDay)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-500 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Add Period Slot
                </button>
                <button
                  onClick={() => setShowTemplateConfirmModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Generate CBSE Schedule
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeDaySlots.map((slot) => {
                const isSubstituted = slot.isSubstitution;
                const isHoliday = slot.type === 'Holiday' || (slot.subjectName && slot.subjectName.toLowerCase().includes('holiday'));
                const isNoClass = slot.type === 'No Class' || (slot.subjectName && (slot.subjectName.toLowerCase().includes('no class') || slot.subjectName.toLowerCase().includes('free period')));

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between group ${
                      isHoliday
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10'
                        : isNoClass
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10'
                        : isSubstituted
                        ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/30'
                        : 'border-slate-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                    }`}
                  >
                    {/* Top Stripe: Day, Period No, Timing */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono shadow-2xs ${
                            isHoliday ? 'bg-rose-600 text-white' : isNoClass ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                            Period {slot.periodNo || 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 font-mono">
                            {slot.day}
                          </span>
                        </div>

                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md font-mono border ${
                          isHoliday
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                            : isNoClass
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-neutral-700'
                        }`}>
                          {isHoliday ? '🏖️ Holiday' : isNoClass ? '🚫 No Class' : slot.type}
                        </span>
                      </div>

                      {/* Time Interval & Class */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded">
                          {slot.className || selectedClass}
                        </span>
                      </div>

                      {/* Subject Name & Code */}
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                        {isHoliday && <span>🏖️</span>}
                        {isNoClass && <span>🚫</span>}
                        <span>{slot.subjectName}</span>
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">
                        Code: {slot.subjectCode} • {slot.roomNo} ({slot.building || 'Science Block'})
                      </p>

                      {/* Combined Session Indicator */}
                      {slot.isCombined && (
                        <div className="mt-2 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">Combined: {slot.combinedTag || 'Joint Class'}</span>
                        </div>
                      )}

                      {/* Faculty Info & Substitution Callout */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isHoliday ? 'Status:' : isNoClass ? 'Instruction:' : 'Regular Faculty:'}
                          </span>
                          <span className={`font-bold ${isHoliday ? 'text-rose-600 dark:text-rose-400' : isNoClass ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {slot.facultyName}
                          </span>
                        </div>

                        {isSubstituted && (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Substitute:
                              </span>
                              <span className="font-bold text-amber-900 dark:text-amber-200">
                                {slot.substituteFaculty}
                              </span>
                            </div>
                            {slot.notes && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-0.5">
                                Reason: {slot.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(slot)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-neutral-900 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
                          title="Edit slot details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleOpenSubstitution(slot)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1 cursor-pointer ease-in-out active:scale-[0.98] duration-150"
                          title="Assign daily substitute faculty"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Substitute</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteSlot(slot)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule View: Mode 2 - Weekly Matrix Grid View */}
      {viewMode === 'weekly_matrix' && (
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Full Week Period Matrix ({selectedClass})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Click any cell to edit or assign substitute
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
                <th className="p-3 font-bold text-slate-500 dark:text-slate-400 uppercase w-24">Day</th>
                {[1, 2, 3, 4, 5, 6].map((pNo) => {
                  const preset = TEACHING_PERIODS.find((p) => p.periodNo === pNo) || TEACHING_PERIODS[0];
                  return (
                    <th key={pNo} className="p-3 font-bold text-slate-700 dark:text-slate-300">
                      <div className="font-black text-indigo-600 dark:text-indigo-400">P{pNo}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        {preset.startTime}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DAYS_LIST.map((day) => {
                const daySlots = classFilteredSlots.filter((s) => s.day === day);
                const isToday = day === todayDay;
                return (
                  <tr key={day} className={isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white align-top">
                      <div className="flex items-center gap-1.5">
                        <span>{day.slice(0, 3)}</span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-normal block mt-0.5">
                        {daySlots.length} Slots
                      </span>
                    </td>
                    {[1, 2, 3, 4, 5, 6].map((pNo) => {
                      const slot = daySlots.find((s) => s.periodNo === pNo);
                      if (!slot) {
                        return (
                          <td key={pNo} className="p-2 align-top">
                            <button
                              onClick={() => {
                                const preset = TEACHING_PERIODS.find((p) => p.periodNo === pNo) || TEACHING_PERIODS[0];
                                setFormData({
                                  day,
                                  periodNo: pNo,
                                  subjectCode: '042',
                                  subjectName: 'Physics (Theory)',
                                  type: 'Lecture',
                                  startTime: preset.startTime,
                                  endTime: preset.endTime,
                                  facultyName: 'Mr. Rajesh Sharma',
                                  roomNo: 'Room 101',
                                  building: 'Senior Science Block',
                                  className: selectedClass === 'ALL_CLASSES' ? 'Class 11' : selectedClass,
                                  notes: '',
                                  color: 'bg-blue-500/10 text-blue-700 border-blue-300',
                                  isCombined: false,
                                  combinedTag: '',
                                  combinedWith: []
                                });
                                setEditingSlot(null);
                                setShowAddEditModal(true);
                              }}
                              className="w-full h-18 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-600 flex flex-col items-center justify-center transition-all cursor-pointer ease-in-out active:scale-[0.98] duration-150"
                              title={`Add period ${pNo} on ${day}`}
                            >
                              <Plus className="w-3.5 h-3.5 mb-0.5" />
                              <span className="text-[9px] font-bold">Add</span>
                            </button>
                          </td>
                        );
                      }

                      const isSlotHoliday = slot.type === 'Holiday' || (slot.subjectName && slot.subjectName.toLowerCase().includes('holiday'));
                      const isSlotNoClass = slot.type === 'No Class' || (slot.subjectName && (slot.subjectName.toLowerCase().includes('no class') || slot.subjectName.toLowerCase().includes('free period')));

                      return (
                        <td key={pNo} className="p-2 align-top">
                          <div
                            onClick={() => handleOpenEditModal(slot)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm flex flex-col justify-between h-20 ${
                              isSlotHoliday
                                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
                                : isSlotNoClass
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800'
                                : slot.isSubstitution
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
                                : 'bg-slate-50 dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-700 hover:border-indigo-400'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white truncate leading-snug flex items-center gap-1">
                                {isSlotHoliday && <span>🏖️</span>}
                                {isSlotNoClass && <span>🚫</span>}
                                <span>{slot.subjectName}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {isSlotHoliday
                                  ? 'Campus Closed'
                                  : isSlotNoClass
                                  ? 'Self Study / Free'
                                  : slot.isSubstitution
                                  ? `Sub: ${slot.substituteFaculty}`
                                  : slot.facultyName}
                              </p>
                              {slot.isCombined && (
                                <p className="text-[8px] font-black text-purple-700 dark:text-purple-300 truncate mt-0.5">
                                  👥 {slot.combinedTag ? slot.combinedTag.replace('Combined ', '') : 'Combined'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                              <span>{isSlotHoliday ? 'Off' : slot.roomNo}</span>
                              <span className={`font-bold uppercase ${isSlotHoliday ? 'text-rose-600 dark:text-rose-400' : isSlotNoClass ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {isSlotHoliday ? 'HOL' : isSlotNoClass ? 'FREE' : slot.type.slice(0, 3)}
                              </span>
                            </div>
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
      )}

      {/* --- MODAL 1: ADD / EDIT PERIOD SLOT --- */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingSlot ? 'Edit Timetable Period' : 'Add New Timetable Period'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Institutional Schedule Sync • Visible to Students & Teachers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-[0.98] duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Presets Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Quick Preset Period Fill:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-neutral-900/60 rounded-xl border border-slate-200 dark:border-neutral-700">
                {/* Special Quick Action: No Class */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      subjectCode: 'FREE',
                      subjectName: 'No Class (Free Period)',
                      facultyName: 'Self Study / Free Period',
                      roomNo: 'Classroom / Library',
                      type: 'No Class',
                      building: 'Academic Block'
                    }));
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 transition-all cursor-pointer flex items-center gap-1 shadow-2xs ease-in-out active:scale-[0.98] duration-150"
                >
                  <span>🚫</span>
                  <span>No Class (Free Period)</span>
                </button>

                {/* Special Quick Action: Holiday */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      subjectCode: 'HOLIDAY',
                      subjectName: 'School Holiday',
                      facultyName: 'Official Holiday',
                      roomNo: 'Campus Closed',
                      type: 'Holiday',
                      building: 'Campus Closed'
                    }));
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-700 transition-all cursor-pointer flex items-center gap-1 shadow-2xs ease-in-out active:scale-[0.98] duration-150"
                >
                  <span>🏖️</span>
                  <span>Holiday (School Off)</span>
                </button>

                {/* Dynamically show current class subjects first */}
                {currentClassInfo.subjects && currentClassInfo.subjects.map((sub) => (
                  <button
                    key={`cls_sub_${sub.code}_${sub.name}`}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        subjectCode: sub.code,
                        subjectName: sub.name,
                        facultyName: sub.teacherName || prev.facultyName,
                        roomNo: currentClassInfo.roomNo || prev.roomNo,
                        type: sub.name.toLowerCase().includes('lab') || sub.name.toLowerCase().includes('practical') ? 'Lab' : 'Lecture',
                        building: (currentClassInfo as any).building || prev.building
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1 ease-in-out active:scale-[0.98] duration-150"
                  >
                    <span className="font-mono text-[9px] opacity-75">{sub.code}</span>
                    <span>{sub.name}</span>
                  </button>
                ))}

                {STANDARD_CBSE_SUBJECTS.filter((s) => s.code !== 'FREE' && s.code !== 'HOLIDAY').map((sub) => (
                  <button
                    key={`${sub.code}_${sub.name}`}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        subjectCode: sub.code,
                        subjectName: sub.name,
                        facultyName: sub.faculty,
                        roomNo: sub.room,
                        type: sub.type,
                        building: sub.building
                      }));
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {DAYS_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Class Section
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => {
                      const targetVal = e.target.value;
                      const matchingCls = classes.find(
                        (c) =>
                          c.id === targetVal ||
                          c.className === targetVal ||
                          `${c.className} - ${c.section}` === targetVal ||
                          c.classCode === targetVal
                      );
                      setFormData({
                        ...formData,
                        className: targetVal,
                        roomNo: matchingCls?.roomNo || formData.roomNo,
                        building: matchingCls?.building || formData.building,
                        facultyName: matchingCls?.classTeacherName || formData.facultyName
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="All">All School Classes (Master)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={`${c.className} - ${c.section}`}>
                        {c.className} • {c.section} ({c.stream})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Period # and Timing Presets */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Period Number
                  </label>
                  <select
                    value={formData.periodNo ?? 1}
                    onChange={(e) => {
                      const pNo = Number(e.target.value);
                      const preset = TEACHING_PERIODS.find((p) => p.periodNo === pNo);
                      setFormData({
                        ...formData,
                        periodNo: pNo,
                        startTime: preset?.startTime || formData.startTime || '08:30 AM',
                        endTime: preset?.endTime || formData.endTime || '09:20 AM'
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        Period {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    placeholder="08:30 AM"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    placeholder="09:20 AM"
                  />
                </div>
              </div>

              {/* Subject Details */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subjectName || ''}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    placeholder="e.g. Physics (Theory)"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={formData.subjectCode || ''}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    placeholder="042"
                  />
                </div>
              </div>

              {/* Faculty & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Faculty
                  </label>
                  <select
                    value={formData.facultyName || ''}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </select>

                  {/* Live Teacher Clash Detection Indicator */}
                  {formData.type !== 'No Class' && formData.type !== 'Holiday' && formData.type !== 'Break' && (
                    <div className="mt-1.5">
                      {teacherAvailabilityStatus.available ? (
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Teacher Available ({formData.day} Period {formData.periodNo})</span>
                        </p>
                      ) : (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[10px] text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Clash Alert: </span>
                            {formData.facultyName} is already assigned in <span className="font-semibold">{teacherAvailabilityStatus.conflictWithClass}</span> ({teacherAvailabilityStatus.conflictSubject}) on {formData.day} Period {formData.periodNo}!
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Period Type
                  </label>
                  <select
                    value={formData.type || 'Lecture'}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      let autoSubject = formData.subjectName;
                      let autoCode = formData.subjectCode;
                      let autoFaculty = formData.facultyName;
                      let autoRoom = formData.roomNo;
                      let autoBuilding = formData.building;

                      if (newType === 'No Class') {
                        autoSubject = 'No Class (Free Period)';
                        autoCode = 'FREE';
                        autoFaculty = 'Self Study / Free Period';
                        autoRoom = 'Classroom / Library';
                        autoBuilding = 'Academic Block';
                      } else if (newType === 'Holiday') {
                        autoSubject = 'School Holiday';
                        autoCode = 'HOLIDAY';
                        autoFaculty = 'Official Holiday';
                        autoRoom = 'Campus Closed';
                        autoBuilding = 'Campus Closed';
                      }

                      setFormData({
                        ...formData,
                        type: newType,
                        subjectName: autoSubject,
                        subjectCode: autoCode,
                        facultyName: autoFaculty,
                        roomNo: autoRoom,
                        building: autoBuilding
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Lecture">Lecture (Classroom)</option>
                    <option value="Lab">Laboratory / Practical</option>
                    <option value="Tutorial">Tutorial / Doubt Session</option>
                    <option value="Activity">Physical Activity / Sports</option>
                    <option value="Break">Recess / Lunch Break</option>
                    <option value="No Class">🚫 No Class (Free Period / Off)</option>
                    <option value="Holiday">🏖️ Holiday (School Closed / Off)</option>
                  </select>
                </div>
              </div>

              {/* Room & Building */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.roomNo || ''}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    placeholder="Room 101 / Lab 1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Building Block
                  </label>
                  <input
                    type="text"
                    value={formData.building || ''}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    placeholder="Senior Science Block"
                  />
                </div>
              </div>

              {/* Combined Lecture (Senior School Co-Teaching / Merged Sections) */}
              <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none active:scale-[0.98] transition-all duration-150 ease-in-out">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isCombined)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          isCombined: checked,
                          combinedTag: checked && !formData.combinedTag ? 'Combined Science (PCM + PCB)' : formData.combinedTag
                        });
                      }}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                    />
                    <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Combined Class Lecture (Merged Sections)
                    </span>
                  </label>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 font-mono">
                    CBSE Multi-Section
                  </span>
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium leading-relaxed">
                  Enable when the same teacher teaches identical subjects simultaneously to multiple sections (e.g. Physics for 11 PCM + PCB, or English for Commerce + Arts) in one joint lecture hall.
                </p>

                {formData.isCombined && (
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-800/60 space-y-3">
                    {/* Multi-Section Checkboxes */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-purple-900 dark:text-purple-200 block">
                          Select Sections to Include in Combined Lecture:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            // Detect grade level (11 or 12 or 10 or 9)
                            const is11 = formData.className.includes('11') || currentClassInfo.className.includes('11');
                            const is12 = formData.className.includes('12') || currentClassInfo.className.includes('12');
                            const sameGradeClasses = classes.filter((c) => {
                              if (is11) return c.className === 'Class 11' || c.classCode.startsWith('11');
                              if (is12) return c.className === 'Class 12' || c.classCode.startsWith('12');
                              return true;
                            });
                            const allSameGradeIds = sameGradeClasses.map((c) => c.id);
                            const allSelected = allSameGradeIds.every((id) => (formData.combinedWith || []).includes(id));
                            setFormData({
                              ...formData,
                              combinedWith: allSelected ? [] : allSameGradeIds
                            });
                          }}
                          className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                        >
                          Select All Same-Grade Sections
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 bg-white/80 dark:bg-[#0a0a0a]/80 rounded-xl border border-purple-200 dark:border-purple-800/60 max-h-36 overflow-y-auto">
                        {classes.map((c) => {
                          const isChecked = (formData.combinedWith || []).includes(c.id) ||
                            (formData.className === `${c.className} - ${c.section}`);
                          return (
                            <label
                              key={c.id}
                              className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentList = new Set(formData.combinedWith || []);
                                  if (e.target.checked) {
                                    currentList.add(c.id);
                                  } else {
                                    currentList.delete(c.id);
                                  }
                                  setFormData({
                                    ...formData,
                                    combinedWith: Array.from(currentList)
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                              />
                              <span className="truncate">
                                {c.className} • {c.section.split(' ')[0]} ({c.stream.split(' ')[0]})
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-purple-900 dark:text-purple-200 block mb-1">
                        Combined Session Tag / Label:
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {[
                          'Combined Class 11 (All Sections)',
                          'Combined Class 12 (All Sections)',
                          'Combined Science (PCM + PCB)',
                          'Combined Commerce + Arts',
                          'Senior Joint Lecture',
                          'Joint Practical / Lab Batch'
                        ].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              let targetIds = [...(formData.combinedWith || [])];
                              if (tag.includes('Class 11')) {
                                targetIds = classes.filter((c) => c.className === 'Class 11' || c.classCode.startsWith('11')).map((c) => c.id);
                              } else if (tag.includes('Class 12')) {
                                targetIds = classes.filter((c) => c.className === 'Class 12' || c.classCode.startsWith('12')).map((c) => c.id);
                              } else if (tag.includes('Science')) {
                                targetIds = classes.filter((c) => c.stream.includes('Science') || c.section.includes('PCM') || c.section.includes('PCB')).map((c) => c.id);
                              } else if (tag.includes('Commerce + Arts')) {
                                targetIds = classes.filter((c) => c.stream.includes('Commerce') || c.stream.includes('Humanities') || c.stream.includes('Arts')).map((c) => c.id);
                              }
                              setFormData({
                                ...formData,
                                combinedTag: tag,
                                combinedWith: targetIds.length > 0 ? targetIds : formData.combinedWith
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              formData.combinedTag === tag
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 hover:bg-purple-100'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={formData.combinedTag || ''}
                        onChange={(e) => setFormData({ ...formData, combinedTag: e.target.value })}
                        placeholder="e.g. Combined Class 11 (All Sections)"
                        className="w-full bg-white dark:bg-[#0a0a0a] border border-purple-300 dark:border-purple-700 text-xs font-bold rounded-xl px-3 py-1.5 text-purple-950 dark:text-purple-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSlot ? 'Save & Sync Changes' : 'Publish Period Slot'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CLONE / DUPLICATE DAY SCHEDULE --- */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Duplicate Day Schedule
                </h3>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDuplicate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Source Day (Schedule to copy from):
                </label>
                <select
                  value={dupSourceDay}
                  onChange={(e) => setDupSourceDay(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2"
                >
                  {DAYS_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d} ({classFilteredSlots.filter((s) => s.day === d).length} periods)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Days to replicate:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_LIST.filter((d) => d !== dupSourceDay).map((d) => {
                    const isChecked = dupTargetDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setDupTargetDays(dupTargetDays.filter((t) => t !== d));
                          } else {
                            setDupTargetDays([...dupTargetDays, d]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-800 dark:text-blue-200'
                            : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{d}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                💡 Replaces selected target days' schedule with {dupSourceDay}'s period structure for {selectedClass}.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Copy className="w-4 h-4" />
                  <span>Execute Duplication</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: FACULTY SUBSTITUTION & ADJUSTMENT --- */}
      {showSubstitutionModal && selectedSlotForSub && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Assign Faculty Substitution
                </h3>
              </div>
              <button
                onClick={() => setShowSubstitutionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {selectedSlotForSub.day} • Period {selectedSlotForSub.periodNo}: {selectedSlotForSub.subjectName}
              </p>
              <p className="text-slate-500 font-mono">
                {selectedSlotForSub.startTime} – {selectedSlotForSub.endTime} • {selectedSlotForSub.roomNo}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Original Faculty: <span className="font-bold">{selectedSlotForSub.facultyName}</span>
              </p>
            </div>

            <form onSubmit={handleSaveSubstitution} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Substitute Teacher:
                </label>
                <select
                  value={subTeacherName}
                  onChange={(e) => setSubTeacherName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.department} - {t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Substitution:
                </label>
                <input
                  type="text"
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-medium rounded-xl px-3 py-2"
                  placeholder="e.g. Faculty on Sick Leave / Deputed to CBSE Centre"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                ⚠️ Live alert will be dispatched to students of {selectedClass} and {subTeacherName}.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSubstitutionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Substitution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: CONFIRM CBSE AUTO-FILL --- */}
      {showTemplateConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Smart Conflict-Free Timetable Generator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Constraint-satisfied weekly curriculum scheduler (Classes 9 to 12)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateConfirmModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Strict Zero-Clash Guarantee:
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                Kisi bhi class mein ek hi teacher ka same time par lecture nahi aayega (Classes 9 to 12). All subjects (Physics, Chemistry, Maths, Biology, CS, English, Accounts, Agriculture) are automatically assigned to non-overlapping periods across the 6 days.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option A: Single Selected Class Section */}
              {selectedClass !== 'ALL_CLASSES' && (
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(selectedClass)}
                  className="w-full p-4 rounded-2xl border border-indigo-300 dark:border-indigo-700/60 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 hover:border-indigo-500 text-left transition-all group cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                        Scoped Isolation
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Selected Section Only ({currentClassInfo.className} • {currentClassInfo.section})
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform active:scale-[0.98] duration-150 ease-in-out" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">
                    Generate conflict-free weekly timetable strictly for this section ({currentClassInfo.stream}). <strong>Other classes (Class 10, Class 12, and other streams) will NOT be affected.</strong>
                  </p>
                </button>
              )}

              {/* Option B: All Sections of Current Grade (e.g., all 5 Class 11 sections) */}
              {selectedClass !== 'ALL_CLASSES' && (currentClassInfo.className === 'Class 11' || currentClassInfo.className === 'Class 12') && (
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(currentClassInfo.className)}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      All 5 Sections of {currentClassInfo.className} Only (Science, Commerce, Arts, Agri)
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform active:scale-[0.98] duration-150 ease-in-out" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Regenerate schedule for all streams of {currentClassInfo.className} only. Preserves Class 9, 10, and other grades intact.
                  </p>
                </button>
              )}

              {/* Option C: Full School 9th to 12th Generator */}
              <button
                type="button"
                onClick={handleGenerateAllClassesConflictFree}
                className={`w-full p-4 rounded-2xl border transition-all group cursor-pointer ${
                  selectedClass === 'ALL_CLASSES'
                    ? 'border-amber-300 dark:border-amber-700/60 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 hover:border-amber-500'
                    : 'border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                } text-left`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                      Master School
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      All Classes (9th, 10th, 11th, 12th)
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform active:scale-[0.98] duration-150 ease-in-out" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">
                  Generate weekly 6-period conflict-free routine for all {classes.length} class sections simultaneously. Ensures 0 clashes school-wide.
                </p>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowTemplateConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: BROADCAST TIMETABLE CIRCULAR --- */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Broadcast Timetable Notice
                </h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Audience:
                </label>
                <select
                  value={broadcastAudience}
                  onChange={(e) => setBroadcastAudience(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2"
                >
                  <option value="All">All Students & Teachers</option>
                  <option value="Students">All Students Only</option>
                  <option value="Teachers">All Teachers Only</option>
                  <option value="Class 11">Class 11 Students & Teachers</option>
                  <option value="Class 12">Class 12 Students & Teachers</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notice Title:
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs font-bold rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Circular Message:
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs rounded-xl p-3"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Schedule Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-black font-serif">Clear Timetable Slots</h3>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select the scope of timetable periods you wish to wipe/clear. Only slots updated or created by the Principal will be shown in student and teacher portals:
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'selected_class' as const,
                  title: `Clear ${selectedClass === 'ALL_CLASSES' ? 'All Classes' : selectedClass} (All Days)`,
                  desc: `Remove all periods scheduled for ${selectedClass === 'ALL_CLASSES' ? 'all classes' : selectedClass}.`
                },
                {
                  id: 'selected_day' as const,
                  title: `Clear ${selectedClass} on ${activeDay === 'ALL' ? 'Current Day' : activeDay} Only`,
                  desc: `Remove periods scheduled on ${activeDay === 'ALL' ? 'current view' : activeDay} for this class.`
                },
                {
                  id: 'all_school' as const,
                  title: 'Clear Entire School Timetable (All Classes & All Days)',
                  desc: 'Completely wipe all class timetable schedules across the school.'
                }
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setClearScope(opt.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    clearScope === opt.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-neutral-900/40 border-slate-200 dark:border-neutral-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    checked={clearScope === opt.id}
                    onChange={() => setClearScope(opt.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Wipe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

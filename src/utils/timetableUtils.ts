import { TimetableSlot, StudentProfile, SchoolClassInfo } from '../types';

export const DAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7
};

export const ORDERED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Converts a 12-hour formatted time string (e.g. "08:30 AM", "1:40 PM", "12:50 PM")
 * into total minutes elapsed from midnight (0 to 1439).
 * This guarantees 100% accurate chronological sorting without string comparison bugs.
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = (match[3] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Sorts an array of TimetableSlot objects in strict chronological order:
 * 1. Day of the week (Monday -> Saturday)
 * 2. Period Number (1 -> 6)
 * 3. Start Time (08:30 AM -> 02:30 PM)
 * 4. End Time
 */
export function sortTimetableSlots<T extends TimetableSlot>(slots: T[]): T[] {
  return [...slots].sort((a, b) => {
    // 1. Day order (if multiple days present)
    if (a.day && b.day && a.day !== b.day) {
      const dayA = DAY_ORDER[a.day] || 99;
      const dayB = DAY_ORDER[b.day] || 99;
      if (dayA !== dayB) return dayA - dayB;
    }

    // 2. Period Number (1, 2, 3, 4, 5, 6)
    if (a.periodNo && b.periodNo && a.periodNo !== b.periodNo) {
      return a.periodNo - b.periodNo;
    }

    // 3. Chronological Start Time
    const startDiff = timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime);
    if (startDiff !== 0) return startDiff;

    // 4. End Time
    return timeStringToMinutes(a.endTime) - timeStringToMinutes(b.endTime);
  });
}

/**
 * Standard School Bell Periods for CBSE Senior Secondary
 */
export interface StandardPeriod {
  periodNo: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

export const STANDARD_SCHOOL_PERIODS: StandardPeriod[] = [
  { periodNo: 1, label: 'Period 1', startTime: '08:30 AM', endTime: '09:20 AM' },
  { periodNo: 2, label: 'Period 2', startTime: '09:20 AM', endTime: '10:10 AM' },
  { periodNo: 0, label: 'Short Break / Recess', startTime: '10:10 AM', endTime: '10:30 AM', isBreak: true },
  { periodNo: 3, label: 'Period 3', startTime: '10:30 AM', endTime: '11:20 AM' },
  { periodNo: 4, label: 'Period 4', startTime: '11:20 AM', endTime: '12:10 PM' },
  { periodNo: 0, label: 'Lunch Break', startTime: '12:10 PM', endTime: '12:50 PM', isBreak: true },
  { periodNo: 5, label: 'Period 5', startTime: '12:50 PM', endTime: '01:40 PM' },
  { periodNo: 6, label: 'Period 6 / Activity', startTime: '01:40 PM', endTime: '02:30 PM' }
];

export const TEACHING_PERIODS = STANDARD_SCHOOL_PERIODS.filter((p) => !p.isBreak);

/**
 * Returns today's ISO date string (YYYY-MM-DD) based on local client system time.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns day name ('Monday' - 'Sunday') from an ISO date string (YYYY-MM-DD).
 */
export function getDayNameFromDateString(dateStr: string): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' {
  if (!dateStr) return getTodayDayName();
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
      return dayNames[d.getDay()];
    }
  } catch {
    // fallback
  }
  return getTodayDayName();
}

/**
 * Returns today's Day name ('Monday' - 'Saturday'). If Sunday, returns 'Monday' as next active school day.
 */
export function getTodayDayName(): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentDay = dayNames[new Date().getDay()];
  return currentDay === 'Sunday' ? 'Monday' : (currentDay as any);
}

/**
 * Generates dynamic recent and upcoming dates list centered around today.
 */
export function generateSessionDateOptions(count = 8): Array<{ label: string; date: string; isToday?: boolean; dayName: string }> {
  const options: Array<{ label: string; date: string; isToday?: boolean; dayName: string }> = [];
  const today = new Date();

  // Show today and upcoming + recent dates
  // e.g. -2 days back to +5 days forward
  for (let offset = -2; offset <= count - 3; offset++) {
    const d = new Date();
    d.setDate(today.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let label = `${formatted} (${shortDay})`;
    if (offset === 0) {
      label = `Today (${formatted} • ${shortDay})`;
    } else if (offset === 1) {
      label = `Tomorrow (${formatted} • ${shortDay})`;
    } else if (offset === -1) {
      label = `Yesterday (${formatted} • ${shortDay})`;
    }

    options.push({ label, date: dateStr, isToday: offset === 0, dayName });
  }

  return options;
}

export function areSubjectsMatching(
  code1?: string,
  name1?: string,
  code2?: string,
  name2?: string
): boolean {
  const c1 = (code1 || '').trim().toLowerCase();
  const c2 = (code2 || '').trim().toLowerCase();
  if (c1 && c2 && c1 === c2) return true;

  const n1 = (name1 || '').trim().toLowerCase();
  const n2 = (name2 || '').trim().toLowerCase();
  if (!n1 && !n2) return false;
  if (n1 && n2) {
    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;
  }

  // Keyword / abbreviation matching for school subjects
  const aliasGroups: string[][] = [
    ['math', 'maths', 'mathematics'],
    ['phy', 'physic', 'physics'],
    ['chem', 'chemistry'],
    ['bio', 'biology', 'botany', 'zoology'],
    ['cs', 'comp', 'computer', 'python'],
    ['ip', 'informatics'],
    ['eng', 'english'],
    ['pe', 'physical', 'sports'],
    ['acc', 'account', 'accountancy'],
    ['bst', 'business'],
    ['eco', 'economics'],
    ['hist', 'history'],
    ['pol', 'political']
  ];

  for (const group of aliasGroups) {
    const m1 = group.some((alias) => n1.includes(alias) || c1.includes(alias));
    const m2 = group.some((alias) => n2.includes(alias) || c2.includes(alias));
    if (m1 && m2) return true;
  }

  const w1 = n1.split(' ')[0];
  const w2 = n2.split(' ')[0];
  if (w1 && w2 && (w1 === w2 || w1.includes(w2) || w2.includes(w1))) return true;

  return false;
}

export interface SlotAttendanceInfo {
  status: 'Present' | 'Absent' | 'Leave' | 'Scheduled' | 'Pending';
  topic: string;
  time?: string;
  isMarked: boolean;
  hasRecord: boolean;
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
  pct: number;
  attended: number;
  total: number;
  logs: any[];
}

/**
 * Dynamically derives a teacher's schedule for a specific day (or all days) from the central timetable.
 * This guarantees 100% real-time synchronization with the Principal's master timetable edits!
 */
export function getTeacherScheduleFromTimetable(
  timetable: TimetableSlot[],
  teacher: { name?: string; teacherId?: string; classTeacherOf?: string; subjectsTaught?: string[] } | null | undefined,
  day?: string
): Array<TimetableSlot & { classCode: string; subject: string; topic: string; activityType: string }> {
  if (!teacher || !Array.isArray(timetable)) return [];

  const targetDay = day === 'ALL' ? 'ALL' : (day || getTodayDayName());
  const teacherNameLower = (teacher.name || '').trim().toLowerCase();
  const cleanTeacherName = teacherNameLower.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, '').trim();
  const teacherIdLower = (teacher.teacherId || '').trim().toLowerCase();

  // Filter slots for the target day and teacher
  const daySlots = timetable.filter((slot) => {
    if (targetDay !== 'ALL' && slot.day !== targetDay) return false;

    const facultyLower = (slot.facultyName || '').trim().toLowerCase();
    const cleanFaculty = facultyLower.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, '').trim();
    const subFacultyLower = (slot.substituteFaculty || '').trim().toLowerCase();
    const cleanSubFaculty = subFacultyLower.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, '').trim();

    // 1. Direct Faculty Name match or cleaned name match
    if (
      teacherNameLower &&
      (facultyLower === teacherNameLower ||
        facultyLower.includes(teacherNameLower) ||
        teacherNameLower.includes(facultyLower) ||
        cleanFaculty === cleanTeacherName ||
        (cleanFaculty && cleanTeacherName && (cleanFaculty.includes(cleanTeacherName) || cleanTeacherName.includes(cleanFaculty))))
    ) {
      return true;
    }

    // 2. Direct Substitute Faculty match
    if (
      teacherNameLower &&
      (subFacultyLower === teacherNameLower ||
        subFacultyLower.includes(teacherNameLower) ||
        cleanSubFaculty === cleanTeacherName ||
        (cleanSubFaculty && cleanTeacherName && cleanSubFaculty.includes(cleanTeacherName)))
    ) {
      return true;
    }

    // 3. Match by teacher ID if attached
    const slotTeacherId = (slot as any).teacherId;
    if (slotTeacherId && teacherIdLower && String(slotTeacherId).toLowerCase() === teacherIdLower) {
      return true;
    }

    return false;
  });

  const sorted = sortTimetableSlots(daySlots);

  return sorted.map((s) => {
    const classCode = s.classCode || (s.className?.includes('11') ? '11' : s.className?.includes('12') ? '12' : s.className || '11');
    return {
      ...s,
      classCode,
      subject: s.subjectName,
      topic: s.notes || (s.isSubstitution ? `Substitute: ${s.substituteFaculty}` : 'Regular Class Session'),
      activityType: s.type || 'Lecture'
    };
  });
}

/**
 * Accurately determines the real-time attendance status for a subject on a specific date.
 * If the teacher marked attendance for that date, it returns 'Present', 'Absent', or 'Leave'.
 * If no attendance was taken on that date (or marked 'Pending'), it returns 'Pending' / isMarked: false.
 */
export function getSlotAttendance(
  subjectCode: string,
  subjectName: string,
  targetDate: string,
  attendanceRecords: any[]
): SlotAttendanceInfo {
  const record = (attendanceRecords || []).find((a) => 
    areSubjectsMatching(subjectCode, subjectName, a.subjectCode, a.subjectName)
  );

  if (!record) {
    return {
      status: 'Pending',
      topic: 'Regular CBSE Syllabus Period',
      isMarked: false,
      hasRecord: false,
      attendedClasses: 0,
      totalClasses: 0,
      percentage: 100,
      pct: 100,
      attended: 0,
      total: 0,
      logs: []
    };
  }

  // Find exact log matching targetDate
  const dateLog = record.logs?.find((l: any) => l.date === targetDate);
  const logs = record.logs || [];
  const markedLogs = logs.filter((l: any) => l.status === 'Present' || l.status === 'Absent' || l.status === 'Leave');
  const attended = markedLogs.filter((l: any) => l.status === 'Present').length;
  const total = markedLogs.length;
  const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : (record.percentage || 100);

  if (dateLog && dateLog.status && dateLog.status !== 'Pending') {
    return {
      status: dateLog.status as any,
      topic: dateLog.topic || 'Conducted Syllabus Session',
      time: dateLog.time,
      isMarked: true,
      hasRecord: true,
      attendedClasses: attended,
      totalClasses: total,
      percentage: pct,
      pct,
      attended,
      total,
      logs
    };
  }

  return {
    status: 'Pending',
    topic: 'Curriculum Lesson (Attendance Pending)',
    isMarked: false,
    hasRecord: true,
    attendedClasses: attended,
    totalClasses: total,
    percentage: pct,
    pct,
    attended,
    total,
    logs
  };
}

/**
 * Filters the master timetable slots strictly for the logged-in student's class and section/stream.
 * For example:
 * - If timetable is created for Class 11 Section A (PCM + CS) / 11-A, ONLY 11-A PCM students see it.
 * - Class 11 Section B (PCB + Bio) / 11-B students will NOT see 11-A PCM slots.
 * - Agriculture (11-AG / 12-AG) students will only see their respective section timetable.
 */
export function getStudentTimetableSlots(
  timetable: TimetableSlot[],
  student: StudentProfile | null | undefined,
  classes?: SchoolClassInfo[]
): TimetableSlot[] {
  if (!Array.isArray(timetable)) return [];
  if (!student) return timetable;

  const stuClass = (student.className || '').trim(); // e.g. "Class 11" or "Class 12"
  const stuSection = (student.section || '').trim(); // e.g. "Section A (Science PCM + CS)"
  const stuStream = (student.stream || '').trim();   // e.g. "Science Stream (PCM + CS)"

  // Text representation of student's class, section, stream, and ID
  const stuCombined = `${stuClass} ${stuSection} ${stuStream} ${student.department || ''}`.toLowerCase();

  // Find exact matching school class definition if classes array provided
  const matchedClass = (classes || []).find((c) => {
    const classMatch = !stuClass || c.className.toLowerCase() === stuClass.toLowerCase();
    if (!classMatch) return false;

    // Check classCode match (e.g. "11-A" in "Section A (Science PCM + CS)")
    const codeMatch = c.classCode && stuCombined.includes(c.classCode.toLowerCase());
    
    // Check section name match
    const sectionMatch = stuSection && c.section && (
      stuSection.toLowerCase() === c.section.toLowerCase() ||
      stuSection.toLowerCase().includes(c.section.toLowerCase()) ||
      c.section.toLowerCase().includes(stuSection.toLowerCase())
    );

    // Check stream match
    const streamMatch = stuStream && c.stream && (
      stuStream.toLowerCase().includes(c.stream.toLowerCase()) ||
      c.stream.toLowerCase().includes(stuStream.toLowerCase())
    );

    // Check specific Section tokens (A vs B vs AG vs C vs D)
    const isStuSectionA = (stuSection.toLowerCase().includes('section a') || stuStream.toLowerCase().includes('pcm')) && !stuSection.toLowerCase().includes('section ag');
    const isClsSectionA = (c.section.toLowerCase().includes('section a') || c.stream.toLowerCase().includes('pcm')) && !c.section.toLowerCase().includes('section ag');

    const isStuSectionB = stuSection.toLowerCase().includes('section b') || stuStream.toLowerCase().includes('pcb');
    const isClsSectionB = c.section.toLowerCase().includes('section b') || c.stream.toLowerCase().includes('pcb');

    const isStuSectionAg = stuSection.toLowerCase().includes('agri') || stuStream.toLowerCase().includes('agri') || stuCombined.includes('ag');
    const isClsSectionAg = c.section.toLowerCase().includes('agri') || c.stream.toLowerCase().includes('agri') || c.classCode.toLowerCase().includes('ag');

    if (isStuSectionAg && isClsSectionAg) return true;
    if (isStuSectionA && isClsSectionA) return true;
    if (isStuSectionB && isClsSectionB) return true;

    return codeMatch || sectionMatch || streamMatch;
  });

  const targetClassCode = matchedClass?.classCode?.toLowerCase(); // e.g. "11-a"
  const targetClassId = matchedClass?.id?.toLowerCase();         // e.g. "cls_11_sci"

  // Class numeric identity
  const isStu11 = stuCombined.includes('11');
  const isStu12 = stuCombined.includes('12');
  const isStu10 = stuCombined.includes('10');
  const isStu9 = stuCombined.includes('9');

  // Student specific stream flags
  const isStuPCM = (stuCombined.includes('pcm') || stuCombined.includes('11-a') || stuCombined.includes('12-a') || (stuCombined.includes('section a') && stuCombined.includes('sci'))) && !stuCombined.includes('ag');
  const isStuPCB = (stuCombined.includes('pcb') || stuCombined.includes('11-b') || stuCombined.includes('12-b') || (stuCombined.includes('section b') && stuCombined.includes('sci'))) && !stuCombined.includes('ag');
  const isStuAgri = stuCombined.includes('agri') || stuCombined.includes('ag') || stuCombined.includes('11-ag') || stuCombined.includes('12-ag');
  const isStuComm = stuCombined.includes('comm') || stuCombined.includes('11-c') || stuCombined.includes('12-c') || stuCombined.includes('section c');
  const isStuArts = stuCombined.includes('arts') || stuCombined.includes('human') || stuCombined.includes('11-d') || stuCombined.includes('12-d') || stuCombined.includes('section d');

  return timetable.filter((slot) => {
    if (!slot) return false;

    // Slots marked explicitly for All classes are visible across school
    if (slot.className === 'ALL_CLASSES' || slot.className === 'All' || slot.classCode === 'ALL') {
      return true;
    }

    const slotClassCode = (slot.classCode || '').trim().toLowerCase();
    const slotClassName = (slot.className || '').trim().toLowerCase();
    const slotSection = ((slot as any).section || '').trim().toLowerCase();
    const slotNotes = (slot.notes || '').trim().toLowerCase();
    const slotCombined = `${slotClassName} ${slotClassCode} ${slotSection} ${slotNotes}`;

    // Combined Lecture support: Only match if this slot is explicitly combined with student's class/section
    if (slot.isCombined) {
      if (Array.isArray(slot.combinedWith) && slot.combinedWith.length > 0) {
        const matchesCombined = slot.combinedWith.some((target) => {
          const tLower = target.trim().toLowerCase();
          if (targetClassCode && (tLower === targetClassCode || tLower.includes(targetClassCode))) return true;
          if (targetClassId && tLower === targetClassId) return true;
          if (matchedClass && (`${matchedClass.className} - ${matchedClass.section}`.toLowerCase().includes(tLower) || matchedClass.section.toLowerCase().includes(tLower))) return true;
          return false;
        });
        if (matchesCombined) return true;
      }

      // If combinedTag mentions this specific stream or section
      if (slot.combinedTag) {
        const tagLower = slot.combinedTag.toLowerCase();
        if (isStuPCM && (tagLower.includes('pcm') || tagLower.includes('science'))) return true;
        if (isStuPCB && (tagLower.includes('pcb') || tagLower.includes('science'))) return true;
        if (isStuComm && tagLower.includes('comm')) return true;
        if (isStuArts && (tagLower.includes('art') || tagLower.includes('human'))) return true;
        if (isStuAgri && tagLower.includes('agri')) return true;
        if (tagLower.includes('all sections') || tagLower.includes('all')) {
          if (isStu11 && (tagLower.includes('11') || slotClassName.includes('11') || slotClassCode.startsWith('11'))) return true;
          if (isStu12 && (tagLower.includes('12') || slotClassName.includes('12') || slotClassCode.startsWith('12'))) return true;
        }
      }
      // If none of the combined criteria match for this student, do NOT fall through to general match
      return false;
    }

    // 1. Exact classCode match with student's matched class (e.g. "11-a" === "11-a")
    if (targetClassCode && slotClassCode) {
      if (slotClassCode === targetClassCode) return true;
      if (targetClassId && slotClassCode === targetClassId) return true;

      // If slot has another specific section classCode (e.g. slot is "11-b" and student target is "11-a"), REJECT!
      if (slotClassCode !== targetClassCode && (slotClassCode.includes('-') || slotClassCode.includes('_'))) {
        return false;
      }
    }

    // 2. Class Level Verification (Class 11 vs Class 12 vs Class 10 vs Class 9)
    const slotIs11 = slotClassName.includes('11') || slotClassCode.startsWith('11') || slotClassCode === '11';
    const slotIs12 = slotClassName.includes('12') || slotClassCode.startsWith('12') || slotClassCode === '12';
    const slotIs10 = slotClassName.includes('10') || slotClassCode.startsWith('10') || slotClassCode === '10';
    const slotIs9 = slotClassName.includes('9') || slotClassCode.startsWith('9') || slotClassCode === '9';

    if (slotIs11 && !isStu11) return false;
    if (slotIs12 && !isStu12) return false;
    if (slotIs10 && !isStu10) return false;
    if (slotIs9 && !isStu9) return false;

    // If matchedClass section/name matches slot exactly
    if (matchedClass) {
      const fullSectionName = `${matchedClass.className} - ${matchedClass.section}`.toLowerCase();
      if (slotClassName === fullSectionName) return true;
      if (slotClassName === matchedClass.section.toLowerCase()) return true;
    }

    // 3. Section & Stream Exclusion/Inclusion Verification
    const isSlotPCM = (slotCombined.includes('pcm') || slotCombined.includes('11-a') || slotCombined.includes('12-a') || slotCombined.includes('section a')) && !slotCombined.includes('ag');
    const isSlotPCB = (slotCombined.includes('pcb') || slotCombined.includes('11-b') || slotCombined.includes('12-b') || slotCombined.includes('section b')) && !slotCombined.includes('ag');
    const isSlotAgri = slotCombined.includes('agri') || slotCombined.includes('11-ag') || slotCombined.includes('12-ag') || slotCombined.includes('section ag');
    const isSlotComm = slotCombined.includes('comm') || slotCombined.includes('11-c') || slotCombined.includes('12-c') || slotCombined.includes('section c');
    const isSlotArts = slotCombined.includes('arts') || slotCombined.includes('human') || slotCombined.includes('11-d') || slotCombined.includes('12-d') || slotCombined.includes('section d');

    // If slot has a specific section/stream tag, strictly match against student:
    if (isSlotAgri && !isStuAgri) return false;
    if (isSlotPCM && !isStuPCM) return false;
    if (isSlotPCB && !isStuPCB) return false;
    if (isSlotComm && !isStuComm) return false;
    if (isSlotArts && !isStuArts) return false;

    // Direct match if slot matches student's stream
    if (isSlotPCM && isStuPCM) return true;
    if (isSlotPCB && isStuPCB) return true;
    if (isSlotAgri && isStuAgri) return true;
    if (isSlotComm && isStuComm) return true;
    if (isSlotArts && isStuArts) return true;

    // If matchedClass id or code is in slot
    if (matchedClass && (slot.classCode === matchedClass.id || slot.classCode === matchedClass.classCode)) {
      return true;
    }

    // If slot has any other section marker (e.g. section a, b, c, d, ag), do NOT show to other sections
    if (slotCombined.includes('section') || slotCombined.includes(' - ') || slotClassCode.includes('-')) {
      return false;
    }

    // Generic class match fallback only if slot is strictly for entire grade and student matches
    if (
      slotClassName === stuClass.toLowerCase() ||
      slotClassName === `class ${stuClass.replace(/class\s*/i, '')}`.toLowerCase()
    ) {
      return true;
    }

    if (!slot.className && !slot.classCode) return true;

    return false;
  });
}



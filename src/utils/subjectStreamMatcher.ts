import { StudentProfile, SchoolClassInfo } from '../types';

/**
 * Normalizes a stream name into a canonical category
 */
export function getStreamCategory(stream?: string): 'Science PCM' | 'Science PCB' | 'Commerce' | 'Agriculture' | 'Humanities' | 'General' | 'Other' {
  if (!stream) return 'Other';
  const s = stream.toLowerCase();
  if (s.includes('pcm') || (s.includes('science') && s.includes('math'))) return 'Science PCM';
  if (s.includes('pcb') || (s.includes('science') && s.includes('bio'))) return 'Science PCB';
  if (s.includes('science')) return 'Science PCM';
  if (s.includes('comm') || s.includes('account') || s.includes('business')) return 'Commerce';
  if (s.includes('agri') || s.includes('agronom')) return 'Agriculture';
  if (s.includes('arts') || s.includes('humanities') || s.includes('social')) return 'Humanities';
  if (s.includes('secondary') || s.includes('junior') || s.includes('general') || s.includes('foundation')) return 'General';
  return 'Other';
}

/**
 * Returns Tailwind style classes for a student's stream badge
 */
export function getStreamBadgeStyle(stream?: string): { bg: string; text: string; border: string; label: string } {
  const cat = getStreamCategory(stream);
  switch (cat) {
    case 'Science PCM':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        label: 'Science (PCM)'
      };
    case 'Science PCB':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        label: 'Science (PCB)'
      };
    case 'Commerce':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        label: 'Commerce'
      };
    case 'Agriculture':
      return {
        bg: 'bg-lime-50 dark:bg-lime-950/60',
        text: 'text-lime-700 dark:text-lime-300',
        border: 'border-lime-200 dark:border-lime-800',
        label: 'Agriculture'
      };
    case 'Humanities':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        label: 'Humanities & Arts'
      };
    case 'General':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/60',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        label: 'Secondary (General)'
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-neutral-900',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-neutral-700',
        label: stream || 'General'
      };
  }
}

/**
 * Returns canonical list of subjects enrolled by a student based on their stream
 */
export function getStudentEnrolledSubjects(student?: StudentProfile | null): { code: string; name: string; shortName: string }[] {
  if (!student) {
    return [
      { code: '042', name: 'Physics (Theory & Practical)', shortName: 'Physics' },
      { code: '043', name: 'Chemistry (Theory & Lab)', shortName: 'Chemistry' },
      { code: '041', name: 'Mathematics', shortName: 'Mathematics' },
      { code: '083', name: 'Computer Science', shortName: 'Computer Science' },
      { code: '301', name: 'English Core', shortName: 'English Core' }
    ];
  }
  const stream = (student.stream || '').toLowerCase();
  const sec = (student.section || '').toLowerCase();

  if (stream.includes('agri') || sec.includes('ag')) {
    return [
      { code: '068', name: 'Agriculture Science (Theory & Agronomy)', shortName: 'Agriculture Science' },
      { code: '069', name: 'Agronomy Crop Production Practical', shortName: 'Agronomy Practical' },
      { code: '043', name: 'Chemistry (Theory & Lab)', shortName: 'Chemistry' },
      { code: '044', name: 'Biology (Theory & Lab)', shortName: 'Biology' },
      { code: '301', name: 'English Core', shortName: 'English Core' }
    ];
  }

  if (stream.includes('pcb') || sec.includes('section b')) {
    return [
      { code: '042', name: 'Physics (Theory & Practical)', shortName: 'Physics' },
      { code: '043', name: 'Chemistry (Theory & Lab)', shortName: 'Chemistry' },
      { code: '044', name: 'Biology (Theory & Lab)', shortName: 'Biology' },
      { code: '301', name: 'English Core', shortName: 'English Core' },
      { code: '302', name: 'Hindi Core', shortName: 'Hindi Core' }
    ];
  }

  if (stream.includes('comm') || sec.includes('section c')) {
    return [
      { code: '055', name: 'Accountancy', shortName: 'Accountancy' },
      { code: '054', name: 'Business Studies', shortName: 'Business Studies' },
      { code: '030', name: 'Economics', shortName: 'Economics' },
      { code: '301', name: 'English Core', shortName: 'English Core' },
      { code: '041', name: 'Mathematics', shortName: 'Mathematics' }
    ];
  }

  if (stream.includes('arts') || stream.includes('human') || sec.includes('section d')) {
    return [
      { code: '027', name: 'History', shortName: 'History' },
      { code: '028', name: 'Political Science', shortName: 'Political Science' },
      { code: '030', name: 'Economics', shortName: 'Economics' },
      { code: '301', name: 'English Core', shortName: 'English Core' },
      { code: '302', name: 'Hindi Core', shortName: 'Hindi Core' }
    ];
  }

  // Default to Science (PCM + CS)
  return [
    { code: '042', name: 'Physics (Theory & Practical)', shortName: 'Physics' },
    { code: '043', name: 'Chemistry (Theory & Lab)', shortName: 'Chemistry' },
    { code: '041', name: 'Mathematics', shortName: 'Mathematics' },
    { code: '083', name: 'Computer Science', shortName: 'Computer Science' },
    { code: '301', name: 'English Core', shortName: 'English Core' }
  ];
}

/**
 * Checks whether a student is enrolled in or eligible for a given subject
 */
export function isStudentEnrolledInSubject(
  student?: StudentProfile | null,
  subjectName?: string,
  classCode?: string
): boolean {
  if (!student) return false;
  if (!subjectName || subjectName === 'ALL' || subjectName === 'All Subjects') return true;

  const sub = subjectName.toLowerCase().trim();
  const stream = (student.stream || '').toLowerCase();
  const cls = (student.className || classCode || '').toLowerCase();
  const sec = (student.section || '').toLowerCase();

  // Class 9 & Class 10 students take all standard secondary subjects (Never Senior Stream subjects like Agri or Commerce)
  const isSecondary = cls.includes('9') || cls.includes('10') || stream.includes('secondary') || stream.includes('foundational');
  if (isSecondary) {
    if (
      sub.includes('agri') ||
      sub.includes('agronom') ||
      sub === '068' ||
      sub === '069' ||
      sub.includes('account') ||
      sub.includes('business') ||
      sub === '055' ||
      sub === '054'
    ) {
      return false;
    }
    return true;
  }

  // 1. Agriculture Science & Agronomy (Codes 068, 069)
  // Strictly ONLY for Agriculture Science stream students!
  if (
    sub === '068' ||
    sub === '069' ||
    sub.includes('agri') ||
    sub.includes('agronom') ||
    sub.includes('horticult') ||
    sub.includes('crop') ||
    sub.includes('soil chem')
  ) {
    return stream.includes('agri') || sec.includes('ag');
  }

  // 2. Biology / Life Sciences / Plant Genetics / Biotechnology (Code 044)
  // Only for PCB and Agriculture Science stream!
  // PCM students strictly do NOT take Biology!
  if (
    sub === '044' ||
    sub.includes('bio') ||
    sub.includes('botany') ||
    sub.includes('zoology') ||
    sub.includes('life science') ||
    sub.includes('plant genetics')
  ) {
    return (
      stream.includes('pcb') ||
      stream.includes('bio') ||
      stream.includes('medical') ||
      stream.includes('agri') ||
      sec.includes('section b') ||
      sec.includes('ag')
    );
  }

  // 3. Computer Science / Programming (Code 083)
  // Science PCM (with CS) stream!
  if (
    sub === '083' ||
    sub.includes('comp') ||
    sub.includes('cs') ||
    sub.includes('python') ||
    sub.includes('c++')
  ) {
    return stream.includes('cs') || stream.includes('pcm') || sec.includes('section a') || stream.includes('comp');
  }

  // 4. Mathematics / Applied Math (Code 041)
  // Science PCM or Commerce (with Math)
  // Pure PCB and Agriculture do NOT take Mathematics!
  if (sub === '041' || sub.includes('math')) {
    if (stream.includes('pcb') || stream.includes('agri') || sec.includes('section b') || sec.includes('ag')) {
      return false;
    }
    return stream.includes('pcm') || stream.includes('math') || stream.includes('comm') || sec.includes('section a') || (stream.includes('science') && !stream.includes('pcb'));
  }

  // 5. Physics (Code 042)
  // All Science streams (PCM, PCB). Agriculture stream does NOT take standard CBSE Physics!
  if (sub === '042' || sub.includes('physic')) {
    if (stream.includes('agri') || sec.includes('ag') || stream.includes('comm') || stream.includes('arts')) {
      return false;
    }
    return stream.includes('science') || stream.includes('pcm') || stream.includes('pcb') || stream.includes('physics');
  }

  // 6. Chemistry (Code 043)
  // Science streams (PCM, PCB) and Agriculture Science (Soil Chemistry)
  if (sub === '043' || sub.includes('chem')) {
    if (stream.includes('comm') || stream.includes('arts')) {
      return false;
    }
    return stream.includes('science') || stream.includes('pcm') || stream.includes('pcb') || stream.includes('agri');
  }

  // 7. Accountancy (Code 055)
  if (sub === '055' || sub.includes('account') || sub.includes('acc') || sub.includes('financial')) {
    return stream.includes('commerce') || stream.includes('comm') || sec.includes('section c');
  }

  // 8. Business Studies (Code 054)
  if (sub === '054' || sub.includes('business') || sub.includes('bst') || sub.includes('management')) {
    return stream.includes('commerce') || stream.includes('comm') || sec.includes('section c');
  }

  // 9. Economics (Code 030)
  if (sub === '030' || sub.includes('eco')) {
    return stream.includes('commerce') || stream.includes('comm') || stream.includes('arts') || stream.includes('humanities');
  }

  // 10. Informatics Practices (Code 065)
  if (sub === '065' || sub.includes('informatics') || sub.includes('ip')) {
    return stream.includes('commerce') || stream.includes('comm') || stream.includes('ip');
  }

  // 11. Humanities / Arts (Codes 027, 028, etc.)
  if (sub === '027' || sub === '028' || sub.includes('hist') || sub.includes('pol') || sub.includes('sociol') || sub.includes('geograph')) {
    return stream.includes('arts') || stream.includes('humanities') || sec.includes('section d');
  }

  // 12. English Core (Code 301)
  if (sub === '301' || sub.includes('english')) {
    return true;
  }

  // 13. Hindi Core (Code 302)
  if (sub === '302' || sub.includes('hindi')) {
    return true;
  }

  // 14. Universal Non-Scholastic
  if (sub.includes('physical education') || sub.includes('sports') || sub.includes('general studies') || sub.includes('work experience')) {
    return true;
  }

  // If a student is in Senior Secondary (11 or 12) with a known stream, and subject is unknown or unmapped, DO NOT blindly return true!
  if (stream.includes('pcm')) {
    return false;
  }
  if (stream.includes('pcb')) {
    return false;
  }
  if (stream.includes('agri')) {
    return false;
  }
  if (stream.includes('comm')) {
    return false;
  }

  return true;
}

/**
 * Filter students of a specific class by subject enrollment
 */
export function filterStudentsBySubject(
  allStudents: StudentProfile[],
  selectedClass: string,
  subjectName?: string,
  streamFilter?: string
): StudentProfile[] {
  // 1. First filter by class (e.g. 11, 12, 10, 9)
  const classStudents = allStudents.filter((s) => {
    const clsClean = (s.className || '').replace(/^Class\s*/i, '').trim();
    return (
      clsClean === selectedClass ||
      clsClean.startsWith(selectedClass) ||
      (s.studentId && s.studentId.includes(`STU2026${selectedClass}`)) ||
      (s.studentId && s.studentId.includes(`STU0${selectedClass}`))
    );
  });

  // 2. If a specific manual stream filter is selected (e.g. 'Science PCM')
  if (streamFilter && streamFilter !== 'ALL' && streamFilter !== 'AUTO') {
    return classStudents.filter((s) => {
      const cat = getStreamCategory(s.stream);
      return cat === streamFilter || (s.stream || '').toLowerCase().includes(streamFilter.toLowerCase());
    });
  }

  // 3. If AUTO subject filtering is active
  if (subjectName && subjectName !== 'ALL' && subjectName !== 'All Subjects') {
    const enrolled = classStudents.filter((s) => isStudentEnrolledInSubject(s, subjectName, selectedClass));
    // If we have enrolled matches, return them; otherwise fallback to class students
    if (enrolled.length > 0) return enrolled;
  }

  return classStudents;
}

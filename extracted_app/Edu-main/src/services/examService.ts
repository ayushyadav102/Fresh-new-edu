import { collection, doc, getDocs, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, ensureFirebaseAuth } from '../firebase';
import { isMockDataEnabled } from '../config/dataConfig';

export interface ExamMark {
  id: string; // e.g. STU20261101_042_Term1
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string; // e.g. 11-A
  subjectCode: string; // e.g. 042
  subjectName: string; // e.g. Physics
  term: string;
  theoryMarks: number | null;
  theoryMax: number;
  internalMarks: number | null;
  internalMax: number;
  totalMarks: number;
  grade: string;
  remarks: string;
  status: string; // 'Draft', 'Verified', 'Approved', 'Retest Needed'
  teacherId: string;
  updatedAt: number;
  isPublished?: boolean;
}

const MOCK_MARKS_STORAGE_KEY = 'edux_mock_exam_marks';

// Initial CBSE sample marks for mock/testing mode
const INITIAL_DEMO_MARKS: ExamMark[] = [
  {
    id: 'STU20261101_042_Term1',
    studentId: 'STU20261101',
    studentName: 'Aarav Patel',
    rollNo: 'Roll 01',
    classId: '11-A',
    subjectCode: '042',
    subjectName: 'Physics',
    term: 'Term 1 (Unit & Mid)',
    theoryMarks: 62,
    theoryMax: 70,
    internalMarks: 28,
    internalMax: 30,
    totalMarks: 90,
    grade: 'A1',
    remarks: 'Outstanding conceptual clarity in Mechanics',
    status: 'Verified',
    teacherId: 'TCH001',
    updatedAt: Date.now() - 86400000 * 2,
    isPublished: true
  },
  {
    id: 'STU20261101_041_Term1',
    studentId: 'STU20261101',
    studentName: 'Aarav Patel',
    rollNo: 'Roll 01',
    classId: '11-A',
    subjectCode: '041',
    subjectName: 'Mathematics',
    term: 'Term 1 (Unit & Mid)',
    theoryMarks: 74,
    theoryMax: 80,
    internalMarks: 19,
    internalMax: 20,
    totalMarks: 93,
    grade: 'A1',
    remarks: 'Excellent problem solving in Calculus',
    status: 'Verified',
    teacherId: 'TCH002',
    updatedAt: Date.now() - 86400000 * 3,
    isPublished: true
  },
  {
    id: 'STU20261101_043_Term1',
    studentId: 'STU20261101',
    studentName: 'Aarav Patel',
    rollNo: 'Roll 01',
    classId: '11-A',
    subjectCode: '043',
    subjectName: 'Chemistry',
    term: 'Term 1 (Unit & Mid)',
    theoryMarks: 58,
    theoryMax: 70,
    internalMarks: 27,
    internalMax: 30,
    totalMarks: 85,
    grade: 'A2',
    remarks: 'Consistent laboratory performance',
    status: 'Verified',
    teacherId: 'TCH003',
    updatedAt: Date.now() - 86400000 * 4,
    isPublished: true
  },
  {
    id: 'STU20261101_301_Term1',
    studentId: 'STU20261101',
    studentName: 'Aarav Patel',
    rollNo: 'Roll 01',
    classId: '11-A',
    subjectCode: '301',
    subjectName: 'English Core',
    term: 'Term 1 (Unit & Mid)',
    theoryMarks: 72,
    theoryMax: 80,
    internalMarks: 18,
    internalMax: 20,
    totalMarks: 90,
    grade: 'A1',
    remarks: 'Exceptional literature analysis and writing',
    status: 'Verified',
    teacherId: 'TCH004',
    updatedAt: Date.now() - 86400000 * 5,
    isPublished: true
  }
];

function getMockMarksList(): ExamMark[] {
  try {
    const saved = localStorage.getItem(MOCK_MARKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_DEMO_MARKS;
}

function saveMockMarksList(list: ExamMark[]) {
  try {
    localStorage.setItem(MOCK_MARKS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('edux-mock-marks-change'));
  } catch (e) {}
}

// Fetch all marks for a class, subject, and term (for Teacher Portal)
export const fetchClassSubjectMarks = async (classId: string, subjectCode: string, term: string): Promise<ExamMark[]> => {
  if (isMockDataEnabled()) {
    const all = getMockMarksList();
    const cleanClass = classId.replace(/^Class\s*/i, '').trim();
    return all.filter(m => 
      m.classId.replace(/^Class\s*/i, '').trim() === cleanClass &&
      m.subjectCode === subjectCode &&
      (!term || m.term === term)
    );
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const q = query(
      marksRef,
      where('classId', '==', classId),
      where('subjectCode', '==', subjectCode),
      where('term', '==', term)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ExamMark);
  } catch (error) {
    console.warn('Error fetching marks from Firestore, using mock fallback:', error);
    const all = getMockMarksList();
    return all.filter(m => m.subjectCode === subjectCode);
  }
};

// Fetch all marks for a student and term (for Student Portal)
export const fetchStudentMarks = async (studentId: string, term: string): Promise<ExamMark[]> => {
  if (isMockDataEnabled()) {
    const all = getMockMarksList();
    return all.filter(m => m.studentId === studentId && (!term || m.term === term));
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const q = query(
      marksRef,
      where('studentId', '==', studentId),
      where('term', '==', term)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ExamMark);
  } catch (error) {
    console.warn('Error fetching student marks from Firestore:', error);
    const all = getMockMarksList();
    return all.filter(m => m.studentId === studentId);
  }
};

// Fetch all marks for a whole class and term (for Principal Portal)
export const fetchClassMarks = async (classId: string, term: string): Promise<ExamMark[]> => {
  if (isMockDataEnabled()) {
    const all = getMockMarksList();
    const cleanClass = classId.replace(/^Class\s*/i, '').trim();
    return all.filter(m => m.classId.replace(/^Class\s*/i, '').trim() === cleanClass && (!term || m.term === term));
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const q = query(
      marksRef,
      where('classId', '==', classId),
      where('term', '==', term)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ExamMark);
  } catch (error) {
    console.warn('Error fetching class marks from Firestore:', error);
    const all = getMockMarksList();
    return all;
  }
};

// Update or create a mark entry
export const saveExamMark = async (mark: ExamMark): Promise<void> => {
  // Always update mock cache
  const all = getMockMarksList();
  const existingIdx = all.findIndex(m => m.id === mark.id);
  const updatedMark = { ...mark, updatedAt: Date.now() };
  if (existingIdx >= 0) {
    all[existingIdx] = updatedMark;
  } else {
    all.push(updatedMark);
  }
  saveMockMarksList(all);

  // If live Cloud mode is active, sync directly to Firestore
  if (!isMockDataEnabled()) {
    try {
      const markRef = doc(db, 'exam_marks', mark.id);
      await setDoc(markRef, updatedMark, { merge: true });
    } catch (error) {
      console.error('Error writing mark to Firestore:', error);
    }
  }
};

// Subscribe to marks for a specific class/subject/term (Real-time updates)
export const subscribeToClassSubjectMarks = (
  classId: string,
  subjectCode: string,
  term: string,
  callback: (marks: ExamMark[]) => void
) => {
  if (isMockDataEnabled()) {
    const notify = () => {
      const all = getMockMarksList();
      const cleanClass = classId.replace(/^Class\s*/i, '').trim();
      const filtered = all.filter(m => 
        m.classId.replace(/^Class\s*/i, '').trim() === cleanClass &&
        m.subjectCode === subjectCode &&
        (!term || m.term === term)
      );
      callback(filtered);
    };
    notify();
    window.addEventListener('edux-mock-marks-change', notify);
    return () => window.removeEventListener('edux-mock-marks-change', notify);
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const q = query(
      marksRef,
      where('classId', '==', classId),
      where('subjectCode', '==', subjectCode),
      where('term', '==', term)
    );
    
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore marks subscription notice, using cached marks:', err);
        const all = getMockMarksList();
        callback(all.filter(m => m.subjectCode === subjectCode));
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (err) {
    console.warn('Subscription error, falling back to mock:', err);
    callback(getMockMarksList().filter(m => m.subjectCode === subjectCode));
    return () => {};
  }
};

export const subscribeToStudentMarks = (
  studentId: string,
  term: string | undefined,
  callback: (marks: ExamMark[]) => void
) => {
  if (isMockDataEnabled()) {
    const notify = () => {
      const all = getMockMarksList();
      const filtered = all.filter(m => m.studentId === studentId && (!term || m.term === term));
      callback(filtered);
    };
    notify();
    window.addEventListener('edux-mock-marks-change', notify);
    return () => window.removeEventListener('edux-mock-marks-change', notify);
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const constraints: any[] = [where('studentId', '==', studentId)];
    if (term) {
      constraints.push(where('term', '==', term));
    }
    const q = query(marksRef, ...constraints);
    
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore student marks subscription notice:', err);
        callback(getMockMarksList().filter(m => m.studentId === studentId));
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (err) {
    callback(getMockMarksList().filter(m => m.studentId === studentId));
    return () => {};
  }
};

export const subscribeToClassMarks = (
  classId: string,
  term: string,
  callback: (marks: ExamMark[]) => void
) => {
  if (isMockDataEnabled()) {
    const notify = () => {
      const all = getMockMarksList();
      const cleanClass = classId.replace(/^Class\s*/i, '').trim();
      const filtered = all.filter(m => m.classId.replace(/^Class\s*/i, '').trim() === cleanClass && (!term || m.term === term));
      callback(filtered);
    };
    notify();
    window.addEventListener('edux-mock-marks-change', notify);
    return () => window.removeEventListener('edux-mock-marks-change', notify);
  }

  try {
    const marksRef = collection(db, 'exam_marks');
    const q = query(
      marksRef,
      where('classId', '==', classId),
      where('term', '==', term)
    );
    
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;
    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed || !user) return;
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => doc.data() as ExamMark));
      }, (err) => {
        console.warn('Firestore class marks subscription notice:', err);
        callback(getMockMarksList());
      });
    }).catch(console.warn);
    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (err) {
    callback(getMockMarksList());
    return () => {};
  }
};

export const publishExamMarksBatch = async (markIds: string[]): Promise<void> => {
  // Update mock cache
  const all = getMockMarksList();
  const updated = all.map(m => markIds.includes(m.id) ? { ...m, isPublished: true, updatedAt: Date.now() } : m);
  saveMockMarksList(updated);

  if (!isMockDataEnabled()) {
    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      markIds.forEach(id => {
        const markRef = doc(db, 'exam_marks', id);
        batch.update(markRef, { isPublished: true, updatedAt: Date.now() });
      });
      
      await batch.commit();
    } catch (err) {
      console.error('Error publishing exam marks batch to Firestore:', err);
    }
  }
};


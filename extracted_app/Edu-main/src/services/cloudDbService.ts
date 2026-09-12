import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, ensureFirebaseAuth } from '../firebase';
import { isMockDataEnabled } from '../config/dataConfig';

// Collection Names in Cloud Firestore
export const CLOUD_COLLECTIONS = {
  ATTENDANCE_REPORTS: 'attendance_reports',
  ATTENDANCE_LOGS: 'attendance_logs',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  NOTICES: 'notices',
  HOMEWORK: 'homework',
  TIMETABLE: 'timetable',
  CLASSES: 'classes'
};

/**
 * Remove undefined fields before writing to Firestore
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

/**
 * Upload any file (Image, PDF, Video) to Firebase Cloud Storage
 * Returns direct cloud download URL, with base64 fallback if storage bucket rules require auth
 */
export async function uploadFileToCloudStorage(
  file: File,
  folderPath: string = 'study_materials'
): Promise<{ url: string; fileName: string; size: number }> {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folderPath}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl, fileName: file.name, size: file.size };
  } catch (error) {
    console.warn('Cloud storage direct upload notice (using secure local/data URL):', error);
    // Fallback: Read as data URL so it never blocks student/teacher
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Save Attendance Report & individual student logs to Cloud Firestore
 */
export async function saveAttendanceToCloud(
  report: any,
  studentLogs: any[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save main summary report to Cloud Firestore
    const reportRef = doc(db, CLOUD_COLLECTIONS.ATTENDANCE_REPORTS, report.id);
    await setDoc(reportRef, sanitizeForFirestore({
      ...report,
      createdAt: Date.now(),
      syncedAt: new Date().toISOString()
    }));

    // 2. Save individual student attendance logs to Cloud Firestore
    for (const log of studentLogs) {
      const logId = log.id || `att-log-${log.studentId}-${report.date}-${Math.random().toString(36).substring(2, 6)}`;
      const logRef = doc(db, CLOUD_COLLECTIONS.ATTENDANCE_LOGS, logId);
      await setDoc(logRef, sanitizeForFirestore({
        ...log,
        reportId: report.id,
        createdAt: Date.now()
      }));
    }

    console.log('✅ Attendance successfully written to Google Cloud Firestore:', report.id);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Cloud Firestore Attendance write error:', error);
    return { success: false, error: error?.message || 'Failed to save to Cloud Firestore' };
  }
}

/**
 * Fetch all Attendance Reports from Cloud Firestore
 */
export async function fetchAttendanceReportsFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.ATTENDANCE_REPORTS);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching reports from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Fetch all Students from Cloud Firestore
 */
export async function fetchStudentsFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.STUDENTS);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching students from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Save or update Student in Cloud Firestore
 */
export async function saveStudentToCloud(student: any): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    await ensureFirebaseAuth();
    const docId = student.id || student.studentId;
    const docRef = doc(db, CLOUD_COLLECTIONS.STUDENTS, docId);
    await setDoc(docRef, sanitizeForFirestore(student), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving student to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Save Notice to Cloud Firestore
 */
export async function saveNoticeToCloud(notice: any): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    const docRef = doc(db, CLOUD_COLLECTIONS.NOTICES, notice.id);
    await setDoc(docRef, sanitizeForFirestore(notice), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving notice to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Save Homework to Cloud Firestore
 */
export async function saveHomeworkToCloud(hw: any): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    const docRef = doc(db, CLOUD_COLLECTIONS.HOMEWORK, hw.id);
    await setDoc(docRef, sanitizeForFirestore(hw), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving homework to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Fetch all Teachers from Cloud Firestore
 */
export async function fetchTeachersFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.TEACHERS);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching teachers from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Save or update Teacher in Cloud Firestore
 */
export async function saveTeacherToCloud(teacher: any): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    const docId = teacher.id || teacher.teacherId;
    const docRef = doc(db, CLOUD_COLLECTIONS.TEACHERS, docId);
    await setDoc(docRef, sanitizeForFirestore(teacher), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving teacher to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Fetch all Notices from Cloud Firestore
 */
export async function fetchNoticesFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.NOTICES);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching notices from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Fetch all Homework from Cloud Firestore
 */
export async function fetchHomeworkFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.HOMEWORK);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching homework from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Fetch Timetable slots from Cloud Firestore
 */
export async function fetchTimetableFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.TIMETABLE);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching timetable from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Save Timetable slot or bulk timetable to Cloud Firestore
 */
export async function saveTimetableToCloud(slots: any[]): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    for (const slot of slots) {
      const slotId = slot.id || `slot-${slot.day}-${slot.period}-${slot.subjectCode || Math.random().toString(36).substring(2, 6)}`;
      const docRef = doc(db, CLOUD_COLLECTIONS.TIMETABLE, slotId);
      await setDoc(docRef, sanitizeForFirestore({ ...slot, id: slotId }), { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Error saving timetable to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Fetch Classes from Cloud Firestore
 */
export async function fetchClassesFromCloud(): Promise<any[]> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) return [];
    const colRef = collection(db, CLOUD_COLLECTIONS.CLASSES);
    const snap = await getDocs(colRef);
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (error) {
    console.warn('Error fetching classes from Cloud Firestore:', error);
    return [];
  }
}

/**
 * Save Class info to Cloud Firestore
 */
export async function saveClassToCloud(classItem: any): Promise<boolean> {
  if (isMockDataEnabled()) return false as any;
  try {
    const docId = String(classItem.id || classItem.classCode || classItem.className || 'cls_' + Date.now()).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const enriched = {
      id: docId,
      name: classItem.name || classItem.className || classItem.classCode || 'Class',
      className: classItem.className || classItem.name || classItem.classCode || 'Class',
      classCode: classItem.classCode || docId,
      ...classItem
    };
    enriched.id = docId;
    const docRef = doc(db, CLOUD_COLLECTIONS.CLASSES, docId);
    await setDoc(docRef, sanitizeForFirestore(enriched), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving class to Cloud Firestore:', error);
    return false;
  }
}

/**
 * Real-time subscription to Attendance Reports
 */
export function subscribeToAttendanceReportsFromCloud(
  callback: (reports: any[]) => void
): () => void {
  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed || !user) return;
      const colRef = collection(db, CLOUD_COLLECTIONS.ATTENDANCE_REPORTS);
      unsubscribeSnapshot = onSnapshot(
        colRef,
        (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => {
        console.warn('Attendance reports subscription notice:', err);
      }
    );
    }).catch(console.warn);

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (e) {
    console.warn('Failed to subscribe to attendance reports:', e);
    return () => {};
  }
}

/**
 * Real-time subscription to Students collection
 */
export function subscribeToStudentsFromCloud(
  callback: (students: any[]) => void
): () => void {
  try {
    let unsubscribeSnapshot = () => {};
    let isUnsubscribed = false;

    ensureFirebaseAuth().then((user: any) => {
      if (isUnsubscribed || !user) return;
      const colRef = collection(db, CLOUD_COLLECTIONS.STUDENTS);
      unsubscribeSnapshot = onSnapshot(
        colRef,
        (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => {
        console.warn('Students subscription notice:', err);
      }
    );
    }).catch(console.warn);

    return () => {
      isUnsubscribed = true;
      unsubscribeSnapshot();
    };
  } catch (e) {
    console.warn('Failed to subscribe to students:', e);
    return () => {};
  }
}

/**
 * Safe, idempotent seed function to populate Firestore if collections are empty
 * when switching to Live Database mode.
 */
export async function seedInitialDataToFirestore(initialData: {
  students?: any[];
  teachers?: any[];
  classes?: any[];
  attendanceReports?: any[];
  timetable?: any[];
}, forceSeed: boolean = false): Promise<{ success: boolean; seededCount: number }> {
  try {
    const user = await ensureFirebaseAuth();
    if (!user) {
      console.warn("Skipping seeding: Firebase user is not authenticated.");
      return { success: false, seededCount: 0 };
    }
    
    let count = 0;

    // Check students
    if (initialData.students && initialData.students.length > 0) {
      const existing = forceSeed ? [] : await fetchStudentsFromCloud();
      if (existing.length === 0) {
        for (const s of initialData.students) {
          await saveStudentToCloud(s);
          count++;
        }
      }
    }

    // Check teachers
    if (initialData.teachers && initialData.teachers.length > 0) {
      const existingTeachers = forceSeed ? [] : await fetchTeachersFromCloud();
      if (existingTeachers.length === 0) {
        for (const t of initialData.teachers) {
          await saveTeacherToCloud(t);
          count++;
        }
      }
    }

    // Check attendance reports
    if (initialData.attendanceReports && initialData.attendanceReports.length > 0) {
      const existingReports = forceSeed ? [] : await fetchAttendanceReportsFromCloud();
      if (existingReports.length === 0) {
        for (const r of initialData.attendanceReports) {
          await saveAttendanceToCloud(r, []);
          count++;
        }
      }
    }

    // Check timetable
    if (initialData.timetable && initialData.timetable.length > 0) {
      const existingSlots = forceSeed ? [] : await fetchTimetableFromCloud();
      if (existingSlots.length === 0) {
        await saveTimetableToCloud(initialData.timetable);
        count += initialData.timetable.length;
      }
    }

    // Check classes
    if (initialData.classes && initialData.classes.length > 0) {
      const existingClasses = forceSeed ? [] : await fetchClassesFromCloud();
      if (existingClasses.length === 0) {
        for (const c of initialData.classes) {
          await saveClassToCloud(c);
          count++;
        }
      }
    }

    console.log(`✅ Seeded ${count} records into Google Cloud Firestore.`);
    return { success: true, seededCount: count };
  } catch (error) {
    console.error('Error seeding initial Firestore data:', error);
    return { success: false, seededCount: 0 };
  }
}

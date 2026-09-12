import { isMockDataEnabled, getDataMode } from '../config/dataConfig';
import {
  fetchStudentsFromCloud,
  saveStudentToCloud,
  fetchTeachersFromCloud,
  saveTeacherToCloud,
  fetchAttendanceReportsFromCloud,
  saveAttendanceToCloud,
  fetchNoticesFromCloud,
  saveNoticeToCloud,
  fetchHomeworkFromCloud,
  saveHomeworkToCloud,
  fetchTimetableFromCloud,
  saveTimetableToCloud,
  fetchClassesFromCloud,
  saveClassToCloud,
  seedInitialDataToFirestore
} from './cloudDbService';
import {
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEFAULT_SCHOOL_CLASSES,
  INITIAL_TIMETABLE,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { StudentProfile, TeacherProfile, SchoolClassInfo } from '../types';

/**
 * Unified Data Service Layer
 * 
 * Routes reads and writes transparently based on `isMockDataEnabled()`:
 * - Mock Mode (true): Zero network calls to Firestore, pure local mock data & localStorage
 * - Live Cloud Mode (false): Live read/write from Google Cloud Firestore with graceful local fallback
 */
export const dataService = {
  /**
   * Check current active mode
   */
  getMode(): 'mock' | 'firebase' {
    return getDataMode();
  },

  isMock(): boolean {
    return isMockDataEnabled();
  },

  /**
   * Fetch Students
   */
  async getStudents(): Promise<StudentProfile[]> {
    if (isMockDataEnabled()) {
      try {
        const saved = localStorage.getItem('edux_students');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Local student read notice:', e);
      }
      return DEMO_STUDENTS;
    }

    // Live Cloud Mode
    try {
      const cloudStudents = await fetchStudentsFromCloud();
      if (cloudStudents && cloudStudents.length > 0) {
        return cloudStudents as StudentProfile[];
      }
      // If Firestore collection is empty, seed initial students so app is ready
      await seedInitialDataToFirestore({ students: DEMO_STUDENTS });
      return DEMO_STUDENTS;
    } catch (err) {
      console.warn('Cloud students fetch notice, falling back to cached state:', err);
      return DEMO_STUDENTS;
    }
  },

  /**
   * Save or Update Student
   */
  async saveStudent(student: StudentProfile): Promise<boolean> {
    if (!isMockDataEnabled()) {
      return await saveStudentToCloud(student);
    }
    return true;
  },

  /**
   * Fetch Teachers
   */
  async getTeachers(): Promise<TeacherProfile[]> {
    if (isMockDataEnabled()) {
      try {
        const saved = localStorage.getItem('edux_teachers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Local teachers read notice:', e);
      }
      return DEMO_TEACHERS;
    }

    // Live Cloud Mode
    try {
      const cloudTeachers = await fetchTeachersFromCloud();
      if (cloudTeachers && cloudTeachers.length > 0) {
        return cloudTeachers as TeacherProfile[];
      }
      await seedInitialDataToFirestore({ teachers: DEMO_TEACHERS });
      return DEMO_TEACHERS;
    } catch (err) {
      console.warn('Cloud teachers fetch notice, falling back to cached state:', err);
      return DEMO_TEACHERS;
    }
  },

  /**
   * Save or Update Teacher
   */
  async saveTeacher(teacher: TeacherProfile): Promise<boolean> {
    if (!isMockDataEnabled()) {
      return await saveTeacherToCloud(teacher);
    }
    return true;
  },

  /**
   * Fetch Attendance Reports
   */
  async getAttendanceReports(): Promise<any[]> {
    if (isMockDataEnabled()) {
      try {
        const saved = localStorage.getItem('edux_attendance_reports');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Local attendance read notice:', e);
      }
      return [];
    }

    try {
      return await fetchAttendanceReportsFromCloud();
    } catch (err) {
      console.warn('Cloud attendance fetch notice:', err);
      return [];
    }
  },

  /**
   * Save Attendance Report & student logs
   */
  async saveAttendance(report: any, studentLogs: any[] = []): Promise<{ success: boolean; error?: string }> {
    if (!isMockDataEnabled()) {
      return await saveAttendanceToCloud(report, studentLogs);
    }
    return { success: true };
  },

  /**
   * Fetch Classes
   */
  async getClasses(): Promise<SchoolClassInfo[]> {
    if (isMockDataEnabled()) {
      try {
        const saved = localStorage.getItem('edux_classes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Local classes read notice:', e);
      }
      return DEFAULT_SCHOOL_CLASSES;
    }

    try {
      const cloudClasses = await fetchClassesFromCloud();
      if (cloudClasses && cloudClasses.length > 0) {
        return cloudClasses as SchoolClassInfo[];
      }
      await seedInitialDataToFirestore({ classes: DEFAULT_SCHOOL_CLASSES });
      return DEFAULT_SCHOOL_CLASSES;
    } catch (err) {
      return DEFAULT_SCHOOL_CLASSES;
    }
  },

  /**
   * Save Class
   */
  async saveClass(classItem: SchoolClassInfo): Promise<boolean> {
    if (!isMockDataEnabled()) {
      return await saveClassToCloud(classItem);
    }
    return true;
  },

  /**
   * Sync complete mock baseline dataset into Google Cloud Firestore (Admin tool)
   */
  async syncMockBaselineToFirestore(): Promise<{ success: boolean; count: number }> {
    const res = await seedInitialDataToFirestore({
      students: DEMO_STUDENTS,
      teachers: DEMO_TEACHERS,
      classes: DEFAULT_SCHOOL_CLASSES,
      timetable: INITIAL_TIMETABLE
    });
    return { success: res.success, count: res.seededCount };
  }
};

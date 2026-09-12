import { useAuth } from "./AuthContext";
import { AttendanceRecord, SemesterResult, SubjectResult, LMSMaterial, LMSAssignment, TimetableSlot, ExamScheduleItem, StudentProfile, SchoolClassSubjectAssignment, SchoolClassInfo, TeacherProfile, ExpenseApprovalRequest, SchoolFeeTransaction, StaffLeaveApplication, SchoolTenant, GlobalUserProfile, PlatformBillingInvoice, SupportTicket, SupportTicketReply, TeacherResource, FeeNotice, StudentLeaveRequest, FeeDefaulterRecord, StaffDailyAttendanceLog, StaffMonthlyTrend, AcademicExamAnalytics, SchoolFeeClassSummary, HostelComplaint, AcademicDocument, NotificationItem, FeedbackSubmission, DailyClassAttendanceReport, TeacherClassCode, FeeBreakdownItem, FeeTransaction, AcademicCalendarEvent, MentorLog, PlatformMetricsSummary } from '../types';

import { INITIAL_ATTENDANCE, INITIAL_TIMETABLE, INITIAL_LMS_MATERIALS, INITIAL_LMS_ASSIGNMENTS, INITIAL_FEES, INITIAL_HOSTEL_COMPLAINTS, INITIAL_DOCUMENTS, INITIAL_NOTIFICATIONS, INITIAL_FEEDBACKS, INITIAL_DAILY_CLASS_REPORTS } from '../data/mockData';

import { INITIAL_SCHOOL_FEE_SUMMARY, INITIAL_SCHOOL_FEE_TRANSACTIONS, INITIAL_FEE_DEFAULTERS, INITIAL_EXPENSE_REQUESTS, INITIAL_STAFF_ATTENDANCE, INITIAL_STAFF_LEAVES, INITIAL_STAFF_MONTHLY_TRENDS, INITIAL_ACADEMIC_ANALYTICS } from '../data/principalModulesData';

import React, { createContext, useContext, useState, useEffect } from "react";

import { isMockDataEnabled, getDataMode, toggleMockDataMode, setMockDataMode } from "../config/dataConfig";
import { saveStudentToCloud, saveTeacherToCloud, fetchAttendanceReportsFromCloud, fetchStudentsFromCloud, seedInitialDataToFirestore, fetchTeachersFromCloud, saveAttendanceToCloud } from "../services/cloudDbService";
import { fetchWithAuth } from "../lib/api-client";

import { DEMO_STUDENTS, DEMO_TEACHERS, DEFAULT_SCHOOL_CLASSES, DEFAULT_STUDENTS_ATTENDANCE_MAP, PIYUSH_PANWAR, SEMESTER_RESULTS, EXAM_SCHEDULE, ACADEMIC_CALENDAR_EVENTS, MENTOR_LOGS } from "../data/mockData";
import {
  sortTimetableSlots,
  getTodayDateString,
} from "../utils/timetableUtils";
import {
  generateConflictFreeWeeklyTimetable,
  detectTimetableConflicts,
  normalizeTeacherName,
  TimetableConflict,
} from "../utils/conflictFreeTimetableGenerator";
import { isStudentEnrolledInSubject } from "../utils/subjectStreamMatcher";

interface ERPContextType {
  feeNotices: FeeNotice[];
  dispatchFeeNotice: (studentName: string, amount: string) => void;
  acknowledgeFeeNotice: (id: string) => void;
  feeRoster: any[];
  addStudentToFeeRoster: (student: any) => void;
  removeStudentFromFeeRoster: (name: string) => void;
  updateStudentFeeInRoster: (name: string, newAmount: string) => void;
  feeRequests: any[];
  submitFeeRequest: (request: any) => void;
  approveFeeRequest: (requestId: string, splitTerms: any[]) => void;
  studentInstallments: Record<string, any[]>;
  bursarMessages?: any[];
  sendBursarMessage?: (msg: any) => void;
  markBursarMessagesAsRead?: () => void;

  syncWithCloud?: () => Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }>;
  isMockData: boolean;
  dataMode: "mock" | "firebase";
  toggleDataMode: () => void;
  setDataMode: (useMock: boolean) => void;
  students: StudentProfile[];
  teachers: TeacherProfile[];
  classes: SchoolClassInfo[];

  studentLeaves: StudentLeaveRequest[];
  applyForLeave: (
    leave: Omit<StudentLeaveRequest, "id" | "status" | "appliedOn">,
  ) => void;
  updateStudentLeaveStatus: (
    leaveId: string,
    status: "Approved" | "Rejected",
  ) => void;

  attendance: AttendanceRecord[];
  studentAttendanceMap: Record<string, AttendanceRecord[]>;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getStudentAttendanceSummary: (studentId: string) => {
    totalClasses: number;
    attendedClasses: number;
    absentClasses: number;
    leaveClasses: number;
    pendingClasses: number;
    percentage: number;
  };
  timetable: TimetableSlot[];
  teacherResources: TeacherResource[];
  addTeacherResource: (
    resource: Omit<TeacherResource, "id" | "uploadDate">,
  ) => void;
  deleteTeacherResource: (id: string) => void;

  exams: ExamScheduleItem[];
  results: SemesterResult[];
  studentResultsMap: Record<string, SemesterResult[]>;
  getStudentResults: (studentId: string) => SemesterResult[];
  feeSummary: {
    total: number;
    paid: number;
    due: number;
    dueDate: string;
    status: "Paid" | "Partial" | "Pending";
  };
  feeBreakdown: FeeBreakdownItem[];
  feeTransactions: FeeTransaction[];
  hostelComplaints: HostelComplaint[];
  documents: AcademicDocument[];
  notifications: NotificationItem[];
  feedbacks: FeedbackSubmission[];
  calendarEvents: AcademicCalendarEvent[];
  mentorLogs: MentorLog[];

  // Principal Extended Modules States
  schoolFeeSummary: SchoolFeeClassSummary[];
  schoolFeeTransactions: SchoolFeeTransaction[];
  feeDefaulters: FeeDefaulterRecord[];
  expenseRequests: ExpenseApprovalRequest[];
  staffAttendanceLogs: StaffDailyAttendanceLog[];
  staffLeaves: StaffLeaveApplication[];
  staffMonthlyTrends: StaffMonthlyTrend[];
  academicAnalytics: AcademicExamAnalytics;

  // Teacher Active Class & Schedule States (for switching between Class 11 & Class 12)
  activeTeacherClass: TeacherClassCode;
  setActiveTeacherClass: (cls: TeacherClassCode) => void;
  teacherActiveSubTab:
    | "attendance"
    | "marks"
    | "homework"
    | "timetable"
    | "exams"
    | "notice"
    | "roster"
    | "add-student"
    | "leave-requests"
    | "chat"
    | "my-leaves";
  setTeacherActiveSubTab: (
    tab:
      | "attendance"
      | "marks"
      | "homework"
      | "timetable"
      | "exams"
      | "notice"
      | "roster"
      | "add-student"
      | "leave-requests"
      | "chat"
      | "my-leaves",
  ) => void;
  switchTeacherClassAndAction: (
    cls: TeacherClassCode,
    targetSubTab?:
      | "attendance"
      | "marks"
      | "homework"
      | "timetable"
      | "exams"
      | "notice"
      | "roster"
      | "add-student"
      | "leave-requests"
      | "chat"
      | "my-leaves",
  ) => void;

  // Student Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    notification: Omit<NotificationItem, "id" | "timestamp" | "isRead">,
  ) => void;
  submitAssignment: (
    assignmentId: string,
    fileName: string,
    fileData: string,
    studentId: string,
    studentName: string,
  ) => void;
  gradeAssignment: (
    assignmentId: string,
    studentId: string,
    obtainedMarks: string | number,
    remark?: string,
  ) => void;
  payFee: (
    amount: number,
    categoryId: string,
    paymentMethod: "UPI" | "Card" | "NetBanking" | "Cash",
  ) => FeeTransaction;
  applyBusPass: (routeNo: string, routeName: string, busStop: string) => void;
  submitHostelComplaint: (
    category: HostelComplaint["category"],
    description: string,
  ) => void;
  requestDocument: (type: AcademicDocument["type"], title: string) => void;
  submitFeedback: (
    feedback: Omit<FeedbackSubmission, "id" | "submittedAt" | "status">,
  ) => void;
  addMentorLog: (log: Omit<MentorLog, "id">) => void;
  incrementMaterialDownload: (id: string) => void;
  resetAttendanceToDefaults: () => void;
  resetAllStudentAttendance: () => void;
  resetTimetableToDefaults: () => void;
  markPeriodAttendance: (
    subjectCode: string,
    subjectName: string,
    date: string,
    time: string,
    status: "Present" | "Absent" | "Leave" | "Pending",
    topic?: string,
  ) => void;

  // Teacher Daily Attendance & Summary Actions
  dailyClassReports: DailyClassAttendanceReport[];
  submitDailyClassReport: (
    report: Omit<
      DailyClassAttendanceReport,
      "id" | "submissionTime" | "attendancePercentage"
    >,
  ) => void;
  deleteDailyClassReport: (reportId: string) => void;
  acknowledgeDailyClassReport: (
    reportId: string,
    principalNotes?: string,
  ) => void;

  // Teacher A-to-Z Editability Actions (Live Sync with Students)
  updateStudentProfile: (
    studentId: string,
    updatedData: Partial<StudentProfile>,
  ) => void;
  addNewStudent: (
    student: Omit<
      StudentProfile,
      | "id"
      | "overallPercentage"
      | "totalSubjects"
      | "schoolName"
      | "academicYear"
    >,
  ) => StudentProfile;
  updateStudentAttendanceBatch: (
    className: string,
    subjectName: string,
    date: string,
    records: {
      studentId: string;
      status: "Present" | "Absent" | "Leave" | "Pending";
    }[],
  ) => void;
  updateStudentMarksBatch: (
    className: string,
    subjectCode: string,
    subjectName: string,
    examType: string,
    marksData: {
      studentId: string;
      internalMarks: number;
      externalMarks: number;
      totalMarks: number;
      grade: string;
    }[],
  ) => void;
  addLmsMaterial: (
    material: Omit<LMSMaterial, "id" | "downloadCount" | "uploadedDate">,
  ) => void;
  addLmsAssignment: (
    assignment: Omit<LMSAssignment, "id" | "status" | "assignedDate">,
  ) => void;
  addTimetableSlot: (slot: Omit<TimetableSlot, "id">) => void;
  updateTimetableSlot: (
    slotId: string,
    updated: Partial<TimetableSlot>,
  ) => void;
  deleteTimetableSlot: (slotId: string) => void;
  clearDayTimetable: (day: TimetableSlot["day"], targetClass?: string) => void;
  batchSetTimetable: (slots: TimetableSlot[]) => void;
  addExamItem: (exam: Omit<ExamScheduleItem, "id">) => void;
  updateExamItem: (examId: string, updated: Partial<ExamScheduleItem>) => void;
  deleteExamItem: (examId: string) => void;
  broadcastNotice: (
    targetClass: string,
    title: string,
    message: string,
    priority: "High" | "Medium" | "Low",
  ) => void;

  // Principal / Administration Management Actions
  updateClassCapacity: (classId: string, capacity: number) => void;
  assignClassTeacher: (classId: string, teacherId: string) => void;
  assignSubjectTeacherToClass: (
    classId: string,
    subjectCode: string,
    teacherId: string,
  ) => void;
  addSubjectToClass: (
    classId: string,
    subject: SchoolClassSubjectAssignment,
  ) => void;
  removeSubjectFromClass: (classId: string, subjectCode: string) => void;
  addNewSchoolClass: (newClass: Omit<SchoolClassInfo, "id">) => SchoolClassInfo;
  updateClassDetails: (
    classId: string,
    updated: Partial<SchoolClassInfo>,
  ) => void;
  deleteSchoolClass: (classId: string) => void;
  updateTeacherAssignments: (
    teacherId: string,
    classTeacherOf: string,
    subjectsTaught: string[],
  ) => void;
  addNewTeacher: (teacherData: Omit<TeacherProfile, "id">) => TeacherProfile;
  transferStudentClass: (
    studentId: string,
    newClassName: string,
    newSection?: string,
  ) => void;
  principalBroadcast: (
    targetAudience: "All" | "Teachers" | "Students" | "Class 11" | "Class 12",
    title: string,
    message: string,
    priority: "High" | "Medium" | "Low",
  ) => void;

  // Principal Timetable Master Management Actions
  principalAddTimetableSlot: (
    slot: Omit<TimetableSlot, "id">,
    broadcastNotice?: boolean,
  ) => void;
  principalUpdateTimetableSlot: (
    slotId: string,
    updated: Partial<TimetableSlot>,
    broadcastNotice?: boolean,
  ) => void;
  principalDeleteTimetableSlot: (slotId: string) => void;
  principalDuplicateDaySchedule: (
    sourceDay: TimetableSlot["day"],
    targetDays: TimetableSlot["day"][],
    targetClass?: string,
  ) => void;
  principalApplyClassScheduleTemplate: (
    targetClass: string,
    templateType?: string,
  ) => void;
  principalGenerateFullConflictFreeTimetable: (targetClassIds?: string[]) => {
    totalClasses: number;
    totalSlots: number;
    conflictsCount: number;
  };
  checkTeacherAvailability: (
    teacherName: string,
    day: TimetableSlot["day"],
    periodNo: number,
    excludeSlotId?: string,
  ) => {
    available: boolean;
    conflictWithClass?: string;
    conflictSubject?: string;
  };
  getTimetableConflicts: () => TimetableConflict[];
  principalSetSlotSubstitution: (
    slotId: string,
    substituteTeacherName: string,
    reason?: string,
  ) => void;
  principalClearTimetable: (targetClass?: string, targetDay?: string) => void;

  // Principal Financial Module Actions
  approveExpenseRequest: (id: string, remarks?: string) => void;
  rejectExpenseRequest: (id: string, remarks?: string) => void;
  addExpenseRequest: (
    req: Omit<ExpenseApprovalRequest, "id" | "submissionDate" | "status">,
  ) => void;
  sendDefaulterReminder: (id: string) => void;
  resolveDefaulter: (id: string) => void;
  addSchoolFeeTransaction: (txn: Omit<SchoolFeeTransaction, "id">) => void;

  // Principal Staff Attendance & Leave Actions
  updateStaffAttendanceStatus: (
    logId: string,
    status: "Present" | "Late" | "Absent" | "On Leave",
    remarks?: string,
  ) => void;
  markAllStaffPresent: (date: string) => void;
  approveStaffLeave: (leaveId: string, remarks?: string) => void;
  rejectStaffLeave: (leaveId: string, remarks?: string) => void;
  submitStaffLeave: (
    leave: Omit<
      StaffLeaveApplication,
      "id" | "applicationNo" | "status" | "appliedDate"
    >,
  ) => void;

  // Principal Academic Performance Actions
  updateAcademicExamAnalytics: (examName: string) => void;

  // Super Admin / Platform Owner SaaS States
  schoolTenants: SchoolTenant[];
  globalUsers: GlobalUserProfile[];
  platformInvoices: PlatformBillingInvoice[];
  supportTickets: SupportTicket[];
  platformMetrics: PlatformMetricsSummary;

  // Super Admin / Platform Owner SaaS Actions
  registerSchoolTenant: (
    school: Omit<SchoolTenant, "id" | "code" | "joinedDate" | "storageUsedGb">,
  ) => SchoolTenant;
  updateSchoolTenant: (id: string, updates: Partial<SchoolTenant>) => void;
  deleteSchoolTenant: (id: string) => void;
  toggleSchoolTenantStatus: (
    id: string,
    status: SchoolTenant["status"],
  ) => void;
  updateSchoolSubscriptionPlan: (
    id: string,
    plan: SchoolTenant["plan"],
    cycle: SchoolTenant["billingCycle"],
    capacity: number,
  ) => void;
  updateGlobalUser: (id: string, updates: Partial<GlobalUserProfile>) => void;
  resetGlobalUserPassword: (id: string, newPass?: string) => string;
  toggleGlobalUserAccountStatus: (
    id: string,
    status: GlobalUserProfile["accountStatus"],
  ) => void;
  addGlobalUser: (
    user: Omit<GlobalUserProfile, "id" | "dateCreated">,
  ) => GlobalUserProfile;
  createSupportTicket: (
    ticket: Omit<
      SupportTicket,
      "id" | "ticketNumber" | "createdAt" | "updatedAt" | "replies"
    >,
  ) => SupportTicket;
  addSupportTicketReply: (
    ticketId: string,
    message: string,
    isInternal?: boolean,
    senderName?: string,
    senderRole?: any,
  ) => void;
  updateSupportTicketStatus: (
    ticketId: string,
    status: SupportTicket["status"],
    assignedAdmin?: string,
  ) => void;
  resolveSupportTicketWithOverride: (
    ticketId: string,
    resolutionNote: string,
    overrideAction?: string,
    overrideDetails?: string,
  ) => void;

  triggerPlatformOverride: (
    schoolId: string,
    actionType: string,
    payload: any,
  ) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const STANDARD_SCHOOL_SUBJECTS = [
  {
    code: "042",
    name: "Physics (Theory & Practical)",
    shortName: "Physics",
    faculty: "Mr. Rajesh Sharma",
    time: "08:30 AM",
    category: "Core" as const,
  },
  {
    code: "043",
    name: "Chemistry (Theory & Lab)",
    shortName: "Chemistry",
    faculty: "Mrs. Sunita Verma",
    time: "09:30 AM",
    category: "Core" as const,
  },
  {
    code: "041",
    name: "Mathematics",
    shortName: "Mathematics",
    faculty: "Mr. Vikram Singh",
    time: "10:45 AM",
    category: "Core" as const,
  },
  {
    code: "083",
    name: "Computer Science",
    shortName: "Computer Science",
    faculty: "Mr. Amit Kumar",
    time: "12:00 PM",
    category: "Core" as const,
  },
  {
    code: "301",
    name: "English Core",
    shortName: "English Core",
    faculty: "Mrs. Rekha Sharma",
    time: "01:30 PM",
    category: "Elective" as const,
  },
  {
    code: "302",
    name: "Hindi Core",
    shortName: "Hindi Core",
    faculty: "Mr. Arvind Tiwari",
    time: "02:30 PM",
    category: "Elective" as const,
  },
  {
    code: "044",
    name: "Biology (Theory & Lab)",
    shortName: "Biology",
    faculty: "Mrs. Ananya Gupta",
    time: "10:45 AM",
    category: "Core" as const,
  },
  {
    code: "055",
    name: "Accountancy",
    shortName: "Accountancy",
    faculty: "Mr. Sanjay Agarwal",
    time: "08:30 AM",
    category: "Core" as const,
  },
  {
    code: "054",
    name: "Business Studies",
    shortName: "Business Studies",
    faculty: "Mrs. Ritu Malhotra",
    time: "09:30 AM",
    category: "Core" as const,
  },
  {
    code: "030",
    name: "Economics",
    shortName: "Economics",
    faculty: "Mrs. Ritu Malhotra",
    time: "10:45 AM",
    category: "Core" as const,
  },
  {
    code: "068",
    name: "Agriculture Science (Theory & Agronomy)",
    shortName: "Agriculture Science",
    faculty: "Dr. Ramesh Patel",
    time: "08:30 AM",
    category: "Core" as const,
  },
  {
    code: "069",
    name: "Agronomy Crop Production Practical",
    shortName: "Agronomy Practical",
    faculty: "Dr. Ramesh Patel",
    time: "09:30 AM",
    category: "Core" as const,
  },
];

export function createFreshStudentAttendance(
  student?: StudentProfile | null,
): AttendanceRecord[] {
  const targetSubjects = student
    ? STANDARD_SCHOOL_SUBJECTS.filter(
        (std) =>
          isStudentEnrolledInSubject(student, std.name, student.className) &&
          isStudentEnrolledInSubject(student, std.code, student.className),
      )
    : STANDARD_SCHOOL_SUBJECTS.slice(0, 5); // Default to standard science core (Physics, Chemistry, Math, CS, English)

  return targetSubjects.map((std) => ({
    subjectCode: std.code,
    subjectName: std.name,
    facultyName: std.faculty,
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: std.category,
    logs: [],
  }));
}

export function sanitizeSchoolAttendance(
  raw: AttendanceRecord[],
  student?: StudentProfile | null,
): AttendanceRecord[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return createFreshStudentAttendance(student);
  }

  // Filter raw by student stream if student profile is available
  const filteredRaw = student
    ? raw.filter(
        (r) =>
          isStudentEnrolledInSubject(
            student,
            r.subjectName,
            student.className,
          ) &&
          isStudentEnrolledInSubject(student, r.subjectCode, student.className),
      )
    : raw;

  const targetSubjects = student
    ? STANDARD_SCHOOL_SUBJECTS.filter(
        (std) =>
          isStudentEnrolledInSubject(student, std.name, student.className) &&
          isStudentEnrolledInSubject(student, std.code, student.className),
      )
    : STANDARD_SCHOOL_SUBJECTS.slice(0, 5);

  const result: AttendanceRecord[] = [];
  const processedCodes = new Set<string>();

  for (const std of targetSubjects) {
    const existing = (filteredRaw || []).find(
      (r) =>
        r.subjectCode === std.code ||
        (r.subjectName &&
          (r.subjectName.toLowerCase() === std.name.toLowerCase() ||
            r.subjectName.toLowerCase().includes(std.shortName.toLowerCase()) ||
            std.name.toLowerCase().includes(r.subjectName.toLowerCase()))),
    );

    if (existing) {
      processedCodes.add(std.code);
      processedCodes.add(existing.subjectCode);

      // Deduplicate logs by date so only ONE log exists per date per subject
      const dateMap = new Map<string, (typeof existing.logs)[0]>();
      (existing.logs || []).forEach((log) => {
        if (log && log.date) {
          if (!dateMap.has(log.date)) {
            dateMap.set(log.date, {
              ...log,
              id: log.id || `att_${std.code}_${log.date}`,
              time: log.time || std.time,
            });
          }
        }
      });

      const uniqueLogs = Array.from(dateMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      // Strictly count only marked day-by-day recorded sessions (Present, Absent, Leave)
      // Pending sessions are excluded from the totalClasses count and do NOT reduce attendance percentage
      const markedLogs = uniqueLogs.filter(
        (l: any) =>
          l.status === "Present" ||
          l.status === "Absent" ||
          l.status === "Leave",
      );
      const totalClasses = markedLogs.length;
      const attendedClasses = markedLogs.filter(
        (l: any) => l.status === "Present",
      ).length;
      const absentClasses = markedLogs.filter(
        (l: any) => l.status === "Absent",
      ).length;
      const leaveClasses = markedLogs.filter(
        (l: any) => l.status === "Leave",
      ).length;
      const pendingClasses = uniqueLogs.filter(
        (l: any) => l.status === "Pending",
      ).length;
      const percentage =
        totalClasses > 0
          ? Number(((attendedClasses / totalClasses) * 100).toFixed(1))
          : 0;

      result.push({
        subjectCode: std.code,
        subjectName: std.name,
        facultyName: std.faculty,
        totalClasses,
        attendedClasses,
        absentClasses,
        leaveClasses,
        pendingClasses,
        percentage,
        category: std.category,
        logs: uniqueLogs,
      });
    } else {
      processedCodes.add(std.code);
      result.push({
        subjectCode: std.code,
        subjectName: std.name,
        facultyName: std.faculty,
        totalClasses: 0,
        attendedClasses: 0,
        absentClasses: 0,
        leaveClasses: 0,
        pendingClasses: 0,
        percentage: 0,
        category: std.category,
        logs: [],
      });
    }
  }

  // Preserve any other custom subject records ONLY if student is enrolled in them
  for (const item of filteredRaw) {
    if (!processedCodes.has(item.subjectCode)) {
      if (
        student &&
        (!isStudentEnrolledInSubject(
          student,
          item.subjectName,
          student.className,
        ) ||
          !isStudentEnrolledInSubject(
            student,
            item.subjectCode,
            student.className,
          ))
      ) {
        continue;
      }
      processedCodes.add(item.subjectCode);
      const uniqueLogs = (item.logs || []).filter((l: any) => l && l.date);
      const markedLogs = uniqueLogs.filter(
        (l: any) =>
          l.status === "Present" ||
          l.status === "Absent" ||
          l.status === "Leave",
      );
      const total = markedLogs.length;
      const attended = markedLogs.filter((l: any) => l.status === "Present").length;
      const absent = markedLogs.filter((l: any) => l.status === "Absent").length;
      const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 0;
      result.push({
        ...item,
        totalClasses: total,
        attendedClasses: attended,
        absentClasses: absent,
        leaveClasses: markedLogs.filter((l: any) => l.status === "Leave").length,
        pendingClasses: uniqueLogs.filter((l: any) => l.status === "Pending").length,
        percentage: pct,
        logs: uniqueLogs,
      });
    }
  }

  return result;
}

function sanitizeSchoolTimetable(data: TimetableSlot[]): TimetableSlot[] {
  if (!Array.isArray(data)) {
    return [];
  }
  // Exclude legacy pre-filled mock slots to ensure only Principal-configured schedules appear
  const clean = data.filter(
    (slot) =>
      slot &&
      typeof slot.id === "string" &&
      !slot.id.startsWith("tt_mon_") &&
      !slot.id.startsWith("tt_tue_") &&
      !slot.id.startsWith("tt_wed_") &&
      !slot.id.startsWith("tt_thu_") &&
      !slot.id.startsWith("tt_fri_") &&
      !slot.id.startsWith("tt_sat_"),
  );
  return sortTimetableSlots(clean);
}

const generateUniqueId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export function sanitizeSchoolClasses(
  data: SchoolClassInfo[],
): SchoolClassInfo[] {
  if (!Array.isArray(data) || data.length === 0) return DEFAULT_SCHOOL_CLASSES;

  const validClasses: SchoolClassInfo[] = [];
  const seenKeys = new Set<string>();

  // Ensure strictly only 1 agriculture class for Class 11 and only 1 agriculture class for Class 12
  let hasClass11Agri = false;
  let hasClass12Agri = false;

  for (const item of data) {
    if (!item || !item.className) continue;

    const nameStr = (item.className || "").toLowerCase();
    const secStr = (item.section || "").toLowerCase();
    const streamStr = (item.stream || "").toLowerCase();
    const codeStr = (item.classCode || "").toLowerCase();
    const idStr = (item.id || "").toLowerCase();

    const isAgri =
      streamStr.includes("agri") ||
      secStr.includes("agri") ||
      codeStr.includes("ag") ||
      codeStr.includes("12-s") ||
      codeStr.includes("12-1") ||
      codeStr.includes("11-s") ||
      codeStr.includes("11-1") ||
      idStr.includes("agri");

    if (isAgri) {
      if (
        nameStr.includes("11") ||
        codeStr.startsWith("11") ||
        idStr.includes("11")
      ) {
        if (hasClass11Agri) continue; // Drop any duplicate
        hasClass11Agri = true;
        validClasses.push({
          id: "cls_11_agri",
          classCode: "11-AG",
          className: "Class 11",
          section: "Section AG (Agriculture Science)",
          stream: "Agriculture Science",
          roomNo: "Room 106 (Agri-Lab)",
          building: "Applied Agricultural Sciences Complex",
          capacity: item.capacity || 40,
          classTeacherId: "TCH007",
          classTeacherName: "Dr. Ramesh Patel",
          academicYear: "2026-2027",
          subjects: item.subjects?.length
            ? item.subjects
            : DEFAULT_SCHOOL_CLASSES.find((c) => c.id === "cls_11_agri")
                ?.subjects || [],
        });
        continue;
      } else if (
        nameStr.includes("12") ||
        codeStr.startsWith("12") ||
        idStr.includes("12")
      ) {
        if (hasClass12Agri) continue; // Drop any duplicate
        hasClass12Agri = true;
        validClasses.push({
          id: "cls_12_agri",
          classCode: "12-AG",
          className: "Class 12",
          section: "Section AG (Agriculture Science)",
          stream: "Agriculture Science",
          roomNo: "Room 205 (Agronomy Research Wing)",
          building: "Applied Agricultural Sciences Complex",
          capacity: item.capacity || 40,
          classTeacherId: "TCH007",
          classTeacherName: "Dr. Ramesh Patel",
          academicYear: "2026-2027",
          subjects: item.subjects?.length
            ? item.subjects
            : DEFAULT_SCHOOL_CLASSES.find((c) => c.id === "cls_12_agri")
                ?.subjects || [],
        });
        continue;
      }
    }

    // Skip any rogue test/duplicate code artifacts
    if (
      codeStr === "12-s" ||
      codeStr === "12-1" ||
      codeStr === "11-s" ||
      codeStr === "11-1"
    ) {
      continue;
    }

    const key = `${item.className}_${item.classCode || item.section}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      validClasses.push(item);
    }
  }

  // Ensure default standard classes (including 11-AG and 12-AG) exist
  DEFAULT_SCHOOL_CLASSES.forEach((def) => {
    const exists = validClasses.some(
      (c) =>
        c.id === def.id ||
        (c.className === def.className && c.classCode === def.classCode),
    );
    if (!exists) {
      validClasses.push(def);
    }
  });

  return validClasses;
}

const INITIAL_STUDENT_LEAVES: StudentLeaveRequest[] = [
  {
    id: "LEAVE-001",
    studentId: "STU20261101",
    studentName: "Piyush Panwar",
    rollNo: "01",
    className: "Class 11",
    section: "A",
    type: "Medical",
    startDate: "2026-09-08",
    endDate: "2026-09-10",
    days: 3,
    reason:
      "Bed rest prescribed for acute viral bronchitis. Attached clinic certificate dated 18-Feb.",
    documentUrl: "#",
    documentName: "medical_cert_scan.pdf",
    documentSize: "1.2 MB",
    status: "Pending",
    appliedOn: "2026-09-07",
  },
];

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMockData, setIsMockData] = useState<boolean>(() =>
    isMockDataEnabled(),
  );
  const [dataMode, setDataModeState] = useState<"mock" | "firebase">(() =>
    getDataMode(),
  );

  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        isMock: boolean;
        mode: "mock" | "firebase";
      }>;
      if (
        customEvent.detail &&
        typeof customEvent.detail.isMock === "boolean"
      ) {
        setIsMockData(customEvent.detail.isMock);
        setDataModeState(customEvent.detail.mode);
      } else {
        setIsMockData(isMockDataEnabled());
        setDataModeState(getDataMode());
      }
    };
    window.addEventListener("edux-data-mode-change", handleModeChange);
    return () =>
      window.removeEventListener("edux-data-mode-change", handleModeChange);
  }, []);

  const toggleDataMode = () => {
    const next = toggleMockDataMode();
    setIsMockData(next);
    setDataModeState(next ? "mock" : "firebase");
  };

  const setDataMode = (useMock: boolean) => {
    setMockDataMode(useMock);
    setIsMockData(useMock);
    setDataModeState(useMock ? "mock" : "firebase");
  };

  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);

  const dispatchFeeNotice = (studentName: string, amount: string) => {
    setFeeNotices((prev: any) => [
      {
        id: Date.now().toString(),
        studentName,
        amount,
        date: new Date().toISOString(),
        isAcknowledged: false,
      },
      ...prev,
    ]);

    // Also add a general notification for good measure
    addNotification({
      title: `Fee Notice Sent to ${studentName}`,
      message: `Principal dispatched a direct fee reminder for ${amount}.`,
      category: "Fee",
      priority: "High",
    });
  };

  const acknowledgeFeeNotice = (id: string) => {
    setFeeNotices((prev: any) =>
      prev.map((n) => (n.id === id ? { ...n, isAcknowledged: true } : n)),
    );
  };

  const [feeRoster, setFeeRoster] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("edux_fee_roster");
      if (saved) return JSON.parse(saved);
    } catch (e: any) {
      console.error(e);
    }
    return [
      {
        name: "Aarav Patel",
        grade: "9-A",
        dueAmount: "₹18,500",
        initials: "AP",
        colorClass:
          "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50",
        subtitleText: "10 Dec Expiry",
        subtitleColor: "text-rose-600",
      },
      {
        name: "Sneha Sharma",
        grade: "11 PCM",
        dueAmount: "₹21,500",
        initials: "SS",
        colorClass:
          "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
        subtitleText: "Grace Period (2d)",
        subtitleColor: "text-amber-600",
      },
      {
        name: "Rohan M. Varma",
        grade: "10-C",
        dueAmount: "₹19,000",
        initials: "RV",
        colorClass:
          "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50",
        subtitleText: "Overdue (5d)",
        subtitleColor: "text-rose-600",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("edux_fee_roster", JSON.stringify(feeRoster));
  }, [feeRoster]);

  const addStudentToFeeRoster = (studentData: any) => {
    setFeeRoster((prev: any) => {
      if (prev.find((s: any) => s.name === studentData.name)) return prev;
      return [studentData, ...prev];
    });
  };

  const removeStudentFromFeeRoster = (name: string) => {
    setFeeRoster((prev: any) => prev.filter((s: any) => s.name !== name));
  };

  const updateStudentFeeInRoster = (name: string, newAmount: string) => {
    setFeeRoster((prev: any) =>
      prev.map((s: any) => (s.name === name ? { ...s, dueAmount: newAmount } : s)),
    );
  };

  const [feeRequests, setFeeRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("edux_fee_requests");
      if (saved) return JSON.parse(saved);
    } catch (e: any) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("edux_fee_requests", JSON.stringify(feeRequests));
  }, [feeRequests]);

  const [studentInstallments, setStudentInstallments] = useState<
    Record<string, any[]>
  >(() => {
    try {
      const saved = localStorage.getItem("edux_student_installments");
      if (saved) return JSON.parse(saved);
    } catch (e: any) {
      console.error(e);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(
      "edux_student_installments",
      JSON.stringify(studentInstallments),
    );
  }, [studentInstallments]);

  const submitFeeRequest = (request: any) => {
    setFeeRequests((prev: any) => [
      {
        ...request,
        id: Date.now().toString(),
        status: "PENDING",
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const [bursarMessages, setBursarMessages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("edux_bursar_msgs");
      if (saved) return JSON.parse(saved);
    } catch (e: any) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("edux_bursar_msgs", JSON.stringify(bursarMessages));
  }, [bursarMessages]);

  const sendBursarMessage = (msg: any) => {
    setBursarMessages((prev: any) => [
      {
        ...msg,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const markBursarMessagesAsRead = () => {
    setBursarMessages((prev: any) => prev.map((m: any) => ({ ...m, read: true })));
  };

  const approveFeeRequest = (requestId: string, splitTerms: any[]) => {
    setFeeRequests((prev: any) => {
      const updated = prev.map((r) =>
        r.id === requestId ? { ...r, status: "APPROVED" } : r,
      );
      const approvedRequest = updated.find((r) => r.id === requestId);

      // Update student installments
      if (approvedRequest) {
        setStudentInstallments((prevInst) => ({
          ...prevInst,
          [approvedRequest.studentName]: splitTerms,
        }));
      }
      return updated;
    });
  };

  const { student: authStudent } = useAuth();
  const activeStudentId = authStudent?.studentId || "STU20261101";

  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem("edux_students");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(
            parsed.map((s: any) => s.studentId || s.id),
          );
          const missing = DEMO_STUDENTS.filter(
            (d) => !existingIds.has(d.studentId) && !existingIds.has(d.id),
          );
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
          return parsed;
        }
      }
      return DEMO_STUDENTS;
    } catch {
      return DEMO_STUDENTS;
    }
  });

  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => {
    try {
      const saved = localStorage.getItem("edux_teachers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(
            parsed.map((t: any) => t.teacherId || t.id),
          );
          const missing = DEMO_TEACHERS.filter(
            (t) => !existingIds.has(t.teacherId) && !existingIds.has(t.id),
          );
          if (missing.length > 0) {
            return [...parsed, ...missing];
          }
          return parsed;
        }
      }
      return DEMO_TEACHERS;
    } catch {
      return DEMO_TEACHERS;
    }
  });

  const [classes, setClasses] = useState<SchoolClassInfo[]>(() => {
    try {
      const saved = localStorage.getItem("edux_school_classes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeSchoolClasses(parsed);
          localStorage.setItem(
            "edux_school_classes",
            JSON.stringify(sanitized),
          );
          return sanitized;
        }
      }
      const initial = sanitizeSchoolClasses(DEFAULT_SCHOOL_CLASSES);
      localStorage.setItem("edux_school_classes", JSON.stringify(initial));
      return initial;
    } catch {
      return DEFAULT_SCHOOL_CLASSES;
    }
  });

  const [studentAttendanceMap, setStudentAttendanceMap] = useState<
    Record<string, AttendanceRecord[]>
  >(() => {
    try {
      const resetFlag = localStorage.getItem(
        "edux_attendance_session_fresh_v2026_08",
      );
      if (!resetFlag) {
        // One-time fresh session reset for all students to 0/0
        localStorage.setItem("edux_attendance_session_fresh_v2026_08", "true");
        localStorage.removeItem("edux_student_attendance_map");
        localStorage.setItem(
          "edux_attendance",
          JSON.stringify(INITIAL_ATTENDANCE),
        );
        localStorage.removeItem("edux_daily_class_reports");
        return {};
      }
      const savedMap = localStorage.getItem("edux_student_attendance_map");
      if (savedMap) {
        const parsed = JSON.parse(savedMap);
        if (
          parsed &&
          typeof parsed === "object" &&
          Object.keys(parsed).length > 0
        ) {
          const sanitizedMap: Record<string, AttendanceRecord[]> = {
            ...DEFAULT_STUDENTS_ATTENDANCE_MAP,
          };
          Object.entries(parsed).forEach(([stuId, records]) => {
            if (Array.isArray(records)) {
              sanitizedMap[stuId] = sanitizeSchoolAttendance(
                records as AttendanceRecord[],
              );
            }
          });
          return sanitizedMap;
        }
      }
    } catch {}
    return { ...DEFAULT_STUDENTS_ATTENDANCE_MAP };
  });

  const getStudentAttendance = (studentId: string): AttendanceRecord[] => {
    const targetStudent =
      students.find((s: any) => s.studentId === studentId || s.id === studentId) ||
      (studentId === "STU20261101" || studentId === "STU202611A01"
        ? PIYUSH_PANWAR
        : null);

    let rawList: AttendanceRecord[];
    if (studentId && studentAttendanceMap[studentId]) {
      rawList = studentAttendanceMap[studentId];
    } else if (studentId && DEFAULT_STUDENTS_ATTENDANCE_MAP[studentId]) {
      rawList = DEFAULT_STUDENTS_ATTENDANCE_MAP[studentId];
    } else if (!studentId) {
      rawList = attendance;
    } else {
      rawList = createFreshStudentAttendance(targetStudent);
    }
    return sanitizeSchoolAttendance(rawList, targetStudent);
  };

  const getStudentAttendanceSummary = (studentId: string) => {
    const records = getStudentAttendance(studentId);
    const totalClasses = records.reduce(
      (sum, r) => sum + (r.totalClasses || 0),
      0,
    );
    const attendedClasses = records.reduce(
      (sum, r) => sum + (r.attendedClasses || 0),
      0,
    );
    const absentClasses = records.reduce(
      (sum, r) => sum + (r.absentClasses || 0),
      0,
    );
    const leaveClasses = records.reduce(
      (sum, r) => sum + (r.leaveClasses || 0),
      0,
    );
    const pendingClasses = records.reduce(
      (sum, r) => sum + (r.pendingClasses || 0),
      0,
    );
    const percentage =
      totalClasses > 0
        ? Number(((attendedClasses / totalClasses) * 100).toFixed(1))
        : 0;
    return {
      totalClasses,
      attendedClasses,
      absentClasses,
      leaveClasses,
      pendingClasses,
      percentage,
    };
  };

  const [studentLeaves, setStudentLeaves] = useState<StudentLeaveRequest[]>(
    () => {
      const saved = localStorage.getItem("edux_student_leaves");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e: any) {
          console.error(e);
        }
      }
      return INITIAL_STUDENT_LEAVES;
    },
  );

  useEffect(() => {
    localStorage.setItem("edux_student_leaves", JSON.stringify(studentLeaves));
  }, [studentLeaves]);

  const applyForLeave = (
    leaveData: Omit<StudentLeaveRequest, "id" | "status" | "appliedOn">,
  ) => {
    const newLeave: StudentLeaveRequest = {
      ...leaveData,
      id: `LEAVE-${Date.now()}`,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
    };
    setStudentLeaves((prev: any) => [newLeave, ...prev]);
  };

  const updateStudentLeaveStatus = (
    leaveId: string,
    status: "Approved" | "Rejected",
  ) => {
    setStudentLeaves((prev: any) =>
      prev.map((l: any) => (l.id === leaveId ? { ...l, status } : l)),
    );
  };

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const activeId = activeStudentId;
      const savedMap = localStorage.getItem("edux_student_attendance_map");
      if (savedMap) {
        const parsed = JSON.parse(savedMap);
        if (parsed && parsed[activeId]) {
          return sanitizeSchoolAttendance(parsed[activeId]);
        }
      }
      if (DEFAULT_STUDENTS_ATTENDANCE_MAP[activeId]) {
        return sanitizeSchoolAttendance(
          DEFAULT_STUDENTS_ATTENDANCE_MAP[activeId],
        );
      }
      if (
        activeId &&
        activeId !== "STU20261101" &&
        activeId !== "STU202611A01"
      ) {
        return createFreshStudentAttendance();
      }
      const saved = localStorage.getItem("edux_attendance");
      const data: AttendanceRecord[] = saved
        ? JSON.parse(saved)
        : INITIAL_ATTENDANCE;
      return sanitizeSchoolAttendance(data);
    } catch {
      return createFreshStudentAttendance();
    }
  });

  // Keep attendance in sync whenever activeStudentId changes or studentAttendanceMap updates
  useEffect(() => {
    const activeRecords = getStudentAttendance(activeStudentId);
    setAttendance(activeRecords);
    try {
      localStorage.setItem("edux_attendance", JSON.stringify(activeRecords));
    } catch {}
  }, [activeStudentId, studentAttendanceMap]);

  const [studentResultsMap, setStudentResultsMap] = useState<
    Record<string, SemesterResult[]>
  >(() => {
    try {
      const saved = localStorage.getItem("edux_student_results_map_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === "object" &&
          Object.keys(parsed).length > 0
        ) {
          return parsed;
        }
      }
    } catch {}
    return {
      STU20261101: SEMESTER_RESULTS,
      STU202611A01: SEMESTER_RESULTS,
    };
  });

  const getStudentResults = (studentId: string): SemesterResult[] => {
    if (!studentId) return results;
    if (studentResultsMap[studentId]) {
      return studentResultsMap[studentId];
    }
    if (studentId === "STU20261101" || studentId === "STU202611A01") {
      return SEMESTER_RESULTS;
    }
    return [];
  };

  const [results, setResults] = useState<SemesterResult[]>(() => {
    try {
      const activeId = activeStudentId;
      if (activeId && studentResultsMap[activeId]) {
        return studentResultsMap[activeId];
      }
      if (
        activeId &&
        (activeId === "STU20261101" || activeId === "STU202611A01")
      ) {
        return SEMESTER_RESULTS;
      }
      if (
        activeId &&
        activeId !== "STU20261101" &&
        activeId !== "STU202611A01"
      ) {
        return [];
      }
      const saved = localStorage.getItem("edux_results_v2");
      return saved ? JSON.parse(saved) : SEMESTER_RESULTS;
    } catch {
      return [];
    }
  });

  // Keep results in sync whenever activeStudentId changes or studentResultsMap updates
  useEffect(() => {
    const activeRes = getStudentResults(activeStudentId);
    setResults(activeRes);
    try {
      localStorage.setItem("edux_results_v2", JSON.stringify(activeRes));
    } catch {}
  }, [activeStudentId, studentResultsMap]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "edux_student_results_map_v2",
        JSON.stringify(studentResultsMap),
      );
    } catch {}
  }, [studentResultsMap]);

  const DEFAULT_TEACHER_RESOURCES: TeacherResource[] = [
    {
      id: "res-hw-physics-1",
      type: "homework",
      title: "Electromagnetic Wave Interference & Numerical Problems",
      subjectCode: "PHY101",
      subjectName: "Physics (Class 11 - Theory & Lab)",
      className: "Class 11",
      fileName: "worksheet_ch8_numerical.pdf",
      fileSize: "2.4 MB",
      fileData: "https://stxaviersonline.edu/notes/worksheet_ch8_numerical.pdf",
      message:
        "Solve questions 1 to 15 from Chapter 8 NCERT workbook. Show clear step-by-step vector formulations. Submit before deadline.",
      uploadDate: "2026-09-05T09:30:00.000Z",
      dueDate: "2026-09-07",
      dueLabel: "Due Tomorrow",
      maxMarks: 25,
      category: "Question Bank",
      uploadedBy: "Mr. Rajesh Sharma",
      teacherId: "TCH001",
      totalStudents: 48,
      submissions: Array.from({ length: 42 }, (_, i) => ({
        studentId: `STU-11-${String(i + 1).padStart(3, "0")}`,
        studentName: i === 0 ? "Tanmay Singh" : `Student ${i + 1}`,
        fileName: `worksheet_ch8_solution_${i + 1}.pdf`,
        submittedAt: "2026-09-05T14:20:00.000Z",
        status: "Submitted" as const,
      })),
    },
    {
      id: "res-hw-math-1",
      type: "homework",
      title: "Definite Integrals: Area Under Curves Exercise 8.2",
      subjectCode: "MATH101",
      subjectName: "Mathematics",
      className: "Class 11",
      fileName: "Integrals_Practice_Sheet.pdf",
      fileSize: "1.8 MB",
      fileData:
        "https://stxaviersonline.edu/notes/Integrals_Practice_Sheet.pdf",
      message:
        "Complete the assigned problems from Ex 8.2 (Q5 to Q12). Graph plots must be clearly drawn on standard grid paper.",
      uploadDate: "2026-09-04T11:00:00.000Z",
      dueDate: "2026-09-10",
      dueLabel: "Due in 3 Days",
      maxMarks: 20,
      category: "Formula References",
      uploadedBy: "Mr. Vikram Singh",
      teacherId: "TCH003",
      totalStudents: 48,
      submissions: Array.from({ length: 38 }, (_, i) => ({
        studentId: `STU-11-${String(i + 1).padStart(3, "0")}`,
        studentName: `Student ${i + 1}`,
        fileName: `integrals_ex8.2_sol_${i + 1}.pdf`,
        submittedAt: "2026-09-04T16:00:00.000Z",
        status: "Submitted" as const,
      })),
    },
    {
      id: "res-syl-physics-1",
      type: "syllabus",
      title: "NCERT Physics Term-2 Complete Syllabus & Unit Weightage",
      subjectCode: "PHY101",
      subjectName: "Physics (Class 11 - Theory & Lab)",
      className: "Class 11",
      fileName: "physics_unit4_problem_set_v2.pdf",
      fileSize: "1.4 MB",
      fileData:
        "https://stxaviersonline.edu/notes/physics_unit4_problem_set_v2.pdf",
      message:
        "NCERT Physics Term-2 Complete Syllabus & Unit Weightage schema.",
      uploadDate: "2026-09-03T10:00:00.000Z",
      readCount: 48,
      totalStudents: 48,
      category: "Syllabus & Blueprint",
      uploadedBy: "Mr. Rajesh Sharma",
      teacherId: "TCH001",
    },
    {
      id: "res-syl-curriculum-1",
      type: "syllabus",
      title: "Class 11 PCM Reduced Syllabus 2025-26",
      subjectCode: "PCM100",
      subjectName: "Curriculum Documents",
      className: "Class 11",
      fileName: "cbse_reduced_curriculum_2025_26.pdf",
      fileSize: "3.1 MB",
      fileData:
        "https://stxaviersonline.edu/notes/cbse_reduced_curriculum_2025_26.pdf",
      message: "Official CBSE Board Curriculum • PDF",
      uploadDate: "2026-08-20T10:00:00.000Z",
      readCount: 48,
      totalStudents: 48,
      category: "CBSE 2026",
      uploadedBy: "Academic Dean",
      teacherId: "ADMIN",
    },
    {
      id: "res-hw-chem-eval",
      type: "homework",
      title: "Salt Analysis & Cation Detection Lab Report",
      subjectCode: "CHEM101",
      subjectName: "Chemistry Lab",
      className: "Class 11",
      fileName: "salt_analysis_record.pdf",
      fileSize: "2.0 MB",
      fileData: "https://stxaviersonline.edu/notes/salt_analysis_record.pdf",
      message: "Flame test observations and schematic diagram of cations.",
      uploadDate: "2026-02-12T10:00:00.000Z",
      dueDate: "2026-02-15",
      dueLabel: "Checked: Feb 16, 2026",
      maxMarks: 20,
      category: "Lab Practical",
      uploadedBy: "Mrs. Sunita Verma",
      teacherId: "TCH002",
      totalStudents: 48,
      submissions: [
        {
          studentId: "STU20261101",
          studentName: "Piyush Panwar",
          fileName: "salt_analysis_lab_report_piyush.pdf",
          submittedAt: "2026-02-14T11:30:00.000Z",
          marks: "19 / 20",
          status: "Graded" as const,
          remark:
            "Remark: Excellent observations in flame test and neat schematic diagram of cations.",
        },
        {
          studentId: "stu_91",
          studentName: "Aarav Patel",
          fileName: "salt_analysis_lab_report_aarav.pdf",
          submittedAt: "2026-02-14T11:30:00.000Z",
          marks: "19 / 20",
          status: "Graded" as const,
          remark:
            "Remark: Excellent observations in flame test and neat schematic diagram of cations.",
        },
        {
          studentId: "STU001",
          studentName: "Ayush Ahir",
          fileName: "salt_analysis_lab_report_ayush.pdf",
          submittedAt: "2026-02-14T11:30:00.000Z",
          marks: "19 / 20",
          status: "Graded" as const,
          remark:
            "Remark: Excellent observations in flame test and neat schematic diagram of cations.",
        },
      ],
    },
  ];

  const [teacherResources, setTeacherResources] = useState<TeacherResource[]>(
    () => {
      try {
        const saved = localStorage.getItem("edux_teacher_resources");
        let current: TeacherResource[] = saved ? JSON.parse(saved) : [];

        // Sanitize and fix subject/teacher bindings for any existing user entries
        current = current.map((r) => {
          const titleLower = (r.title || "").toLowerCase();
          const uplLower = (r.uploadedBy || "").toLowerCase();

          // 1. First homework: "Ye Piyush ki copy he..." is Chemistry uploaded by Mrs. Sunita Verma
          if (titleLower.includes("piyush") || titleLower.includes("piyus")) {
            return {
              ...r,
              subjectName: "Chemistry (Class 11 - Theory & Lab)",
              subjectCode: "CHEM101",
              uploadedBy: "Mrs. Sunita Verma",
              teacherId: "TCH002",
              message:
                "Complete coursework and study references dispatched by Mrs. Sunita Verma.",
            };
          }

          // 2. Second homework: "This question all questions..." is Physics uploaded by Mr. Rajesh Sharma
          if (
            titleLower.includes("this question") ||
            titleLower.includes("rough copy")
          ) {
            return {
              ...r,
              subjectName: "Physics (Class 11 - Theory & Lab)",
              subjectCode: "PHY101",
              uploadedBy: "Mr. Rajesh Sharma",
              teacherId: "TCH001",
              message:
                "Complete coursework and study references dispatched by Mr. Rajesh Sharma.",
            };
          }

          // Tag teacherId if missing based on uploadedBy
          if (!r.teacherId) {
            if (uplLower.includes("sunita") || uplLower.includes("verma")) {
              return { ...r, teacherId: "TCH002" };
            }
            if (uplLower.includes("rajesh") || uplLower.includes("sharma")) {
              return { ...r, teacherId: "TCH001" };
            }
            if (uplLower.includes("vikram") || uplLower.includes("singh")) {
              return { ...r, teacherId: "TCH003" };
            }
            if (uplLower.includes("ananya") || uplLower.includes("gupta")) {
              return { ...r, teacherId: "TCH004" };
            }
          }

          return r;
        });

        // Merge default demo resources if missing
        const existingIds = new Set(current.map((r) => r.id));
        const toAdd = DEFAULT_TEACHER_RESOURCES.filter(
          (d) => !existingIds.has(d.id),
        );

        const merged = [...current, ...toAdd];
        localStorage.setItem("edux_teacher_resources", JSON.stringify(merged));
        localStorage.removeItem("edux_deleted_resource_ids");
        return merged;
      } catch {
        return DEFAULT_TEACHER_RESOURCES;
      }
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        "edux_teacher_resources",
        JSON.stringify(teacherResources),
      );
    } catch {}
  }, [teacherResources]);

  const addTeacherResource = (
    resourceData: Omit<TeacherResource, "id" | "uploadDate">,
  ) => {
    const newResource: TeacherResource = {
      ...resourceData,
      id: generateUniqueId("res"),
      uploadDate: new Date().toISOString(),
    };
    setTeacherResources((prev: any) => {
      const updated = [newResource, ...prev];
      try {
        localStorage.setItem("edux_teacher_resources", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: "New Resource Added",
      message: `${resourceData.uploadedBy} uploaded ${resourceData.type} for ${resourceData.subjectName}`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const deleteTeacherResource = (id: string) => {
    setTeacherResources((prev: any) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem("edux_teacher_resources", JSON.stringify(updated));
      } catch (e: any) {
        console.error("Error saving deleted resource", e);
      }
      return updated;
    });
  };

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem("edux_timetable");
      const data: TimetableSlot[] = saved
        ? JSON.parse(saved)
        : INITIAL_TIMETABLE;
      return sanitizeSchoolTimetable(data);
    } catch {
      return INITIAL_TIMETABLE;
    }
  });

  const [exams, setExams] = useState<ExamScheduleItem[]>(() => {
    const saved = localStorage.getItem("edux_exams_v3");
    return saved ? JSON.parse(saved) : EXAM_SCHEDULE;
  });

  const [feeSummary, setFeeSummary] = useState(INITIAL_FEES.summary);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdownItem[]>(
    INITIAL_FEES.breakdown,
  );
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(
    INITIAL_FEES.transactions,
  );

  const [hostelComplaints, setHostelComplaints] = useState<HostelComplaint[]>(
    INITIAL_HOSTEL_COMPLAINTS,
  );
  const [documents, setDocuments] =
    useState<AcademicDocument[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem("edux_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [feedbacks, setFeedbacks] =
    useState<FeedbackSubmission[]>(INITIAL_FEEDBACKS);
  const [calendarEvents] = useState<AcademicCalendarEvent[]>(
    ACADEMIC_CALENDAR_EVENTS,
  );
  const [mentorLogs, setMentorLogs] = useState<MentorLog[]>(MENTOR_LOGS);

  // Extended Principal Module States
  const [schoolFeeSummary, setSchoolFeeSummary] = useState<
    SchoolFeeClassSummary[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_principal_fee_summary");
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_FEE_SUMMARY;
    } catch {
      return INITIAL_SCHOOL_FEE_SUMMARY;
    }
  });

  const [schoolFeeTransactions, setSchoolFeeTransactions] = useState<
    SchoolFeeTransaction[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_principal_fee_txns");
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_FEE_TRANSACTIONS;
    } catch {
      return INITIAL_SCHOOL_FEE_TRANSACTIONS;
    }
  });

  const [feeDefaulters, setFeeDefaulters] = useState<FeeDefaulterRecord[]>(
    () => {
      try {
        const saved = localStorage.getItem("edux_principal_defaulters");
        return saved ? JSON.parse(saved) : INITIAL_FEE_DEFAULTERS;
      } catch {
        return INITIAL_FEE_DEFAULTERS;
      }
    },
  );

  const [expenseRequests, setExpenseRequests] = useState<
    ExpenseApprovalRequest[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_principal_expenses");
      return saved ? JSON.parse(saved) : INITIAL_EXPENSE_REQUESTS;
    } catch {
      return INITIAL_EXPENSE_REQUESTS;
    }
  });

  const [staffAttendanceLogs, setStaffAttendanceLogs] = useState<
    StaffDailyAttendanceLog[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_principal_staff_attendance");
      return saved ? JSON.parse(saved) : INITIAL_STAFF_ATTENDANCE;
    } catch {
      return INITIAL_STAFF_ATTENDANCE;
    }
  });

  const [staffLeaves, setStaffLeaves] = useState<StaffLeaveApplication[]>(
    () => {
      try {
        const saved = localStorage.getItem("edux_principal_staff_leaves");
        return saved ? JSON.parse(saved) : INITIAL_STAFF_LEAVES;
      } catch {
        return INITIAL_STAFF_LEAVES;
      }
    },
  );

  const [staffMonthlyTrends, setStaffMonthlyTrends] = useState<
    StaffMonthlyTrend[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_principal_staff_trends");
      return saved ? JSON.parse(saved) : INITIAL_STAFF_MONTHLY_TRENDS;
    } catch {
      return INITIAL_STAFF_MONTHLY_TRENDS;
    }
  });

  const [academicAnalytics, setAcademicAnalytics] =
    useState<AcademicExamAnalytics>(() => {
      try {
        const saved = localStorage.getItem("edux_principal_academic_analytics");
        return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_ANALYTICS;
      } catch {
        return INITIAL_ACADEMIC_ANALYTICS;
      }
    });

  // Super Admin & Multi-Tenant SaaS Platform States
  const [schoolTenants, setSchoolTenants] = useState<SchoolTenant[]>(() => {
    try {
      const saved = localStorage.getItem("edux_platform_school_tenants");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [globalUsers, setGlobalUsers] = useState<GlobalUserProfile[]>(() => {
    try {
      const saved = localStorage.getItem("edux_platform_global_users");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [platformInvoices, setPlatformInvoices] = useState<
    PlatformBillingInvoice[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_platform_invoices");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem("edux_platform_support_tickets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [platformMetrics, setPlatformMetrics] =
    useState<PlatformMetricsSummary>(() => {
      try {
        const saved = localStorage.getItem("edux_platform_metrics");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    });

  // Daily Class Attendance Reports submitted by teachers for Principal view
  const [dailyClassReports, setDailyClassReports] = useState<
    DailyClassAttendanceReport[]
  >(() => {
    try {
      const saved = localStorage.getItem("edux_daily_class_reports");
      return saved ? JSON.parse(saved) : INITIAL_DAILY_CLASS_REPORTS;
    } catch {
      return INITIAL_DAILY_CLASS_REPORTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "edux_daily_class_reports",
      JSON.stringify(dailyClassReports),
    );
  }, [dailyClassReports]);

  useEffect(() => {
    localStorage.setItem(
      "edux_platform_school_tenants",
      JSON.stringify(schoolTenants),
    );
  }, [schoolTenants]);

  useEffect(() => {
    localStorage.setItem(
      "edux_platform_global_users",
      JSON.stringify(globalUsers),
    );
  }, [globalUsers]);

  useEffect(() => {
    localStorage.setItem(
      "edux_platform_invoices",
      JSON.stringify(platformInvoices),
    );
  }, [platformInvoices]);

  useEffect(() => {
    localStorage.setItem(
      "edux_platform_support_tickets",
      JSON.stringify(supportTickets),
    );
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem(
      "edux_platform_metrics",
      JSON.stringify(platformMetrics),
    );
  }, [platformMetrics]);

  // Teacher active class state across the app (defaults to '11', can switch between '11' and '12')
  const [activeTeacherClass, setActiveTeacherClass] =
    useState<TeacherClassCode>(() => {
      const saved = localStorage.getItem("edux_teacher_active_class");
      return (saved as TeacherClassCode) === "12" ? "12" : "11";
    });

  const [teacherActiveSubTab, setTeacherActiveSubTab] = useState<
    | "attendance"
    | "marks"
    | "homework"
    | "timetable"
    | "exams"
    | "notice"
    | "roster"
    | "add-student"
    | "leave-requests"
    | "chat"
    | "my-leaves"
  >("attendance");

  useEffect(() => {
    localStorage.setItem("edux_teacher_active_class", activeTeacherClass);
  }, [activeTeacherClass]);

  const switchTeacherClassAndAction = (
    cls: TeacherClassCode,
    targetSubTab:
      | "attendance"
      | "marks"
      | "homework"
      | "timetable"
      | "exams"
      | "notice"
      | "roster"
      | "add-student"
      | "leave-requests"
      | "chat"
      | "my-leaves" = "attendance",
  ) => {
    setActiveTeacherClass(cls);
    setTeacherActiveSubTab(targetSubTab);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("edux_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("edux_attendance", JSON.stringify(attendance));
  }, [attendance]);

  const isTimetableInitialMount = React.useRef(true);

  useEffect(() => {
    localStorage.setItem("edux_timetable", JSON.stringify(timetable));

    // Prevent fresh app with empty local storage from wiping the cloud database on first load
    if (isTimetableInitialMount.current) {
      isTimetableInitialMount.current = false;
      return;
    }

    // Background sync to Cloud Database
    fetchWithAuth("/api/timetable/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: timetable }),
    }).catch((err: any) => console.log("Timetable cloud sync note:", err));
  }, [timetable]);

  // Initial Data Fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch Attendance Reports
        const reportsRes = await fetchWithAuth("/api/attendance/reports");
        if (reportsRes.ok) {
          const cloudReports = await reportsRes.json();
          if (Array.isArray(cloudReports) && cloudReports.length > 0) {
            setDailyClassReports(cloudReports);
          }
        }

        // Fetch Timetable
        const ttRes = await fetchWithAuth("/api/timetable");
        if (ttRes.ok) {
          const cloudTimetable = await ttRes.json();
          if (Array.isArray(cloudTimetable) && cloudTimetable.length > 0) {
            setTimetable(sortTimetableSlots(cloudTimetable));
          }
        }
      } catch (e: any) {
        console.log("Cloud auto-sync note:", e);
      }
    };
    initializeData();
  }, []);

  // deleted
  // deleted
  // lmsMaterials removed

  // deleted
  // deleted
  // lmsAssignments removed

  useEffect(() => {
    localStorage.setItem("edux_exams_v3", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("edux_results_v2", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("edux_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_fee_summary",
      JSON.stringify(schoolFeeSummary),
    );
  }, [schoolFeeSummary]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_fee_txns",
      JSON.stringify(schoolFeeTransactions),
    );
  }, [schoolFeeTransactions]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_defaulters",
      JSON.stringify(feeDefaulters),
    );
  }, [feeDefaulters]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_expenses",
      JSON.stringify(expenseRequests),
    );
  }, [expenseRequests]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_staff_attendance",
      JSON.stringify(staffAttendanceLogs),
    );
  }, [staffAttendanceLogs]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_staff_leaves",
      JSON.stringify(staffLeaves),
    );
  }, [staffLeaves]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_staff_trends",
      JSON.stringify(staffMonthlyTrends),
    );
  }, [staffMonthlyTrends]);

  useEffect(() => {
    localStorage.setItem(
      "edux_principal_academic_analytics",
      JSON.stringify(academicAnalytics),
    );
  }, [academicAnalytics]);

  // Real-time & Background Sync with Google Cloud Firestore
  useEffect(() => {
    const syncFromFirestore = async () => {
      try {
        const cloudReports = await fetchAttendanceReportsFromCloud();
        if (Array.isArray(cloudReports) && cloudReports.length > 0) {
          setDailyClassReports((prev: any) => {
            const map = new Map<string, DailyClassAttendanceReport>();
            cloudReports.forEach((r: any) => map.set(r.id, r));
            prev.forEach((r) => {
              if (!map.has(r.id)) map.set(r.id, r);
            });
            return Array.from(map.values()).sort((a, b) =>
              (b.date || "").localeCompare(a.date || ""),
            );
          });
        }

        // When in live cloud mode, sync students & teachers from Firestore
        if (!isMockDataEnabled()) {
          const cloudStudents = await fetchStudentsFromCloud();
          if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
            setStudents(cloudStudents);
          } else {
            // Seed baseline students if empty
            await seedInitialDataToFirestore({
              students: DEMO_STUDENTS,
              teachers: DEMO_TEACHERS,
              classes: DEFAULT_SCHOOL_CLASSES,
            });
          }

          const cloudTeachers = await fetchTeachersFromCloud();
          if (Array.isArray(cloudTeachers) && cloudTeachers.length > 0) {
            setTeachers(cloudTeachers);
          }
        }
      } catch (err: any) {
        console.log("Cloud Firestore auto-sync notice:", err);
      }
    };

    syncFromFirestore();
  }, [isMockData]);

  const syncWithCloud = async () => {
    try {
      const res = await seedInitialDataToFirestore({
        students: students.length > 0 ? students : DEMO_STUDENTS,
        teachers: teachers.length > 0 ? teachers : DEMO_TEACHERS,
        classes: DEFAULT_SCHOOL_CLASSES,
        attendanceReports: dailyClassReports,
      });
      return {
        success: true,
        count: res.seededCount || dailyClassReports.length,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Sync failed" };
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev: any) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev: any) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (
    item: Omit<NotificationItem, "id" | "timestamp" | "isRead">,
  ) => {
    const newNotif: NotificationItem = {
      ...item,
      id: generateUniqueId("n"),
      timestamp: "Just now",
      isRead: false,
    };
    setNotifications((prev: any) => [newNotif, ...prev]);
  };

  const submitAssignment = (
    assignmentId: string,
    fileName: string,
    fileData: string,
    studentId: string,
    studentName: string,
  ) => {
    setTeacherResources((prev: any) =>
      prev.map((res) => {
        if (res.id === assignmentId) {
          const existing = res.submissions || [];
          const existingIndex = existing.findIndex(
            (s: any) => s.studentId === studentId,
          );

          const newSubmission = {
            studentId,
            studentName,
            fileName,
            fileData,
            submittedAt: new Date().toISOString(),
            status: "Submitted" as const,
          };

          if (existingIndex >= 0) {
            const updated = [...existing];
            updated[existingIndex] = newSubmission;
            return { ...res, submissions: updated };
          } else {
            return { ...res, submissions: [...existing, newSubmission] };
          }
        }
        return res;
      }),
    );
    addNotification({
      title: "Homework Submitted",
      message: `Your homework file "${fileName}" was successfully uploaded for teacher review.`,
      category: "Academic",
      priority: "Low",
    });
  };

  const gradeAssignment = (
    assignmentId: string,
    studentId: string,
    obtainedMarks: string | number,
    remark?: string,
  ) => {
    setTeacherResources((prev: any) =>
      prev.map((res) => {
        if (res.id === assignmentId) {
          const existing = res.submissions || [];
          return {
            ...res,
            submissions: existing.map((sub) =>
              sub.studentId === studentId
                ? {
                    ...sub,
                    marks: obtainedMarks,
                    remark: remark || sub.remark,
                    status: "Graded" as const,
                  }
                : sub,
            ),
          };
        }
        return res;
      }),
    );
    addNotification({
      title: "Assignment Graded",
      message: `Your submitted assignment has been evaluated. Marks: ${obtainedMarks}.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const incrementMaterialDownload = (id: string) => {};

  const payFee = (
    amount: number,
    categoryId: string,
    paymentMethod: "UPI" | "Card" | "NetBanking" | "Cash",
  ): FeeTransaction => {
    const receiptNo = `STX-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: FeeTransaction = {
      id: generateUniqueId("tx"),
      receiptNo,
      date: new Date().toISOString().split("T")[0],
      description: `Payment for ${categoryId}`,
      amount,
      paymentMethod,
      status: "Success",
    };

    setFeeTransactions((prev: any) => [newTx, ...prev]);

    setFeeBreakdown((prev: any) =>
      prev.map((f) =>
        f.id === categoryId || f.category === categoryId
          ? { ...f, status: "Paid" }
          : f,
      ),
    );

    setFeeSummary((prev: any) => {
      const newPaid = prev.paid + amount;
      const newDue = Math.max(0, prev.total - newPaid);
      return {
        ...prev,
        paid: newPaid,
        due: newDue,
        status: newDue === 0 ? "Paid" : "Partial",
      };
    });

    addNotification({
      title: "School Fee Payment Received",
      message: `Received fee payment of ₹${amount.toLocaleString()} via ${paymentMethod}. Receipt No: ${receiptNo}`,
      category: "Fee",
      priority: "High",
    });

    return newTx;
  };

  const applyBusPass = (
    routeNo: string,
    _routeName: string,
    busStop: string,
  ) => {
    addNotification({
      title: "Bus Route Registration Updated",
      message: `Bus pass details for ${routeNo} (${busStop}) updated by school transport desk.`,
      category: "General",
      priority: "Medium",
    });
  };

  const submitHostelComplaint = (
    category: HostelComplaint["category"],
    description: string,
  ) => {
    const newComplaint: HostelComplaint = {
      id: generateUniqueId("hc"),
      category,
      description,
      dateSubmitted: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setHostelComplaints((prev: any) => [newComplaint, ...prev]);

    addNotification({
      title: "School Maintenance Request Registered",
      message: `Your issue regarding "${category}" has been logged for school administration inspection.`,
      category: "General",
      priority: "Medium",
    });
  };

  const requestDocument = (type: AcademicDocument["type"], title: string) => {
    const newDoc: AcademicDocument = {
      id: generateUniqueId("doc"),
      title,
      type,
      issueDate: new Date().toISOString().split("T")[0],
      status: "Processing",
    };
    setDocuments((prev: any) => [newDoc, ...prev]);

    addNotification({
      title: "Certificate Application Submitted",
      message: `Application for ${title} submitted to School Administrative Office.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const submitFeedback = (
    feedbackData: Omit<FeedbackSubmission, "id" | "submittedAt" | "status">,
  ) => {
    const newFb: FeedbackSubmission = {
      ...feedbackData,
      id: generateUniqueId("fb"),
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    setFeedbacks((prev: any) => [newFb, ...prev]);

    addNotification({
      title: "Feedback Submitted to School Management",
      message: `Thank you for sharing your feedback under "${feedbackData.category}".`,
      category: "General",
      priority: "Low",
    });
  };

  const addMentorLog = (logData: Omit<MentorLog, "id">) => {
    const newLog: MentorLog = {
      ...logData,
      id: generateUniqueId("ml"),
    };
    setMentorLogs((prev: any) => [newLog, ...prev]);

    addNotification({
      title: "Class Teacher Discussion Logged",
      message: `Discussion notes with ${logData.mentorName} updated for ${logData.date}.`,
      category: "Academic",
      priority: "Low",
    });
  };

  const submitDailyClassReport = (
    reportData: Omit<
      DailyClassAttendanceReport,
      "id" | "submissionTime" | "attendancePercentage"
    >,
  ) => {
    const total = Number(reportData.totalStudents) || 0;
    const present = Number(reportData.presentStudents) || 0;
    const absent = Math.max(0, total - present);
    const pct = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newReport: DailyClassAttendanceReport = {
      ...reportData,
      id: generateUniqueId("dcr"),
      absentStudents: absent,
      attendancePercentage: pct,
      submissionTime: timeStr,
    };

    setDailyClassReports((prev: any) => [newReport, ...prev]);

    // Save directly to Google Cloud Firestore & Cloud Database
    try {
      saveAttendanceToCloud(newReport, []).catch((err: any) =>
        console.log("Cloud report sync note:", err),
      );
    } catch {}

    addNotification({
      title: `Daily Attendance Submitted: ${reportData.className}`,
      message: `${reportData.submittedByTeacherName} submitted daily attendance for ${reportData.className} (${reportData.section || "All"}). Present: ${present}/${total} (${pct}%), Faculties Present: ${reportData.facultiesPresentCount}.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const deleteDailyClassReport = (reportId: string) => {
    setDailyClassReports((prev: any) => prev.filter((r) => r.id !== reportId));
  };

  const acknowledgeDailyClassReport = (
    reportId: string,
    principalNotes?: string,
  ) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setDailyClassReports((prev: any) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "Verified by Principal" as const,
              principalAcknowledgedAt: timeStr,
              principalNotes:
                principalNotes || "Verified & approved by Principal Desk",
            }
          : r,
      ),
    );
  };

  const resetAllStudentAttendance = () => {
    // 1. Resolve active student
    const activeStudent =
      students.find(
        (s: any) => s.studentId === activeStudentId || s.id === activeStudentId,
      ) || PIYUSH_PANWAR;

    // Reset active attendance state to clean zeroed records strictly for active student's stream
    const freshAttendance = createFreshStudentAttendance(activeStudent);
    setAttendance(freshAttendance);

    // 2. Build empty/zeroed records for all students in roster strictly matching their stream
    const freshMap: Record<string, AttendanceRecord[]> = {};
    (students || []).forEach((stu) => {
      freshMap[stu.studentId] = createFreshStudentAttendance(stu);
      if (stu.id && stu.id !== stu.studentId) {
        freshMap[stu.id] = createFreshStudentAttendance(stu);
      }
    });
    setStudentAttendanceMap(freshMap);

    // 3. Reset daily class reports for fresh daily logging
    setDailyClassReports([]);

    // 4. Save clean zeroed states in localStorage
    try {
      localStorage.setItem("edux_attendance", JSON.stringify(freshAttendance));
      localStorage.setItem(
        "edux_student_attendance_map",
        JSON.stringify(freshMap),
      );
      localStorage.setItem("edux_daily_class_reports", JSON.stringify([]));
      localStorage.setItem("edux_attendance_session_fresh_v2026_08", "true");
    } catch {}

    addNotification({
      title: "Attendance Reset to 0/0 (New Session)",
      message:
        "Sabhi students ki attendance 0/0 karke refresh kar di gayi hai. Aaj se new attendance lagegi.",
      category: "Academic",
      priority: "High",
    });
  };

  const resetAttendanceToDefaults = resetAllStudentAttendance;

  // --- TEACHER EDITABILITY & LIVE SYNC ACTIONS ---

  const updateStudentAttendanceBatch = (
    className: string,
    subjectName: string,
    date: string,
    records: {
      studentId: string;
      status: "Present" | "Absent" | "Leave" | "Pending";
    }[],
  ) => {
    // 1. Resolve active student or first student
    let activeStudentId = "STU20261101";
    try {
      const savedStudent = localStorage.getItem("edux_student");
      if (savedStudent) {
        activeStudentId = JSON.parse(savedStudent).studentId || activeStudentId;
      }
    } catch {}

    const activeStudentProfile =
      students.find(
        (s: any) => s.studentId === activeStudentId || s.id === activeStudentId,
      ) || PIYUSH_PANWAR;
    const isEnrolledActive = isStudentEnrolledInSubject(
      activeStudentProfile,
      subjectName,
      activeStudentProfile.className,
    );

    const targetStudentRec = records.find(
      (r) => r.studentId === activeStudentId,
    );
    const activeStudentStatus: "Present" | "Absent" | "Leave" | "Pending" =
      targetStudentRec ? targetStudentRec.status : "Present";

    // 2. Identify standard subject config
    const subLower = (subjectName || "").toLowerCase();
    let stdConfig = STANDARD_SCHOOL_SUBJECTS.find(
      (s: any) =>
        s.name.toLowerCase() === subLower ||
        s.shortName.toLowerCase() === subLower ||
        subLower.includes(s.shortName.toLowerCase()) ||
        s.code === subjectName,
    );

    if (!stdConfig) {
      if (subLower.includes("chem"))
        stdConfig = STANDARD_SCHOOL_SUBJECTS.find((s: any) => s.code === "043");
      else if (subLower.includes("math"))
        stdConfig = STANDARD_SCHOOL_SUBJECTS.find((s: any) => s.code === "041");
      else if (
        subLower.includes("comp") ||
        subLower.includes("cs") ||
        subLower.includes("python")
      )
        stdConfig = STANDARD_SCHOOL_SUBJECTS.find((s: any) => s.code === "083");
      else if (subLower.includes("eng"))
        stdConfig = STANDARD_SCHOOL_SUBJECTS.find((s: any) => s.code === "301");
      else if (subLower.includes("bio"))
        stdConfig = STANDARD_SCHOOL_SUBJECTS.find((s: any) => s.code === "044");
      else stdConfig = STANDARD_SCHOOL_SUBJECTS[0]; // Physics
    }

    const config = stdConfig || STANDARD_SCHOOL_SUBJECTS[0];
    const standardCode = config.code;

    // 3. Update global active student attendance state only if active student is enrolled

    // 4. Update Daily Class Reports
    setDailyClassReports((prev: any) => {
      // Find section from className if available, usually format "Class 11 A"
      let parsedClass = className;
      let parsedSection = "A";
      const parts = className.split(" ");
      if (parts.length > 2) {
        parsedSection = parts.pop() || "A";
        parsedClass = parts.join(" ");
      }

      const total = records.length;
      const present = records.filter((r) => r.status === "Present").length;
      const absent = records.filter((r) => r.status === "Absent").length;

      const existingIndex = prev.findIndex(
        (r) =>
          r.date === date &&
          r.className === parsedClass &&
          r.section === parsedSection,
      );
      const newReport = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `DCR-${Date.now()}`,
        date,
        className: parsedClass,
        section: parsedSection,
        stream: "General",
        totalStudents: total,
        presentStudents: present,
        absentStudents: absent,
        attendancePercentage: total > 0 ? (present / total) * 100 : 0,
        facultiesPresentCount: 1,
        facultiesPresentNames: ["System"],
        submittedByTeacherName: "System",
        submissionTime: new Date().toLocaleTimeString(),
      };

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = newReport;
        return next;
      }
      return [newReport, ...prev];
    });

    if (targetStudentRec && isEnrolledActive) {
      setAttendance((prev: any) => {
        let found = false;
        const updated = prev.map((a) => {
          if (
            a.subjectCode === standardCode ||
            a.subjectName
              .toLowerCase()
              .includes(config.shortName.toLowerCase()) ||
            a.subjectName.toLowerCase().includes(subLower.split(" ")[0])
          ) {
            found = true;
            const existingLogs = a.logs || [];
            const existingLogIndex = existingLogs.findIndex(
              (l: any) => l.date === date,
            );

            let newLogs: typeof existingLogs;
            if (existingLogIndex >= 0) {
              newLogs = existingLogs.map((l: any, idx: any) =>
                idx === existingLogIndex
                  ? {
                      ...l,
                      status: activeStudentStatus,
                      topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
                    }
                  : l,
              );
            } else {
              const newLog = {
                id: `att_${standardCode}_${date}_${Date.now()}`,
                date,
                time: config.time,
                status: activeStudentStatus,
                topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
              };
              newLogs = [newLog, ...existingLogs];
            }

            newLogs.sort(
              (x: any, y: any) => new Date(y.date).getTime() - new Date(x.date).getTime(),
            );

            const markedLogs = newLogs.filter(
              (l: any) =>
                l.status === "Present" ||
                l.status === "Absent" ||
                l.status === "Leave",
            );
            const totalClasses = markedLogs.length;
            const attendedClasses = markedLogs.filter(
              (l: any) => l.status === "Present",
            ).length;
            const absentClasses = markedLogs.filter(
              (l: any) => l.status === "Absent",
            ).length;
            const leaveClasses = markedLogs.filter(
              (l: any) => l.status === "Leave",
            ).length;
            const pendingClasses = newLogs.filter(
              (l: any) => l.status === "Pending",
            ).length;
            const percentage =
              totalClasses > 0
                ? Number(((attendedClasses / totalClasses) * 100).toFixed(1))
                : 100;

            return {
              ...a,
              subjectCode: config.code,
              subjectName: config.name,
              facultyName: config.faculty,
              totalClasses,
              attendedClasses,
              absentClasses,
              leaveClasses,
              pendingClasses,
              percentage,
              logs: newLogs,
            };
          }
          return a;
        });

        if (!found) {
          const isMarked = activeStudentStatus !== "Pending";
          const newRecord: AttendanceRecord = {
            subjectCode: config.code,
            subjectName: config.name,
            facultyName: config.faculty,
            totalClasses: isMarked ? 1 : 0,
            attendedClasses: activeStudentStatus === "Present" ? 1 : 0,
            absentClasses: activeStudentStatus === "Absent" ? 1 : 0,
            leaveClasses: activeStudentStatus === "Leave" ? 1 : 0,
            pendingClasses: activeStudentStatus === "Pending" ? 1 : 0,
            percentage:
              activeStudentStatus === "Present"
                ? 100
                : activeStudentStatus === "Pending"
                  ? 100
                  : 0,
            category: config.category,
            logs: [
              {
                id: `att_${standardCode}_${date}_${Date.now()}`,
                date,
                time: config.time,
                status: activeStudentStatus,
                topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
              },
            ],
          };
          return sanitizeSchoolAttendance(
            [...prev, newRecord],
            activeStudentProfile,
          );
        }

        return sanitizeSchoolAttendance(updated, activeStudentProfile);
      });
    }

    // 4. Update multi-student attendance records map state and localStorage
    setStudentAttendanceMap((prevMap) => {
      const stuMap: Record<string, AttendanceRecord[]> = { ...prevMap };

      records.forEach((rec) => {
        const currentStudent = students.find(
          (s: any) => s.studentId === rec.studentId || s.id === rec.studentId,
        );
        // Only mark attendance if student is enrolled in this subject!
        if (
          currentStudent &&
          (!isStudentEnrolledInSubject(
            currentStudent,
            config.name,
            currentStudent.className,
          ) ||
            !isStudentEnrolledInSubject(
              currentStudent,
              config.code,
              currentStudent.className,
            ))
        ) {
          return;
        }

        const currentStuRecords =
          stuMap[rec.studentId] ||
          DEFAULT_STUDENTS_ATTENDANCE_MAP[rec.studentId] ||
          createFreshStudentAttendance(currentStudent);
        let foundSub = false;
        const updatedStuRecords = currentStuRecords.map((a) => {
          if (
            a.subjectCode === standardCode ||
            a.subjectName
              .toLowerCase()
              .includes(config.shortName.toLowerCase()) ||
            a.subjectName.toLowerCase().includes(subLower.split(" ")[0])
          ) {
            foundSub = true;
            const existingLogs = a.logs || [];
            const existingLogIndex = existingLogs.findIndex(
              (l: any) => l.date === date,
            );
            let newLogs: typeof existingLogs;

            if (existingLogIndex >= 0) {
              newLogs = existingLogs.map((l: any, idx: any) =>
                idx === existingLogIndex
                  ? {
                      ...l,
                      status: rec.status,
                      topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
                    }
                  : l,
              );
            } else {
              newLogs = [
                {
                  id: `att_${standardCode}_${date}_${Date.now()}`,
                  date,
                  time: config.time,
                  status: rec.status,
                  topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
                },
                ...existingLogs,
              ];
            }

            const markedLogs = newLogs.filter(
              (l: any) =>
                l.status === "Present" ||
                l.status === "Absent" ||
                l.status === "Leave",
            );
            const totalClasses = markedLogs.length;
            const attendedClasses = markedLogs.filter(
              (l: any) => l.status === "Present",
            ).length;
            const absentClasses = markedLogs.filter(
              (l: any) => l.status === "Absent",
            ).length;
            const leaveClasses = markedLogs.filter(
              (l: any) => l.status === "Leave",
            ).length;
            const pendingClasses = newLogs.filter(
              (l: any) => l.status === "Pending",
            ).length;
            const percentage =
              totalClasses > 0
                ? Number(((attendedClasses / totalClasses) * 100).toFixed(1))
                : 0;

            return {
              ...a,
              totalClasses,
              attendedClasses,
              absentClasses,
              leaveClasses,
              pendingClasses,
              percentage,
              logs: newLogs,
            };
          }
          return a;
        });

        if (!foundSub) {
          const isMarked = rec.status !== "Pending";
          const newRecord: AttendanceRecord = {
            subjectCode: config.code,
            subjectName: config.name,
            facultyName: config.faculty,
            totalClasses: isMarked ? 1 : 0,
            attendedClasses: rec.status === "Present" ? 1 : 0,
            absentClasses: rec.status === "Absent" ? 1 : 0,
            leaveClasses: rec.status === "Leave" ? 1 : 0,
            pendingClasses: rec.status === "Pending" ? 1 : 0,
            percentage: rec.status === "Present" ? 100 : 0,
            category: config.category,
            logs: [
              {
                id: `att_${standardCode}_${date}_${Date.now()}`,
                date,
                time: config.time,
                status: rec.status,
                topic: `Class ${className} Lecture - Period Marked by ${config.faculty}`,
              },
            ],
          };
          stuMap[rec.studentId] = sanitizeSchoolAttendance(
            [...currentStuRecords, newRecord],
            currentStudent,
          );
        } else {
          stuMap[rec.studentId] = sanitizeSchoolAttendance(
            updatedStuRecords,
            currentStudent,
          );
        }
      });

      try {
        localStorage.setItem(
          "edux_student_attendance_map",
          JSON.stringify(stuMap),
        );
      } catch {}

      if (stuMap[activeStudentId]) {
        setAttendance(stuMap[activeStudentId]);
      }

      return stuMap;
    });

    // Send broadcast notification
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;
    const pendingCount = records.filter((r) => r.status === "Pending").length;
    const totalCount = records.length;
    const pct =
      totalCount > 0
        ? Number(((presentCount / totalCount) * 100).toFixed(1))
        : 0;

    const absentStudents = records
      .filter((r) => r.status === "Absent")
      .map((r) => {
        const stu = students.find(
          (s: any) => s.id === r.studentId || (s as any).studentId === r.studentId,
        );
        return { roll: stu?.rollNo || 0, name: stu?.name || r.studentId };
      });

    // Send batch payload directly to Google Cloud Firestore & Cloud Database
    const cloudStudentLogs = records.map((r) => {
      const stu = students.find(
        (s: any) => s.id === r.studentId || (s as any).studentId === r.studentId,
      );
      return {
        id: `LOG-${r.studentId}-${date}-${(config.name || "Sub").replace(/\s+/g, "")}`,
        studentId: r.studentId,
        studentName: stu?.name || r.studentId,
        rollNo: stu?.rollNo || 0,
        className: stu?.className || className,
        subjectName: config.name,
        status: r.status,
        date,
        markedByTeacherName: config.faculty,
      };
    });

    saveAttendanceToCloud(
      {
        id: `DCR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date,
        classId: className.toLowerCase().replace(/\s+/g, ""),
        className,
        subjectTaught: config.name,
        totalStudents: records.length,
        presentCount,
        absentCount,
        attendancePercentage: Number(
          ((presentCount / (records.length || 1)) * 100).toFixed(1),
        ),
        absentRollNos: absentStudents.map((s: any) => s.roll),
        absentStudentNames: absentStudents.map((s: any) => s.name),
        submittedByTeacherName: config.faculty,
        submittedByTeacherId: "TCH-CURRENT",
      },
      cloudStudentLogs,
    ).catch((err: any) => console.log("Cloud batch attendance sync note:", err));

    addNotification({
      title: `Attendance Recorded: ${config.name}`,
      message: `${config.faculty} updated ${className} attendance for ${date}. Present: ${presentCount}, Absent: ${absentCount}${pendingCount > 0 ? `, Pending: ${pendingCount}` : ""}. Percentage calculated dynamically from marked classes only.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const markPeriodAttendance = (
    subjectCode: string,
    subjectName: string,
    date: string,
    time: string,
    status: "Present" | "Absent" | "Leave" | "Pending",
    topic?: string,
  ) => {
    let standardCode = subjectCode;
    const subLower = (subjectName || "").toLowerCase();
    if (!standardCode) {
      if (subLower.includes("chem")) standardCode = "043";
      else if (subLower.includes("math")) standardCode = "041";
      else if (
        subLower.includes("comp") ||
        subLower.includes("cs") ||
        subLower.includes("python")
      )
        standardCode = "083";
      else if (subLower.includes("eng")) standardCode = "301";
      else if (subLower.includes("bio")) standardCode = "044";
      else standardCode = "042";
    }

    const stdConfig = STANDARD_SCHOOL_SUBJECTS.find(
      (s: any) => s.code === standardCode,
    ) || {
      code: standardCode,
      name: subjectName || "Subject",
      shortName: subjectName || "Subject",
      faculty: "Subject Teacher",
      time: time || "08:30 AM",
      category: "Core" as const,
    };

    setAttendance((prev: any) => {
      let found = false;
      const updated = prev.map((a) => {
        if (
          a.subjectCode.toLowerCase() === standardCode.toLowerCase() ||
          a.subjectName
            .toLowerCase()
            .includes(stdConfig.shortName.toLowerCase()) ||
          a.subjectName.toLowerCase().includes(subLower.split(" ")[0])
        ) {
          found = true;
          const existingLogs = a.logs || [];
          const existingLogIndex = existingLogs.findIndex(
            (l: any) => l.date === date,
          );

          let newLogs: typeof existingLogs;
          if (existingLogIndex >= 0) {
            newLogs = existingLogs.map((l: any, idx: any) =>
              idx === existingLogIndex
                ? {
                    ...l,
                    time: time || l.time,
                    status,
                    topic: topic || l.topic || `Period Marked: ${status}`,
                  }
                : l,
            );
          } else {
            const newLog = {
              id: `att_${standardCode}_${date}_${Date.now()}`,
              date,
              time: time || stdConfig.time,
              status,
              topic: topic || `Class Session - Marked ${status}`,
            };
            newLogs = [newLog, ...existingLogs];
          }

          newLogs.sort(
            (x: any, y: any) => new Date(y.date).getTime() - new Date(x.date).getTime(),
          );

          const markedLogs = newLogs.filter(
            (l: any) =>
              l.status === "Present" ||
              l.status === "Absent" ||
              l.status === "Leave",
          );
          const totalClasses = markedLogs.length;
          const attendedClasses = markedLogs.filter(
            (l: any) => l.status === "Present",
          ).length;
          const absentClasses = markedLogs.filter(
            (l: any) => l.status === "Absent",
          ).length;
          const leaveClasses = markedLogs.filter(
            (l: any) => l.status === "Leave",
          ).length;
          const pendingClasses = newLogs.filter(
            (l: any) => l.status === "Pending",
          ).length;
          const percentage =
            totalClasses > 0
              ? Number(((attendedClasses / totalClasses) * 100).toFixed(1))
              : 100;

          return {
            ...a,
            totalClasses,
            attendedClasses,
            absentClasses,
            leaveClasses,
            pendingClasses,
            percentage,
            logs: newLogs,
          };
        }
        return a;
      });

      let finalRecords: AttendanceRecord[];
      if (!found) {
        const isMarked = status !== "Pending";
        const newRecord: AttendanceRecord = {
          subjectCode: stdConfig.code,
          subjectName: stdConfig.name,
          facultyName: stdConfig.faculty,
          totalClasses: isMarked ? 1 : 0,
          attendedClasses: status === "Present" ? 1 : 0,
          absentClasses: status === "Absent" ? 1 : 0,
          leaveClasses: status === "Leave" ? 1 : 0,
          pendingClasses: status === "Pending" ? 1 : 0,
          percentage:
            status === "Present" ? 100 : status === "Pending" ? 100 : 0,
          category: stdConfig.category,
          logs: [
            {
              id: `att_${standardCode}_${date}_${Date.now()}`,
              date,
              time: time || stdConfig.time,
              status,
              topic: topic || `Class Session - Marked ${status}`,
            },
          ],
        };
        finalRecords = sanitizeSchoolAttendance([...prev, newRecord]);
      } else {
        finalRecords = sanitizeSchoolAttendance(updated);
      }

      // Sync to studentAttendanceMap for active student
      setStudentAttendanceMap((prevMap) => {
        const updatedMap = {
          ...prevMap,
          [activeStudentId]: finalRecords,
        };
        try {
          localStorage.setItem(
            "edux_student_attendance_map",
            JSON.stringify(updatedMap),
          );
        } catch {}
        return updatedMap;
      });

      return finalRecords;
    });

    // Sync to Cloud Database
    try {
      fetchWithAuth("/api/attendance/student-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: activeStudentId,
          studentName: "Student",
          rollNo: 1,
          className: "Class 10",
          section: "A",
          subjectName: stdConfig.name,
          subjectCode: stdConfig.code,
          date,
          time: time || stdConfig.time,
          status,
          topic: topic || `Lecture - ${stdConfig.name}`,
          teacherName: stdConfig.faculty,
        }),
      }).catch((e) => console.log("Cloud single attendance sync note:", e));
    } catch {}

    addNotification({
      title: `Attendance: ${stdConfig.name}`,
      message:
        status === "Pending"
          ? `Attendance for ${date} (${time}) marked as Pending (not counted in %).`
          : `Marked as ${status === "Present" ? "Present (✅)" : status === "Leave" ? "On Leave (🟡)" : "Absent (❌)"} on ${date} (${time}).`,
      category: "Academic",
      priority: "Low",
    });
  };

  const updateStudentMarksBatch = (
    className: string,
    subjectCode: string,
    subjectName: string,
    examType: string,
    marksData: {
      studentId: string;
      internalMarks: number;
      externalMarks: number;
      totalMarks: number;
      grade: string;
    }[],
  ) => {
    setStudentResultsMap((prevMap) => {
      const updatedMap: Record<string, SemesterResult[]> = { ...prevMap };

      marksData.forEach((item) => {
        const studentResList = updatedMap[item.studentId]
          ? [...updatedMap[item.studentId]]
          : [];
        let semResult = studentResList[0];

        if (!semResult) {
          semResult = {
            semester: 1,
            academicSession: "Session 2025-26",
            sgpa: 8.0,
            totalCredits: 20,
            status: "PASS",
            subjects: [],
          };
          studentResList.push(semResult);
        } else {
          semResult = { ...semResult, subjects: [...semResult.subjects] };
          studentResList[0] = semResult;
        }

        const existingSubIndex = semResult.subjects.findIndex(
          (s: any) =>
            s.subjectCode === subjectCode ||
            s.subjectName.toLowerCase() === subjectName.toLowerCase(),
        );

        const newSubjectRes: SubjectResult = {
          subjectCode: subjectCode || "042",
          subjectName: subjectName || "Subject Name",
          credits: 4,
          internalMarks: item.internalMarks,
          externalMarks: item.externalMarks,
          totalMarks: item.totalMarks,
          grade: item.grade,
          gradePoint:
            item.totalMarks >= 90
              ? 10
              : item.totalMarks >= 80
                ? 9
                : item.totalMarks >= 70
                  ? 8
                  : item.totalMarks >= 60
                    ? 7
                    : item.totalMarks >= 50
                      ? 6
                      : 5,
        };

        if (existingSubIndex >= 0) {
          semResult.subjects[existingSubIndex] = newSubjectRes;
        } else {
          semResult.subjects.push(newSubjectRes);
        }

        const totalMarksSum = semResult.subjects.reduce(
          (sum: any, s: any) => sum + (s.totalMarks || 0),
          0,
        );
        const subCount = Math.max(1, semResult.subjects.length);
        const avgPercentage = Number((totalMarksSum / subCount).toFixed(1));
        semResult.sgpa = Number((avgPercentage / 9.5).toFixed(2));
        semResult.status = semResult.subjects.some((s: any) => s.totalMarks < 33)
          ? "FAIL"
          : "PASS";

        updatedMap[item.studentId] = studentResList;
      });

      try {
        localStorage.setItem(
          "edux_student_results_map_v2",
          JSON.stringify(updatedMap),
        );
      } catch {}

      return updatedMap;
    });

    setStudents((prev: any) =>
      prev.map((stu) => {
        const markEntry = marksData.find((m: any) => m.studentId === stu.studentId);
        if (markEntry) {
          return {
            ...stu,
            overallPercentage: markEntry.totalMarks,
          };
        }
        return stu;
      }),
    );

    addNotification({
      title: `Marks & Grades Published for ${className}`,
      message: `${subjectName} (${examType}) report card grades have been updated by your subject teacher.`,
      category: "Exam",
      priority: "High",
    });
  };

  const addLmsMaterial = (
    material: Omit<LMSMaterial, "id" | "downloadCount" | "uploadedDate">,
  ) => {
    addTeacherResource({
      type: "syllabus",
      title: material.title,
      subjectCode: material.subjectCode,
      subjectName: material.subjectName,
      className: "Class 11",
      fileName: `${material.title.replace(/\s+/g, "_")}.${material.fileType || "pdf"}`,
      fileData:
        material.downloadUrl ||
        "https://stxaviersonline.edu/notes/physics_ch4.pdf",
      message: material.description || "Study material uploaded by faculty",
      uploadedBy: material.facultyName || "Faculty",
    });

    addNotification({
      title: `New Study Material Uploaded: ${material.title}`,
      message: `${material.facultyName} uploaded study notes for ${material.subjectName}. Download it now from LMS!`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const addLmsAssignment = (
    assignment: Omit<LMSAssignment, "id" | "status" | "assignedDate">,
  ) => {
    addTeacherResource({
      type: "homework",
      title: assignment.title,
      subjectCode: assignment.subjectCode,
      subjectName: assignment.subjectName,
      className: "Class 11",
      fileName: `${assignment.title.replace(/\s+/g, "_")}.pdf`,
      fileData: "data:application/pdf;base64,JVBERi0xLjQK...",
      message: assignment.instructions || "Complete homework before due date",
      uploadedBy: "Faculty",
    });

    addNotification({
      title: `New Homework Assigned: ${assignment.title}`,
      message: `${assignment.subjectName} teacher assigned new homework due on ${assignment.dueDate}. Total Marks: ${assignment.totalMarks}.`,
      category: "Academic",
      priority: "High",
    });
  };

  const resetTimetableToDefaults = () => {
    setTimetable([]);
    localStorage.setItem("edux_timetable", JSON.stringify([]));
    addNotification({
      title: "Timetable Cleared",
      message:
        "All timetable periods have been cleared. Daily periods will appear when scheduled by the Principal.",
      category: "Academic",
      priority: "Low",
    });
  };

  const addTimetableSlot = (slot: Omit<TimetableSlot, "id">) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: generateUniqueId("slot"),
    };
    setTimetable((prev: any) => sortTimetableSlots([...prev, newSlot]));

    addNotification({
      title: "Class Timetable Updated",
      message: `Teacher scheduled ${slot.subjectName} (${slot.day} • Period ${slot.periodNo || ""} at ${slot.startTime}).`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const updateTimetableSlot = (
    slotId: string,
    updated: Partial<TimetableSlot>,
  ) => {
    setTimetable((prev: any) =>
      sortTimetableSlots(
        prev.map((s: any) => (s.id === slotId ? { ...s, ...updated } : s)),
      ),
    );

    addNotification({
      title: "Timetable Period Modified",
      message: `Period schedule updated for ${updated.subjectName || "subject"} by teacher.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetable((prev: any) => prev.filter((s: any) => s.id !== slotId));
  };

  const clearDayTimetable = (
    day: TimetableSlot["day"],
    targetClass?: string,
  ) => {
    setTimetable((prev: any) => {
      let updated: TimetableSlot[];
      if (
        !targetClass ||
        targetClass === "All" ||
        targetClass === "ALL_CLASSES"
      ) {
        updated = prev.filter((s: any) => s.day !== day);
      } else {
        const targetClassLower = targetClass.toLowerCase();
        const matchedClasses = classes.filter((c) => {
          if (
            c.id.toLowerCase() === targetClassLower ||
            c.classCode.toLowerCase() === targetClassLower
          )
            return true;
          if (
            `${c.className} - ${c.section}`.toLowerCase() ===
              targetClassLower ||
            c.className.toLowerCase() === targetClassLower
          )
            return true;
          return false;
        });
        const targetCodes = new Set(
          matchedClasses.map((c) => (c.classCode || "").toLowerCase()),
        );
        const targetIds = new Set(
          matchedClasses.map((c) => (c.id || "").toLowerCase()),
        );
        const targetLabels = new Set(
          matchedClasses.map((c) =>
            `${c.className} - ${c.section}`.toLowerCase(),
          ),
        );
        targetCodes.add(targetClassLower);

        updated = prev.filter((s: any) => {
          if (s.day !== day) return true;
          const sCode = (s.classCode || "").toLowerCase();
          const sName = (s.className || "").toLowerCase();
          const isMatch =
            targetCodes.has(sCode) ||
            targetIds.has(sCode) ||
            targetLabels.has(sName);
          return !isMatch;
        });
      }
      localStorage.setItem("edux_timetable", JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `${day} Timetable Cleared`,
      message: `Cleared scheduled periods for ${day}${targetClass ? ` (${targetClass})` : ""}.`,
      category: "Academic",
      priority: "Low",
    });
  };

  const batchSetTimetable = (slots: TimetableSlot[]) => {
    const sorted = sortTimetableSlots(slots);
    setTimetable(sorted);
  };

  const addExamItem = (exam: any) => {
    const newExam: ExamScheduleItem = {
      id: generateUniqueId("exam"),
      subjectCode: exam.subjectCode || "042",
      subjectName: exam.subjectName || "School Examination",
      examType: exam.examType || "Half-Yearly",
      date: exam.date || getTodayDateString(),
      timeSlot: exam.timeSlot || "09:00 AM - 12:00 PM",
      duration: exam.duration || "3 Hours",
      roomNo: exam.roomNo || "Main Examination Hall",
      seatNo: exam.seatNo || "Room 101 - Row 2",
      totalMarks: exam.totalMarks || exam.maxMarks || 100,
      weightage: exam.weightage || "30%",
      syllabusTopics:
        exam.syllabusTopics ||
        (exam.syllabus ? [exam.syllabus] : ["Complete Unit Coverage"]),
      ...exam,
    };
    setExams((prev: any) => [...prev, newExam]);

    addNotification({
      title: `Exam Schedule Updated: ${newExam.subjectName}`,
      message: `${newExam.examType} exam scheduled for ${newExam.date} at ${newExam.timeSlot}.`,
      category: "Exam",
      priority: "High",
    });
  };

  const updateExamItem = (
    examId: string,
    updated: Partial<ExamScheduleItem>,
  ) => {
    setExams((prev: any) => {
      const newExams = prev.map((ex) =>
        ex.id === examId ? { ...ex, ...updated } : ex,
      );
      try {
        localStorage.setItem("edux_exams_v3", JSON.stringify(newExams));
      } catch {}
      return newExams;
    });
  };

  const deleteExamItem = (examId: string) => {
    setExams((prev: any) => prev.filter((ex) => ex.id !== examId));
  };

  const updateStudentProfile = (
    studentId: string,
    updatedData: Partial<StudentProfile>,
  ) => {
    let updatedStudent: StudentProfile | null = null;
    setStudents((prev: any) =>
      prev.map((stu) => {
        if (stu.studentId === studentId) {
          updatedStudent = { ...stu, ...updatedData };
          return updatedStudent;
        }
        return stu;
      }),
    );
    // Also update in DEMO_STUDENTS to keep mock data in sync if needed
    const demoIndex = DEMO_STUDENTS.findIndex((s: any) => s.studentId === studentId);
    if (demoIndex !== -1) {
      DEMO_STUDENTS[demoIndex] = {
        ...DEMO_STUDENTS[demoIndex],
        ...updatedData,
      };
    }
    // Sync to Cloud Firestore if in live mode
    if (!isMockDataEnabled() && updatedStudent) {
      saveStudentToCloud(updatedStudent).catch((err: any) =>
        console.warn("Cloud student sync notice:", err),
      );
    }
  };

  const addNewStudent = (
    newStuData: Omit<
      StudentProfile,
      | "id"
      | "overallPercentage"
      | "totalSubjects"
      | "schoolName"
      | "academicYear"
    >,
  ): StudentProfile => {
    const newStudent: StudentProfile = {
      ...newStuData,
      id: generateUniqueId("stu"),
      schoolName: "St. Xavier's Senior Secondary School",
      academicYear: "2025-2026",
      overallPercentage: 0,
      totalSubjects: 5,
    };

    setStudents((prev: any) => [newStudent, ...prev]);

    if (!DEMO_STUDENTS.some((s: any) => s.studentId === newStudent.studentId)) {
      DEMO_STUDENTS.unshift(newStudent);
    }

    if (!isMockDataEnabled()) {
      saveStudentToCloud(newStudent).catch((err: any) =>
        console.warn("Cloud student write notice:", err),
      );
    }

    // Initialize fresh empty attendance (0 classes, 0%) for this new student
    const freshAttendance = createFreshStudentAttendance();
    setStudentAttendanceMap((prev: any) => {
      const updated = { ...prev, [newStudent.studentId]: freshAttendance };
      try {
        localStorage.setItem(
          "edux_student_attendance_map",
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

    // Initialize empty marks for this new student
    setStudentResultsMap((prev: any) => {
      const updated = { ...prev, [newStudent.studentId]: [] };
      try {
        localStorage.setItem(
          "edux_student_results_map_v2",
          JSON.stringify(updated),
        );
      } catch {}
      return updated;
    });

    addNotification({
      title: `New Student Enrolled: ${newStudent.name}`,
      message: `Enrolled in ${newStudent.className} (Roll #${newStudent.rollNo}) with Student ID ${newStudent.studentId}. Attendance and Marks count fresh from 0 upon enrollment.`,
      category: "General",
      priority: "Medium",
    });

    return newStudent;
  };

  useEffect(() => {
    localStorage.setItem("edux_teachers", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem("edux_school_classes", JSON.stringify(classes));
  }, [classes]);

  const broadcastNotice = (
    targetClass: string,
    title: string,
    message: string,
    priority: "High" | "Medium" | "Low",
  ) => {
    addNotification({
      title: `[Notice for ${targetClass}] ${title}`,
      message,
      category: "General",
      priority,
    });
  };

  // ==========================================
  // PRINCIPAL & SCHOOL MANAGEMENT ACTIONS
  // ==========================================

  const updateClassCapacity = (classId: string, capacity: number) => {
    setClasses((prev: any) =>
      prev.map((c) =>
        c.id === classId ? { ...c, capacity: Math.max(1, capacity) } : c,
      ),
    );
    const target = classes.find((c) => c.id === classId);
    addNotification({
      title: `Class Capacity Updated: ${target?.className || "Class"} (${target?.section || ""})`,
      message: `Student capacity updated to ${capacity} seats by Principal Administration.`,
      category: "General",
      priority: "Low",
    });
  };

  const assignClassTeacher = (classId: string, teacherId: string) => {
    const teacherObj = teachers.find((t) => t.teacherId === teacherId);
    if (!teacherObj) return;

    let targetClassName = "";
    setClasses((prev: any) =>
      prev.map((c) => {
        if (c.id === classId) {
          targetClassName = c.className;
          return {
            ...c,
            classTeacherId: teacherId,
            classTeacherName: teacherObj.name,
          };
        }
        return c;
      }),
    );

    // Update teacher's profile class assignment
    setTeachers((prev: any) =>
      prev.map((t) => {
        if (t.teacherId === teacherId) {
          return { ...t, classTeacherOf: targetClassName || t.classTeacherOf };
        }
        return t;
      }),
    );

    // Update in DEMO_TEACHERS as well
    const foundDemo = DEMO_TEACHERS.find((t) => t.teacherId === teacherId);
    if (foundDemo && targetClassName) {
      foundDemo.classTeacherOf = targetClassName;
    }

    addNotification({
      title: `Class Teacher Assigned`,
      message: `${teacherObj.name} is now the appointed Class Teacher for ${targetClassName}.`,
      category: "General",
      priority: "Medium",
    });
  };

  const assignSubjectTeacherToClass = (
    classId: string,
    subjectCode: string,
    teacherId: string,
  ) => {
    const teacherObj = teachers.find((t) => t.teacherId === teacherId);
    if (!teacherObj) return;

    setClasses((prev: any) =>
      prev.map((c) => {
        if (c.id === classId) {
          const updatedSubjects = c.subjects.map((s: any) => {
            if (s.code === subjectCode) {
              return {
                ...s,
                teacherId: teacherObj.teacherId,
                teacherName: teacherObj.name,
              };
            }
            return s;
          });
          return { ...c, subjects: updatedSubjects };
        }
        return c;
      }),
    );

    addNotification({
      title: `Subject Teacher Assigned`,
      message: `${teacherObj.name} assigned to subject code ${subjectCode}.`,
      category: "General",
      priority: "Low",
    });
  };

  const addSubjectToClass = (
    classId: string,
    subject: SchoolClassSubjectAssignment,
  ) => {
    setClasses((prev: any) =>
      prev.map((c) => {
        if (c.id === classId) {
          const exists = c.subjects.some(
            (s: any) =>
              s.code === subject.code ||
              s.name.toLowerCase() === subject.name.toLowerCase(),
          );
          const updatedSubjects = exists
            ? c.subjects.map((s: any) =>
                s.code === subject.code ? { ...s, ...subject } : s,
              )
            : [...c.subjects, subject];
          return { ...c, subjects: updatedSubjects };
        }
        return c;
      }),
    );
    addNotification({
      title: `Subject Added: ${subject.name}`,
      message: `${subject.name} (Code: ${subject.code}) added with ${subject.periodsPerWeek} periods/week assigned to ${subject.teacherName}.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  const removeSubjectFromClass = (classId: string, subjectCode: string) => {
    setClasses((prev: any) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            subjects: c.subjects.filter((s: any) => s.code !== subjectCode),
          };
        }
        return c;
      }),
    );
    addNotification({
      title: `Subject Removed`,
      message: `Subject code ${subjectCode} has been removed from the class curriculum.`,
      category: "Academic",
      priority: "Low",
    });
  };

  const addNewSchoolClass = (
    newClassData: Omit<SchoolClassInfo, "id">,
  ): SchoolClassInfo => {
    const newClass: SchoolClassInfo = {
      ...newClassData,
      id: generateUniqueId("cls"),
    };

    setClasses((prev: any) => [...prev, newClass]);

    addNotification({
      title: `New Class Section Created: ${newClass.className} - ${newClass.section}`,
      message: `Allocated with ${newClass.capacity} seat capacity and assigned to ${newClass.classTeacherName}.`,
      category: "General",
      priority: "High",
    });

    return newClass;
  };

  const updateClassDetails = (
    classId: string,
    updated: Partial<SchoolClassInfo>,
  ) => {
    setClasses((prev: any) =>
      prev.map((c) => (c.id === classId ? { ...c, ...updated } : c)),
    );
    addNotification({
      title: `Class Details Updated`,
      message: `Class configuration & room details have been updated.`,
      category: "General",
      priority: "Low",
    });
  };

  const deleteSchoolClass = (classId: string) => {
    setClasses((prev: any) => prev.filter((c) => c.id !== classId));
    addNotification({
      title: `Class Section Removed`,
      message: `Class was removed by Principal Administration.`,
      category: "General",
      priority: "Medium",
    });
  };

  const updateTeacherAssignments = (
    teacherId: string,
    classTeacherOf: string,
    subjectsTaught: string[],
  ) => {
    let teacherName = "";
    setTeachers((prev: any) =>
      prev.map((t) => {
        if (t.teacherId === teacherId) {
          teacherName = t.name;
          return {
            ...t,
            classTeacherOf,
            subjectsTaught,
          };
        }
        return t;
      }),
    );

    // Sync DEMO_TEACHERS
    const foundDemo = DEMO_TEACHERS.find((t) => t.teacherId === teacherId);
    if (foundDemo) {
      foundDemo.classTeacherOf = classTeacherOf;
      foundDemo.subjectsTaught = subjectsTaught;
    }

    addNotification({
      title: `Teacher Assignment Updated: ${teacherName || teacherId}`,
      message: `Class Teacher responsibility set to ${classTeacherOf || "None"}. Assigned ${subjectsTaught.length} subjects.`,
      category: "General",
      priority: "Medium",
    });
  };

  const addNewTeacher = (
    teacherData: Omit<TeacherProfile, "id">,
  ): TeacherProfile => {
    const newTech: TeacherProfile = {
      ...teacherData,
      id: generateUniqueId("tch"),
    };

    setTeachers((prev: any) => [...prev, newTech]);
    DEMO_TEACHERS.push(newTech);

    if (!isMockDataEnabled()) {
      saveTeacherToCloud(newTech).catch((err: any) =>
        console.warn("Cloud teacher write notice:", err),
      );
    }

    addNotification({
      title: `New Faculty Appointed: ${newTech.name}`,
      message: `Appointed as ${newTech.designation} (${newTech.department}).`,
      category: "General",
      priority: "High",
    });

    return newTech;
  };

  const transferStudentClass = (
    studentId: string,
    newClassName: string,
    newSection?: string,
  ) => {
    let studentName = "";
    setStudents((prev: any) =>
      prev.map((s: any) => {
        if (s.studentId === studentId) {
          studentName = s.name;
          return {
            ...s,
            className: newClassName,
            section: newSection || s.section,
          };
        }
        return s;
      }),
    );

    addNotification({
      title: `Student Class Transfer: ${studentName}`,
      message: `Transferred to ${newClassName} ${newSection ? `(${newSection})` : ""} by Principal Office.`,
      category: "General",
      priority: "Medium",
    });
  };

  const principalBroadcast = (
    targetAudience: "All" | "Teachers" | "Students" | "Class 11" | "Class 12",
    title: string,
    message: string,
    priority: "High" | "Medium" | "Low",
  ) => {
    addNotification({
      title: `[Principal Circular to ${targetAudience}] ${title}`,
      message,
      category: "General",
      priority,
    });
  };

  // ----------------------------------------------------
  // PRINCIPAL TIMETABLE MASTER ACTIONS (LIVE AUTO-SYNC)
  // ----------------------------------------------------

  const principalAddTimetableSlot = (
    slot: Omit<TimetableSlot, "id">,
    broadcastNotice = true,
  ) => {
    // Check if combined with multiple sections
    const isCombined = Boolean(slot.isCombined);
    const combinedWithList = Array.isArray(slot.combinedWith)
      ? slot.combinedWith
      : [];

    // If combined with other specific sections or general grade sections
    let slotsToAdd: TimetableSlot[] = [];

    if (isCombined && combinedWithList.length > 0) {
      // Find all target classes matching the selected sections
      const targetSections = classes.filter(
        (c) =>
          combinedWithList.includes(c.id) ||
          combinedWithList.includes(c.classCode) ||
          combinedWithList.includes(`${c.className} - ${c.section}`) ||
          combinedWithList.includes(c.section) ||
          combinedWithList.includes(c.className),
      );

      if (targetSections.length > 0) {
        // Create a slot for each matching section
        const sharedCombinedTag =
          slot.combinedTag || "Combined Multi-Section Lecture";
        const allSectionNames = targetSections
          .map((c) => `${c.className} - ${c.section}`)
          .join(", ");

        targetSections.forEach((c) => {
          slotsToAdd.push({
            ...slot,
            id: generateUniqueId("slot"),
            classCode: c.classCode,
            className: `${c.className} - ${c.section}`,
            isCombined: true,
            combinedTag: sharedCombinedTag,
            combinedWith: targetSections.map((t) => t.id),
          });
        });
      }
    }

    if (slotsToAdd.length === 0) {
      slotsToAdd.push({
        ...slot,
        id: generateUniqueId("slot"),
      });
    }

    setTimetable((prev: any) => {
      const updated = sortTimetableSlots([...prev, ...slotsToAdd]);
      localStorage.setItem("edux_timetable", JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `[Principal Timetable Update] ${slot.className || "Class"} ${slot.day}`,
      message: `Principal scheduled Period ${slot.periodNo || ""}: ${slot.subjectName} with ${slot.facultyName} (${slot.startTime} - ${slot.endTime}) in ${slot.roomNo}. Automatically synced to Student & Teacher portals.`,
      category: "Academic",
      priority: broadcastNotice ? "High" : "Medium",
    });
  };

  const principalUpdateTimetableSlot = (
    slotId: string,
    updated: Partial<TimetableSlot>,
    broadcastNotice = true,
  ) => {
    let affectedSubject = updated.subjectName || "";
    let affectedDay = updated.day;

    setTimetable((prev: any) => {
      const existingSlot = prev.find((s: any) => s.id === slotId);
      const isCombinedNow =
        updated.isCombined !== undefined
          ? updated.isCombined
          : existingSlot?.isCombined;
      const combinedWithList =
        updated.combinedWith || existingSlot?.combinedWith || [];

      // If updating a combined slot, synchronize attributes across all slots sharing the same day, period, and teacher/tag
      const updatedList = sortTimetableSlots(
        prev.map((s: any) => {
          if (s.id === slotId) {
            affectedSubject = updated.subjectName || s.subjectName;
            affectedDay = updated.day || s.day;
            return { ...s, ...updated };
          }
          // If sibling combined slot (same teacher, day, period and was previously combined)
          if (
            isCombinedNow &&
            existingSlot &&
            existingSlot.isCombined &&
            s.day === existingSlot.day &&
            s.periodNo === existingSlot.periodNo &&
            s.facultyName === existingSlot.facultyName &&
            (s.combinedTag === existingSlot.combinedTag ||
              (s.combinedWith && existingSlot.combinedWith))
          ) {
            return {
              ...s,
              subjectName: updated.subjectName ?? s.subjectName,
              subjectCode: updated.subjectCode ?? s.subjectCode,
              startTime: updated.startTime ?? s.startTime,
              endTime: updated.endTime ?? s.endTime,
              facultyName: updated.facultyName ?? s.facultyName,
              roomNo: updated.roomNo ?? s.roomNo,
              building: updated.building ?? s.building,
              type: updated.type ?? s.type,
              notes: updated.notes ?? s.notes,
              color: updated.color ?? s.color,
              isCombined: updated.isCombined ?? s.isCombined,
              combinedTag: updated.combinedTag ?? s.combinedTag,
              combinedWith: updated.combinedWith ?? s.combinedWith,
            };
          }
          return s;
        }),
      );
      localStorage.setItem("edux_timetable", JSON.stringify(updatedList));
      return updatedList;
    });

    addNotification({
      title: `[Principal Desk] Timetable Period Revised`,
      message: `Schedule revised for ${affectedSubject || "Class Subject"} on ${affectedDay || "Weekly Timetable"}. Live updates visible to students and faculty.`,
      category: "Academic",
      priority: broadcastNotice ? "High" : "Medium",
    });
  };

  const principalDeleteTimetableSlot = (slotId: string) => {
    let deletedInfo = "";
    setTimetable((prev: any) => {
      const target = prev.find((s: any) => s.id === slotId);
      if (target) {
        deletedInfo = `${target.subjectName} (${target.day} • Period ${target.periodNo || ""})`;
      }
      const updatedList = prev.filter((s: any) => s.id !== slotId);
      localStorage.setItem("edux_timetable", JSON.stringify(updatedList));
      return updatedList;
    });

    addNotification({
      title: `Period Removed by Principal`,
      message: `Removed slot ${deletedInfo}. Schedule synced across school portals.`,
      category: "Academic",
      priority: "Low",
    });
  };

  const principalDuplicateDaySchedule = (
    sourceDay: TimetableSlot["day"],
    targetDays: TimetableSlot["day"][],
    targetClass?: string,
  ) => {
    setTimetable((prev: any) => {
      const isAllClasses =
        !targetClass || targetClass === "All" || targetClass === "ALL_CLASSES";

      const matchedClasses = isAllClasses
        ? classes
        : classes.filter((c) => {
            if (
              c.id === targetClass ||
              c.classCode === targetClass ||
              `${c.className} - ${c.section}` === targetClass
            )
              return true;
            if (
              targetClass === "Class 11" &&
              (c.className === "Class 11" || c.classCode.startsWith("11"))
            )
              return true;
            if (
              targetClass === "Class 12" &&
              (c.className === "Class 12" || c.classCode.startsWith("12"))
            )
              return true;
            if (
              targetClass === "Class 10" &&
              (c.className === "Class 10" || c.classCode.startsWith("10"))
            )
              return true;
            if (
              targetClass === "Class 9" &&
              (c.className === "Class 9" || c.classCode.startsWith("9"))
            )
              return true;
            return false;
          });

      const targetCodes = new Set(
        matchedClasses.map((c) => (c.classCode || "").toLowerCase()),
      );
      const targetIds = new Set(
        matchedClasses.map((c) => (c.id || "").toLowerCase()),
      );
      const targetLabels = new Set(
        matchedClasses.map((c) =>
          `${c.className} - ${c.section}`.toLowerCase(),
        ),
      );
      if (targetClass && !isAllClasses) {
        targetCodes.add(targetClass.toLowerCase());
        targetLabels.add(targetClass.toLowerCase());
      }

      const matchesTargetClass = (s: TimetableSlot) => {
        if (isAllClasses) return true;
        const sCode = (s.classCode || "").toLowerCase();
        const sName = (s.className || "").toLowerCase();
        return (
          targetCodes.has(sCode) ||
          targetIds.has(sCode) ||
          targetLabels.has(sName) ||
          matchedClasses.some(
            (c) =>
              sName === c.className.toLowerCase() &&
              (sCode === c.classCode.toLowerCase() || !s.classCode),
          )
        );
      };

      const sourceSlots = prev.filter(
        (s: any) => s.day === sourceDay && matchesTargetClass(s),
      );
      if (sourceSlots.length === 0) return prev;

      const remainingSlots = prev.filter((s: any) => {
        const isTargetDay = targetDays.includes(s.day);
        const isTargetClassSlot = matchesTargetClass(s);
        return !(isTargetDay && isTargetClassSlot);
      });

      const newSlots: TimetableSlot[] = [];
      targetDays.forEach((tDay) => {
        sourceSlots.forEach((slot) => {
          newSlots.push({
            ...slot,
            id: generateUniqueId("slot"),
            day: tDay,
            isSubstitution: false,
            substituteFaculty: undefined,
          });
        });
      });

      const fullUpdated = sortTimetableSlots([...remainingSlots, ...newSlots]);
      localStorage.setItem("edux_timetable", JSON.stringify(fullUpdated));
      return fullUpdated;
    });

    addNotification({
      title: `[Principal Timetable] Day Schedule Duplicated`,
      message: `${sourceDay} schedule copied across ${targetDays.join(", ")} for ${targetClass || "All Classes"}.`,
      category: "Academic",
      priority: "High",
    });
  };

  const getTimetableConflicts = (): TimetableConflict[] => {
    return detectTimetableConflicts(timetable);
  };

  const checkTeacherAvailability = (
    teacherName: string,
    day: TimetableSlot["day"],
    periodNo: number,
    excludeSlotId?: string,
  ): {
    available: boolean;
    conflictWithClass?: string;
    conflictSubject?: string;
  } => {
    const normTarget = normalizeTeacherName(teacherName);
    if (!normTarget) return { available: true };

    const matchingSlot = timetable.find((s: any) => {
      if (excludeSlotId && s.id === excludeSlotId) return false;
      if (s.day !== day || s.periodNo !== periodNo) return false;
      const assignedTeacher = normalizeTeacherName(
        s.substituteFaculty || s.facultyName,
      );
      return assignedTeacher === normTarget;
    });

    if (matchingSlot) {
      return {
        available: false,
        conflictWithClass:
          matchingSlot.className || matchingSlot.classCode || "Another Class",
        conflictSubject: matchingSlot.subjectName,
      };
    }

    return { available: true };
  };

  const principalGenerateFullConflictFreeTimetable = (
    targetClassIds?: string[],
  ) => {
    const isTargeted = Boolean(
      targetClassIds &&
      targetClassIds.length > 0 &&
      targetClassIds.length < classes.length,
    );
    const targetClassesToUse =
      isTargeted && targetClassIds
        ? classes.filter(
            (c) =>
              targetClassIds.includes(c.id) ||
              targetClassIds.includes(c.classCode) ||
              targetClassIds.includes(c.className),
          )
        : classes;

    // If generating for specific target classes only, pass existing timetable so teachers' busy slots in other classes are preserved
    const result = generateConflictFreeWeeklyTimetable(
      targetClassesToUse,
      teachers,
      isTargeted ? timetable : undefined,
    );

    setTimetable((prev: any) => {
      let finalSlots: TimetableSlot[] = [];

      if (!isTargeted) {
        // Full school regeneration
        finalSlots = result.slots;
      } else {
        // Scoped class regeneration: strictly preserve all other classes' slots
        const targetCodes = new Set(
          targetClassesToUse.map((c) => (c.classCode || "").toLowerCase()),
        );
        const targetIds = new Set(
          targetClassesToUse.map((c) => (c.id || "").toLowerCase()),
        );
        const targetLabels = new Set(
          targetClassesToUse.map((c) =>
            `${c.className} - ${c.section}`.toLowerCase(),
          ),
        );
        const targetSections = new Set(
          targetClassesToUse.map((c) => (c.section || "").toLowerCase()),
        );

        const remaining = prev.filter((s: any) => {
          const sCode = (s.classCode || "").toLowerCase();
          const sName = (s.className || "").toLowerCase();
          if (targetCodes.has(sCode) || targetIds.has(sCode)) return false;
          if (targetLabels.has(sName)) return false;
          if (
            targetClassesToUse.some((c) => {
              const cCode = (c.classCode || "").toLowerCase();
              const cName = c.className.toLowerCase();
              const cSec = (c.section || "").toLowerCase();
              if (sName === `${cName} - ${cSec}`) return true;
              if (sCode === cCode && cCode !== "") return true;
              if (sName === cName && (!s.classCode || sCode === cCode))
                return true;
              return false;
            })
          ) {
            return false;
          }
          return true;
        });

        finalSlots = sortTimetableSlots([...remaining, ...result.slots]);
      }

      localStorage.setItem("edux_timetable", JSON.stringify(finalSlots));
      return finalSlots;
    });

    const targetDesc = isTargeted
      ? targetClassesToUse.map((c) => c.classCode || c.className).join(", ")
      : `all ${result.totalClasses} classes (9th to 12th)`;

    addNotification({
      title: `[Conflict-Free Timetable Generated]`,
      message: `Weekly timetable updated for ${targetDesc} with 0 teacher clashes (${result.totalSlots} weekly periods). Live synced to students & faculty.`,
      category: "Academic",
      priority: "High",
    });

    return {
      totalClasses: targetClassesToUse.length,
      totalSlots: result.totalSlots,
      conflictsCount: result.conflictsCount,
    };
  };

  const principalApplyClassScheduleTemplate = (
    targetClass: string,
    templateType = "CBSE_STANDARD",
  ) => {
    if (targetClass === "All" || targetClass === "ALL_CLASSES") {
      return principalGenerateFullConflictFreeTimetable();
    }

    let targetClassesToUse: SchoolClassInfo[] = [];

    if (targetClass === "Class 11" || targetClass === "11") {
      targetClassesToUse = classes.filter(
        (c) => c.className === "Class 11" || c.classCode.startsWith("11"),
      );
    } else if (targetClass === "Class 12" || targetClass === "12") {
      targetClassesToUse = classes.filter(
        (c) => c.className === "Class 12" || c.classCode.startsWith("12"),
      );
    } else if (targetClass === "Class 10" || targetClass === "10") {
      targetClassesToUse = classes.filter(
        (c) => c.className === "Class 10" || c.classCode.startsWith("10"),
      );
    } else if (targetClass === "Class 9" || targetClass === "9") {
      targetClassesToUse = classes.filter(
        (c) => c.className === "Class 9" || c.classCode.startsWith("9"),
      );
    } else {
      const match = classes.find(
        (c) =>
          c.id === targetClass ||
          c.classCode === targetClass ||
          c.className === targetClass ||
          `${c.className} - ${c.section}` === targetClass,
      );
      if (match) {
        targetClassesToUse = [match];
      }
    }

    if (targetClassesToUse.length === 0) return;

    return principalGenerateFullConflictFreeTimetable(
      targetClassesToUse.map((c) => c.id),
    );
  };

  const principalSetSlotSubstitution = (
    slotId: string,
    substituteTeacherName: string,
    reason?: string,
  ) => {
    let slotDetails = "";
    setTimetable((prev: any) => {
      const updated = prev.map((s: any) => {
        if (s.id === slotId) {
          slotDetails = `${s.subjectName} (${s.day} • Period ${s.periodNo || ""})`;
          return {
            ...s,
            isSubstitution: true,
            substituteFaculty: substituteTeacherName,
            notes: reason || "Faculty adjustment by Principal Office",
          };
        }
        return s;
      });
      localStorage.setItem("edux_timetable", JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `⚠️ Daily Faculty Substitution Notice`,
      message: `${substituteTeacherName} is appointed to take ${slotDetails}. Reason: ${reason || "Teacher Leave"}.`,
      category: "Academic",
      priority: "High",
    });
  };

  const principalClearTimetable = (
    targetClass?: string,
    targetDay?: string,
  ) => {
    setTimetable((prev: any) => {
      let updated: TimetableSlot[] = [];

      if (
        !targetClass ||
        targetClass === "ALL_CLASSES" ||
        targetClass === "All"
      ) {
        if (targetDay && targetDay !== "ALL") {
          updated = prev.filter((s: any) => s.day !== targetDay);
        } else {
          updated = [];
        }
      } else {
        const matchedClasses = classes.filter((c) => {
          if (
            c.id === targetClass ||
            c.classCode === targetClass ||
            `${c.className} - ${c.section}` === targetClass
          )
            return true;
          if (
            targetClass === "Class 11" &&
            (c.className === "Class 11" || c.classCode.startsWith("11"))
          )
            return true;
          if (
            targetClass === "Class 12" &&
            (c.className === "Class 12" || c.classCode.startsWith("12"))
          )
            return true;
          if (
            targetClass === "Class 10" &&
            (c.className === "Class 10" || c.classCode.startsWith("10"))
          )
            return true;
          if (
            targetClass === "Class 9" &&
            (c.className === "Class 9" || c.classCode.startsWith("9"))
          )
            return true;
          return false;
        });

        const targetCodes = new Set(
          matchedClasses.map((c) => (c.classCode || "").toLowerCase()),
        );
        const targetIds = new Set(
          matchedClasses.map((c) => (c.id || "").toLowerCase()),
        );
        const targetLabels = new Set(
          matchedClasses.map((c) =>
            `${c.className} - ${c.section}`.toLowerCase(),
          ),
        );
        if (targetClass) {
          targetCodes.add(targetClass.toLowerCase());
          targetLabels.add(targetClass.toLowerCase());
        }

        updated = prev.filter((slot) => {
          const sCode = (slot.classCode || "").toLowerCase();
          const sName = (slot.className || "").toLowerCase();

          const isMatch =
            targetCodes.has(sCode) ||
            targetIds.has(sCode) ||
            targetLabels.has(sName) ||
            matchedClasses.some(
              (c) =>
                sName === c.className.toLowerCase() &&
                (sCode === c.classCode.toLowerCase() || !slot.classCode),
            );

          if (isMatch) {
            if (targetDay && targetDay !== "ALL") {
              return slot.day !== targetDay;
            }
            return false;
          }
          return true;
        });
      }

      const sorted = sortTimetableSlots(updated);
      localStorage.setItem("edux_timetable", JSON.stringify(sorted));
      return sorted;
    });

    addNotification({
      title: "[Principal Desk] Timetable Cleared",
      message: `Timetable slots cleared ${targetClass && targetClass !== "ALL_CLASSES" ? `for ${targetClass}` : "for all classes"} ${targetDay && targetDay !== "ALL" ? `on ${targetDay}` : ""}.`,
      category: "Academic",
      priority: "Medium",
    });
  };

  // ----------------------------------------------------
  // PRINCIPAL FINANCIAL MODULE ACTIONS
  // ----------------------------------------------------

  const approveExpenseRequest = (id: string, remarks?: string) => {
    const today = new Date().toISOString().split("T")[0];
    let approvedItem: ExpenseApprovalRequest | undefined;

    setExpenseRequests((prev: any) =>
      prev.map((exp) => {
        if (exp.id === id) {
          approvedItem = {
            ...exp,
            status: "Approved",
            decisionDate: today,
            principalRemarks:
              remarks || "Sanctioned and approved by Principal.",
          };
          return approvedItem;
        }
        return exp;
      }),
    );

    addNotification({
      title: "Expense Sanctioned",
      message: `Bill "${approvedItem?.title || id}" for ₹${approvedItem?.amount.toLocaleString() || ""} has been approved.`,
      category: "General",
      priority: "Low",
    });
  };

  const rejectExpenseRequest = (id: string, remarks?: string) => {
    const today = new Date().toISOString().split("T")[0];
    let rejectedItem: ExpenseApprovalRequest | undefined;

    setExpenseRequests((prev: any) =>
      prev.map((exp) => {
        if (exp.id === id) {
          rejectedItem = {
            ...exp,
            status: "Rejected",
            decisionDate: today,
            principalRemarks:
              remarks || "Declined / Deferred by Principal Office.",
          };
          return rejectedItem;
        }
        return exp;
      }),
    );

    addNotification({
      title: "Expense Request Rejected",
      message: `Bill "${rejectedItem?.title || id}" has been declined by Principal.`,
      category: "General",
      priority: "Medium",
    });
  };

  const addExpenseRequest = (
    req: Omit<ExpenseApprovalRequest, "id" | "submissionDate" | "status">,
  ) => {
    const newReq: ExpenseApprovalRequest = {
      ...req,
      id: `EXP-${Date.now().toString().slice(-6)}`,
      submissionDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setExpenseRequests((prev: any) => [newReq, ...prev]);

    addNotification({
      title: "New Expense Bill Logged",
      message: `New bill "${req.title}" for ₹${req.amount.toLocaleString()} logged for administrative review.`,
      category: "General",
      priority: "Medium",
    });
  };

  const sendDefaulterReminder = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    let studentName = "";
    let dueAmt = 0;

    setFeeDefaulters((prev: any) =>
      prev.map((def) => {
        if (def.id === id) {
          studentName = def.name;
          dueAmt = def.dueAmount;
          return {
            ...def,
            remindersCount: def.remindersCount + 1,
            lastReminderSent: today,
            status: "Notice Sent",
          };
        }
        return def;
      }),
    );

    addNotification({
      title: `Fee Due Notice Sent: ${studentName}`,
      message: `SMS & Official Email reminder dispatched to guardian for overdue fee of ₹${dueAmt.toLocaleString()}.`,
      category: "Fee",
      priority: "High",
    });
  };

  const resolveDefaulter = (id: string) => {
    let studentName = "";
    setFeeDefaulters((prev: any) =>
      prev.map((def) => {
        if (def.id === id) {
          studentName = def.name;
          return {
            ...def,
            dueAmount: 0,
            status: "Resolved",
          };
        }
        return def;
      }),
    );

    addNotification({
      title: `Fee Cleared: ${studentName}`,
      message: `Outstanding dues marked as reconciled and resolved.`,
      category: "Fee",
      priority: "Low",
    });
  };

  const addSchoolFeeTransaction = (txn: Omit<SchoolFeeTransaction, "id">) => {
    const newTxn: SchoolFeeTransaction = {
      ...txn,
      id: `TXN-${Date.now().toString().slice(-6)}`,
    };

    setSchoolFeeTransactions((prev: any) => [newTxn, ...prev]);

    // Also update class summary collected
    setSchoolFeeSummary((prev: any) =>
      prev.map((cls) => {
        if (
          cls.className.toLowerCase().includes(txn.className.toLowerCase()) ||
          txn.className.includes(cls.className)
        ) {
          const newCollected = cls.collectedAmount + txn.amount;
          const newPending = Math.max(0, cls.totalAnnualFee - newCollected);
          const newRate = Number(
            ((newCollected / cls.totalAnnualFee) * 100).toFixed(1),
          );
          return {
            ...cls,
            collectedAmount: newCollected,
            pendingAmount: newPending,
            collectionRate: newRate,
          };
        }
        return cls;
      }),
    );

    addNotification({
      title: "Fee Payment Received",
      message: `₹${txn.amount.toLocaleString()} received from ${txn.studentName} (${txn.className}) via ${txn.paymentMethod}.`,
      category: "Fee",
      priority: "Low",
    });
  };

  // ----------------------------------------------------
  // PRINCIPAL STAFF ATTENDANCE & LEAVE ACTIONS
  // ----------------------------------------------------

  const updateStaffAttendanceStatus = (
    logId: string,
    status: "Present" | "Late" | "Absent" | "On Leave",
    remarks?: string,
  ) => {
    setStaffAttendanceLogs((prev: any) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status,
              remarks: remarks !== undefined ? remarks : log.remarks,
              checkInTime:
                status === "Present" && !log.checkInTime
                  ? "07:45 AM"
                  : status === "Late" && !log.checkInTime
                    ? "08:15 AM"
                    : log.checkInTime,
            }
          : log,
      ),
    );
  };

  const markAllStaffPresent = (date: string) => {
    setStaffAttendanceLogs((prev: any) =>
      prev.map((log) => ({
        ...log,
        date,
        status: log.status === "On Leave" ? "On Leave" : "Present",
        checkInTime: log.checkInTime || "07:45 AM",
        remarks:
          log.status === "On Leave"
            ? log.remarks
            : "Verified present by Principal Desk",
      })),
    );

    addNotification({
      title: "Staff Register Verified",
      message: `All faculty members marked Present for ${date}.`,
      category: "General",
      priority: "Low",
    });
  };

  const approveStaffLeave = (leaveId: string, remarks?: string) => {
    const today = new Date().toISOString().split("T")[0];
    let teacherName = "";
    let leaveType = "";

    setStaffLeaves((prev: any) =>
      prev.map((lv) => {
        if (lv.id === leaveId) {
          teacherName = lv.teacherName;
          leaveType = lv.leaveType;
          return {
            ...lv,
            status: "Approved",
            decisionDate: today,
            principalRemarks: remarks || "Leave sanctioned by Principal.",
          };
        }
        return lv;
      }),
    );

    addNotification({
      title: `Staff Leave Approved: ${teacherName}`,
      message: `${leaveType} application approved with substitute arrangement acknowledged.`,
      category: "General",
      priority: "Low",
    });
  };

  const rejectStaffLeave = (leaveId: string, remarks?: string) => {
    const today = new Date().toISOString().split("T")[0];
    let teacherName = "";

    setStaffLeaves((prev: any) =>
      prev.map((lv) => {
        if (lv.id === leaveId) {
          teacherName = lv.teacherName;
          return {
            ...lv,
            status: "Rejected",
            decisionDate: today,
            principalRemarks:
              remarks ||
              "Leave request declined due to institutional exigency.",
          };
        }
        return lv;
      }),
    );

    addNotification({
      title: `Staff Leave Declined: ${teacherName}`,
      message: `Leave application was declined by Principal.`,
      category: "General",
      priority: "Medium",
    });
  };

  const submitStaffLeave = (
    leave: Omit<
      StaffLeaveApplication,
      "id" | "applicationNo" | "status" | "appliedDate"
    >,
  ) => {
    const newLeave: StaffLeaveApplication = {
      ...leave,
      id: `LV-${Date.now().toString().slice(-6)}`,
      applicationNo: `LV/26-27/${Math.floor(100 + Math.random() * 900)}`,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setStaffLeaves((prev: any) => [newLeave, ...prev]);

    addNotification({
      title: "Staff Leave Application Submitted",
      message: `Leave request for ${leave.teacherName} (${leave.totalDays} Days) registered for Principal sanction.`,
      category: "General",
      priority: "Medium",
    });
  };

  // ----------------------------------------------------
  // PRINCIPAL ACADEMIC PERFORMANCE ACTIONS
  // ----------------------------------------------------

  const updateAcademicExamAnalytics = (examName: string) => {
    setAcademicAnalytics((prev: any) => ({
      ...prev,
      examName,
    }));
  };

  // ----------------------------------------------------
  // SUPER ADMIN / MULTI-TENANT PLATFORM ACTIONS
  // ----------------------------------------------------

  const registerSchoolTenant = (
    schoolData: Omit<
      SchoolTenant,
      "id" | "code" | "joinedDate" | "storageUsedGb"
    >,
  ): SchoolTenant => {
    const nextIndex = schoolTenants.length + 1;
    const code = `SCH-${String(nextIndex).padStart(3, "0")}`;
    const newSchool: SchoolTenant = {
      ...schoolData,
      id: generateUniqueId("sch"),
      code,
      joinedDate: new Date().toISOString().split("T")[0],
      storageUsedGb: 2.5,
    };

    setSchoolTenants((prev: any) => [newSchool, ...prev]);

    // Also provision a default principal profile in globalUsers for this new school
    const principalGlobalUser: GlobalUserProfile = {
      id: generateUniqueId("usr_prn"),
      userType: "principal",
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      name: newSchool.principalName,
      email: newSchool.principalEmail,
      phone: newSchool.principalPhone,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      designation: "Principal & Head of Institution",
      department: "Executive Administration",
      accountStatus: "Active",
      lastLogin: "Never",
      rolePermissions: [
        "ALL_INSTITUTION_ACCESS",
        "BUDGET_APPROVER",
        "FACULTY_MANAGEMENT",
      ],
      is2FAEnabled: true,
      technicalNotes: `Initial principal account for ${newSchool.name} (${newSchool.affiliation}).`,
      dateCreated: new Date().toISOString().split("T")[0],
    };
    setGlobalUsers((prev: any) => [principalGlobalUser, ...prev]);

    // Generate initial subscription invoice
    const newInvoice: PlatformBillingInvoice = {
      id: generateUniqueId("inv"),
      invoiceNumber: `INV-EDX-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      plan: newSchool.plan,
      amount:
        newSchool.mrrAmount * (newSchool.billingCycle === "Annual" ? 12 : 1),
      taxAmount:
        newSchool.mrrAmount *
        (newSchool.billingCycle === "Annual" ? 12 : 1) *
        0.18,
      totalAmount:
        newSchool.mrrAmount *
        (newSchool.billingCycle === "Annual" ? 12 : 1) *
        1.18,
      currency: "INR",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Pending",
      paymentMethod: "NEFT / RTGS",
      billingContact: newSchool.contactEmail,
    };
    setPlatformInvoices((prev: any) => [newInvoice, ...prev]);

    // Update summary metrics
    setPlatformMetrics((prev: any) => ({
      ...prev,
      totalSchools: prev.totalSchools + 1,
      activeSchools:
        newSchool.status === "Active"
          ? prev.activeSchools + 1
          : prev.activeSchools,
      totalStudentsNetwork:
        prev.totalStudentsNetwork + newSchool.studentsEnrolled,
      totalMonthlyRevenue: prev.totalMonthlyRevenue + newSchool.mrrAmount,
      totalAnnualRunRate: (prev.totalMonthlyRevenue + newSchool.mrrAmount) * 12,
    }));

    addNotification({
      title: "New School Tenant Registered",
      message: `${newSchool.name} (${newSchool.affiliation}) registered with ${newSchool.plan} plan.`,
      category: "General",
      priority: "High",
    });

    return newSchool;
  };

  const updateSchoolTenant = (id: string, updates: Partial<SchoolTenant>) => {
    setSchoolTenants((prev: any) =>
      prev.map((s: any) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const deleteSchoolTenant = (id: string) => {
    const target = schoolTenants.find((s: any) => s.id === id);
    if (!target) return;

    setSchoolTenants((prev: any) => prev.filter((s: any) => s.id !== id));
    setGlobalUsers((prev: any) => prev.filter((u) => u.schoolId !== id));

    setPlatformMetrics((prev: any) => ({
      ...prev,
      totalSchools: Math.max(0, prev.totalSchools - 1),
      activeSchools:
        target.status === "Active"
          ? Math.max(0, prev.activeSchools - 1)
          : prev.activeSchools,
      totalStudentsNetwork: Math.max(
        0,
        prev.totalStudentsNetwork - target.studentsEnrolled,
      ),
      totalMonthlyRevenue: Math.max(
        0,
        prev.totalMonthlyRevenue - target.mrrAmount,
      ),
      totalAnnualRunRate: Math.max(
        0,
        (prev.totalMonthlyRevenue - target.mrrAmount) * 12,
      ),
    }));
  };

  const toggleSchoolTenantStatus = (
    id: string,
    status: SchoolTenant["status"],
  ) => {
    setSchoolTenants((prev: any) =>
      prev.map((s: any) => (s.id === id ? { ...s, status } : s)),
    );
  };

  const updateSchoolSubscriptionPlan = (
    id: string,
    plan: SchoolTenant["plan"],
    cycle: SchoolTenant["billingCycle"],
    capacity: number,
  ) => {
    const mrrRate =
      plan === "Enterprise" ? 125000 : plan === "Growth" ? 75000 : 45000;
    setSchoolTenants((prev: any) =>
      prev.map((s: any) =>
        s.id === id
          ? {
              ...s,
              plan,
              billingCycle: cycle,
              studentCapacity: capacity,
              mrrAmount: mrrRate,
            }
          : s,
      ),
    );
  };

  const updateGlobalUser = (
    id: string,
    updates: Partial<GlobalUserProfile>,
  ) => {
    setGlobalUsers((prev: any) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    );
  };

  const resetGlobalUserPassword = (id: string, customPass?: string): string => {
    const tempPass =
      customPass ||
      `EduX#${Math.random().toString(36).substring(2, 6).toUpperCase()}!26`;
    setGlobalUsers((prev: any) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              temporaryPassword: tempPass,
              accountStatus:
                u.accountStatus === "Locked" ? "Active" : u.accountStatus,
              is2FAEnabled: false, // Reset 2FA if locked out
            }
          : u,
      ),
    );
    return tempPass;
  };

  const toggleGlobalUserAccountStatus = (
    id: string,
    status: GlobalUserProfile["accountStatus"],
  ) => {
    setGlobalUsers((prev: any) =>
      prev.map((u) => (u.id === id ? { ...u, accountStatus: status } : u)),
    );
  };

  const addGlobalUser = (
    userData: Omit<GlobalUserProfile, "id" | "dateCreated">,
  ): GlobalUserProfile => {
    const newUser: GlobalUserProfile = {
      ...userData,
      id: generateUniqueId("usr_global"),
      dateCreated: new Date().toISOString().split("T")[0],
    };
    setGlobalUsers((prev: any) => [newUser, ...prev]);
    return newUser;
  };

  const createSupportTicket = (
    ticketData: Omit<
      SupportTicket,
      "id" | "ticketNumber" | "createdAt" | "updatedAt" | "replies"
    >,
  ): SupportTicket => {
    const ticketNumber = `TICK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleString();
    const newTicket: SupportTicket = {
      ...ticketData,
      id: generateUniqueId("tkt"),
      ticketNumber,
      createdAt: nowStr,
      updatedAt: nowStr,
      replies: [
        {
          id: generateUniqueId("rep"),
          senderId: "requester",
          senderName: ticketData.requesterName,
          senderRole: ticketData.requesterRole as any,
          message: ticketData.description,
          timestamp: nowStr,
          isInternalNote: false,
        },
      ],
    };

    setSupportTickets((prev: any) => [newTicket, ...prev]);
    setPlatformMetrics((prev: any) => ({
      ...prev,
      openSupportTickets: prev.openSupportTickets + 1,
      criticalTickets:
        ticketData.priority === "Critical"
          ? prev.criticalTickets + 1
          : prev.criticalTickets,
    }));

    return newTicket;
  };

  const addSupportTicketReply = (
    ticketId: string,
    message: string,
    isInternal: boolean = false,
    senderName: string = "Alex Vance",
    senderRole: any = "Super Admin",
  ) => {
    const nowStr = new Date().toLocaleString();
    const newReply: SupportTicketReply = {
      id: generateUniqueId("rep"),
      senderId: "sa_master_01",
      senderName,
      senderRole,
      message,
      timestamp: nowStr,
      isInternalNote: isInternal,
    };

    setSupportTickets((prev: any) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: nowStr,
              replies: [...t.replies, newReply],
            }
          : t,
      ),
    );
  };

  const updateSupportTicketStatus = (
    ticketId: string,
    status: SupportTicket["status"],
    assignedAdmin?: string,
  ) => {
    const nowStr = new Date().toLocaleString();
    setSupportTickets((prev: any) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              assignedAdmin: assignedAdmin || t.assignedAdmin,
              updatedAt: nowStr,
            }
          : t,
      ),
    );
  };

  const resolveSupportTicketWithOverride = (
    ticketId: string,
    resolutionNote: string,
    overrideAction?: string,
    overrideDetails?: string,
  ) => {
    const nowStr = new Date().toLocaleString();
    setSupportTickets((prev: any) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "Resolved",
            updatedAt: nowStr,
            resolutionNotes: resolutionNote,
            overrideApplied: overrideAction
              ? {
                  action: overrideAction,
                  appliedBy: "Alex Vance (Super Admin)",
                  timestamp: nowStr,
                  details:
                    overrideDetails || "Executed via Platform Master Control",
                }
              : t.overrideApplied,
          };
        }
        return t;
      }),
    );

    setPlatformMetrics((prev: any) => ({
      ...prev,
      openSupportTickets: Math.max(0, prev.openSupportTickets - 1),
    }));
  };

  const triggerPlatformOverride = (
    schoolId: string,
    actionType: string,
    payload: any,
  ) => {
    const nowStr = new Date().toLocaleString();
    if (actionType === "BUMP_STUDENT_CAPACITY") {
      const added = payload.amount || 200;
      setSchoolTenants((prev: any) =>
        prev.map((s: any) =>
          s.id === schoolId
            ? { ...s, studentCapacity: s.studentCapacity + added }
            : s,
        ),
      );
    } else if (actionType === "TOGGLE_FEATURE_MODULE") {
      const moduleName = payload.module;
      setSchoolTenants((prev: any) =>
        prev.map((s: any) => {
          if (s.id === schoolId) {
            const hasModule = s.featuresEnabled.includes(moduleName);
            return {
              ...s,
              featuresEnabled: hasModule
                ? s.featuresEnabled.filter((m: any) => m !== moduleName)
                : [...s.featuresEnabled, moduleName],
            };
          }
          return s;
        }),
      );
    } else if (actionType === "PURGE_REDIS_CACHE") {
      // simulate cache purge
    }

    addNotification({
      title: "Platform Override Executed",
      message: `Action [${actionType}] executed for school tenant ${schoolId} at ${nowStr}.`,
      category: "General",
      priority: "High",
    });
  };

  return (
    <ERPContext.Provider
      value={{
        syncWithCloud,
        feeNotices,
        dispatchFeeNotice,
        acknowledgeFeeNotice,
        feeRoster,
        addStudentToFeeRoster,
        removeStudentFromFeeRoster,
        updateStudentFeeInRoster,
        feeRequests,
        submitFeeRequest,
        approveFeeRequest,
        studentInstallments,
        bursarMessages,
        sendBursarMessage,
        markBursarMessagesAsRead,
        students,
        teachers,
        classes,
        studentLeaves,
        applyForLeave,
        updateStudentLeaveStatus,
        attendance,
        studentAttendanceMap,
        getStudentAttendance,
        getStudentAttendanceSummary,
        timetable,
        exams,
        results,
        studentResultsMap,
        getStudentResults,
        feeSummary,
        feeBreakdown,
        feeTransactions,
        hostelComplaints,
        documents,
        notifications,
        feedbacks,
        calendarEvents,
        mentorLogs,
        schoolFeeSummary,
        schoolFeeTransactions,
        feeDefaulters,
        expenseRequests,
        staffAttendanceLogs,
        staffLeaves,
        staffMonthlyTrends,
        academicAnalytics,
        dailyClassReports,
        submitDailyClassReport,
        deleteDailyClassReport,
        acknowledgeDailyClassReport,
        activeTeacherClass,
        setActiveTeacherClass,
        teacherActiveSubTab,
        setTeacherActiveSubTab,
        switchTeacherClassAndAction,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        submitAssignment,
        // double export removed
        payFee,
        applyBusPass,
        submitHostelComplaint,
        requestDocument,
        submitFeedback,
        addMentorLog,
        incrementMaterialDownload,
        resetAttendanceToDefaults,
        resetAllStudentAttendance,
        resetTimetableToDefaults,
        markPeriodAttendance,
        updateStudentProfile,
        addNewStudent,
        updateStudentAttendanceBatch,
        updateStudentMarksBatch,
        addLmsMaterial,
        addLmsAssignment,
        gradeAssignment,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        clearDayTimetable,
        batchSetTimetable,
        addExamItem,
        updateExamItem,
        deleteExamItem,
        broadcastNotice,
        updateClassCapacity,
        assignClassTeacher,
        assignSubjectTeacherToClass,
        addSubjectToClass,
        removeSubjectFromClass,
        addNewSchoolClass,
        updateClassDetails,
        deleteSchoolClass,
        updateTeacherAssignments,
        addNewTeacher,
        transferStudentClass,
        principalBroadcast,
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
        approveExpenseRequest,
        rejectExpenseRequest,
        addExpenseRequest,
        sendDefaulterReminder,
        resolveDefaulter,
        addSchoolFeeTransaction,
        updateStaffAttendanceStatus,
        markAllStaffPresent,
        approveStaffLeave,
        rejectStaffLeave,
        submitStaffLeave,
        updateAcademicExamAnalytics,
        schoolTenants,
        globalUsers,
        platformInvoices,
        supportTickets,
        platformMetrics,
        registerSchoolTenant,
        updateSchoolTenant,
        deleteSchoolTenant,
        toggleSchoolTenantStatus,
        updateSchoolSubscriptionPlan,
        updateGlobalUser,
        resetGlobalUserPassword,
        toggleGlobalUserAccountStatus,
        addGlobalUser,
        createSupportTicket,
        addSupportTicketReply,
        updateSupportTicketStatus,
        resolveSupportTicketWithOverride,
        teacherResources,
        addTeacherResource,
        deleteTeacherResource,
        triggerPlatformOverride,
        isMockData,
        dataMode,
        toggleDataMode,
        setDataMode,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error("useERP must be used within an ERPProvider");
  }
  return context;
};

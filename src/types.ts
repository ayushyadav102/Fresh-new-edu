export type UserRole = 'student' | 'teacher' | 'principal' | 'admin' | 'faculty' | 'superadmin';
export type TeacherClassCode = '9' | '10' | '11' | '12';

export interface SuperAdminProfile {
  id: string;
  adminId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'superadmin';
  title: string; // e.g. "Platform Architect & Lead Super Admin"
  roleTitle?: string;
  securityClearance: 'Level 5 (Full Master Access)' | 'Level 4 (Regional Operator)';
  twoFactorActive: boolean;
  lastLogin: string;
  ipAddress: string;
}

export interface SchoolTenant {
  id: string;
  code: string; // e.g. "SCH-001"
  name: string;
  slug: string; // e.g. "stxaviers"
  logo?: string;
  affiliation: 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'Cambridge';
  affiliationNumber: string;
  city: string;
  state: string;
  country: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  status: 'Active' | 'Trial' | 'Provisioning' | 'Suspended';
  plan: 'Starter' | 'Growth' | 'Enterprise';
  billingCycle: 'Monthly' | 'Quarterly' | 'Annual';
  subscriptionExpiry: string;
  studentsEnrolled: number;
  studentCapacity: number;
  teachersCount: number;
  classesCount: number;
  mrrAmount: number; // in INR e.g. 45000
  currency: string;
  joinedDate: string;
  featuresEnabled: string[]; // e.g. ["Live Attendance", "Fee Ledger", "CBSE Analytics", "LMS Portal", "Bus Tracker", "Hostel Module"]
  databaseCluster: string;
  customDomain?: string;
  autoBackup: boolean;
  storageUsedGb: number;
  storageLimitGb: number;
}

export interface GlobalUserProfile {
  id: string;
  userType: 'principal' | 'teacher' | 'admin';
  schoolId: string;
  schoolName: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  designation: string;
  department?: string;
  assignedClasses?: string[];
  accountStatus: 'Active' | 'Suspended' | 'Locked' | 'Pending Verification';
  lastLogin: string;
  rolePermissions: string[];
  is2FAEnabled: boolean;
  temporaryPassword?: string;
  technicalNotes?: string;
  dateCreated: string;
}

export interface PlatformBillingInvoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  paymentMethod?: 'NEFT / RTGS' | 'Corporate Card' | 'Auto-Debit NetBanking' | 'UPI Gateway';
  transactionRef?: string;
  billingContact: string;
}

export interface SupportTicketReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'Super Admin' | 'Principal' | 'Teacher' | 'Tech Support L2';
  message: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. "TICK-2026-892"
  schoolId: string;
  schoolName: string;
  requesterName: string;
  requesterRole: 'Principal' | 'Teacher' | 'School Admin' | 'IT Incharge';
  requesterEmail: string;
  requesterPhone: string;
  title: string;
  category: 'Account & 2FA Reset' | 'Student Capacity Bump' | 'Data Migration & Sync' | 'Billing & Subscription' | 'Grade Calculation & CBSE' | 'Timetable Conflict' | 'Custom Feature & Domain';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | 'Closed';
  createdAt: string;
  updatedAt: string;
  assignedAdmin: string;
  description: string;
  replies: SupportTicketReply[];
  resolutionNotes?: string;
  overrideApplied?: {
    action: string;
    appliedBy: string;
    timestamp: string;
    details: string;
  };
}

export interface PlatformMetricsSummary {
  totalSchools: number;
  activeSchools: number;
  trialSchools: number;
  provisioningSchools: number;
  totalStudentsNetwork: number;
  totalTeachersNetwork: number;
  totalMonthlyRevenue: number;
  totalAnnualRunRate: number;
  platformUptime: number; // e.g. 99.98%
  activeSessionsNow: number;
  apiRequests24h: number;
  storageConsumedGb: number;
  storageAllocatedGb: number;
  openSupportTickets: number;
  criticalTickets: number;
}


export interface PrincipalProfile {
  id: string;
  principalId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  designation: string; // e.g. "Principal & Director of Academics"
  schoolName: string;
  qualification: string;
  experienceYears: number;
  officeRoom: string;
}

export interface SchoolClassSubjectAssignment {
  code: string;
  name: string;
  teacherId: string;
  teacherName: string;
  periodsPerWeek: number;
}

export interface SchoolClassInfo {
  id: string;
  classCode: string; // e.g. "11-A", "11-B", "12-A", "12-B", "10-A"
  className: string; // "Class 11" | "Class 12" | "Class 10" | "Class 9"
  section: string; // "Section A" | "Section B" | "Section C"
  stream: string; // "Science (PCM)", "Science (PCB)", "Commerce", "Humanities", "General"
  roomNo: string; // "Room 101"
  building: string; // "Senior Science Wing"
  capacity: number; // e.g. 40
  classTeacherId: string; // "TCH001"
  classTeacherName: string; // "Mr. Rajesh Sharma"
  academicYear: string; // "2026-2027"
  subjects: SchoolClassSubjectAssignment[];
}

export interface TeacherScheduleSlot {
  id: string;
  periodNo: number;
  timeSlot: string; // e.g. "08:30 AM - 09:20 AM"
  startTime: string;
  endTime: string;
  className: 'Class 11' | 'Class 12';
  section?: string;
  classCode: TeacherClassCode; // "11" | "12"
  subject: string;
  topic?: string;
  roomNo: string;
  building?: string;
  activityType: 'Lecture' | 'Lab' | 'Practical' | 'Tutorial' | 'Doubt Desk';
}

export interface TeacherProfile {
  id: string;
  teacherId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  designation: string; // e.g. "PGT Physics"
  department: string;  // e.g. "Science Department"
  classTeacherOf: string; // e.g. "Class 11" or "Class 12"
  subjectsTaught: string[]; // e.g. ["Physics", "Practical Physics"]
  qualification: string;
  roomNo: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  schoolName: string;
  className: string; // "Class 11" | "Class 12"
  section?: string;  // Optional legacy
  rollNo: string;    // "01" .. "20"
  stream: string;    // "Science (PCM)", "Science (PCB)", "Commerce"
  fatherName: string;
  motherName: string;
  parentPhone: string;
  bloodGroup: string;
  dob: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  admissionDate?: string;
  admissionNumber?: string;
  feeStatus?: 'Paid' | 'Pending';
  paidFeeAmount?: number;
  pendingFeeAmount?: number;
  totalFeeAmount?: number;
  previousFeeAmount?: number;
  academicYear: string;
  overallPercentage: number;
  totalSubjects: number;
  // Keep legacy fields compatible
  department?: string;
  program?: string;
  semester?: number;
  batch?: string;
  cgpa?: number;
  totalCredits?: number;
  mentor?: {
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    office: string;
  };
  hostel?: {
    block: string;
    roomNo: string;
    bedNo: string;
    wardenName: string;
    wardenPhone: string;
    messGroup: string;
  };
  busPass?: {
    passId: string;
    routeNo: string;
    routeName: string;
    busStop: string;
    validTill: string;
    status: 'Active' | 'Expired' | 'Pending';
  };
}

export interface AttendanceRecord {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  leaveClasses?: number;
  pendingClasses?: number;
  percentage: number;
  category: 'Core' | 'Elective' | 'Lab';
  logs: {
    id: string;
    date: string;
    time: string;
    status: 'Present' | 'Absent' | 'Leave' | 'Pending';
    topic: string;
  }[];
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subjectCode: string;
  subjectName: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Activity' | 'Break' | 'No Class' | 'Holiday';
  startTime: string; // e.g., "08:30 AM"
  endTime: string;   // e.g., "09:20 AM"
  facultyName: string;
  roomNo: string;
  building: string;
  color?: string;
  periodNo?: number;
  className?: string;
  classCode?: string;
  topic?: string;
  substituteFaculty?: string;
  isSubstitution?: boolean;
  isCombined?: boolean;
  combinedTag?: string;
  combinedWith?: string[];
  notes?: string;
}

export interface LMSMaterial {
  id: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  module: string;
  fileType: 'pdf' | 'doc' | 'video' | 'slides' | 'zip' | 'code';
  fileSize: string;
  uploadedDate: string;
  facultyName: string;
  downloadUrl?: string;
  description: string;
  downloadCount: number;
  previewUrl?: string;
  topics?: string[];
  unitNo?: number;
}

export interface LMSVideoLecture {
  id: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  topic: string;
  module: string;
  duration: string;
  facultyName: string;
  uploadedDate: string;
  viewsCount: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  summary: string;
}

export interface LMSSyllabusModule {
  moduleNo: number;
  title: string;
  hours: number;
  description: string;
  topics: string[];
  isCompleted?: boolean;
}

export interface LMSSubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: string; // e.g. "Sem - 5", "Term 1"
  type: 'Theory' | 'Practical' | 'Project' | 'Core' | 'Elective';
  facultyName: string;
  facultyEmail?: string;
  facultyPhone?: string;
  credits: number;
  roomNo?: string;
  building?: string;
  syllabusProgress: number; // e.g. 75%
  totalMaterials: number;
  totalAssignments: number;
  totalVideos: number;
  modules: LMSSyllabusModule[];
}

export interface LMSAssignment {
  id: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  status: 'Pending' | 'Submitted' | 'Graded';
  obtainedMarks?: number;
  submissionDate?: string;
  fileSubmitted?: string;
  instructions: string;
}

export interface ExamScheduleItem {
  id: string;
  title: string;
  type: 'class_test' | 'practical' | 'board_term' | 'Mid-Term' | 'End-Term' | 'Quiz';
  code: string;
  marks: number;
  date: string;
  time: string;
  room: string;
  teacher?: string; // used for class_test/practical
  invigilator?: string; // used for board_term
  status: 'pending_approval' | 'scheduled' | 'locked' | 'ratified';
  targetClass?: string;
  createdBy?: string;
  
  // Legacy fields to prevent breaking existing types if any
  subjectCode?: string;
  subjectName?: string;
  examType?: string;
  timeSlot?: string;
  duration?: string;
  roomNo?: string;
  seatNo?: string;
  totalMarks?: number;
  weightage?: string;
  questions?: any[];
  formLink?: string;
  syllabusTopics?: string[];
  instructions?: string;
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number; // Max 40
  externalMarks: number; // Max 60
  totalMarks: number;    // Max 100
  grade: string;         // e.g., "A+", "A", "B+"
  gradePoint: number;    // e.g., 10, 9, 8
}

export interface SemesterResult {
  semester: number;
  academicSession: string;
  sgpa: number;
  totalCredits: number;
  status: 'PASS' | 'PROMOTED' | 'FAIL';
  subjects: SubjectResult[];
}

export interface FeeBreakdownItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Cash';
  status: 'Success' | 'Processing' | 'Failed';
}

export interface HostelComplaint {
  id: string;
  category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Cleanliness' | 'Internet' | 'Other';
  description: string;
  dateSubmitted: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
}

export interface AcademicDocument {
  id: string;
  title: string;
  type: 'Bonafide Certificate' | 'Grade Sheet' | 'Character Certificate' | 'Migration Certificate' | 'ID Card' | 'Provisional Degree' | 'School Leaving Certificate';
  issueDate: string;
  status: 'Available' | 'Requested' | 'Processing';
  fileSize?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Exam' | 'Fee' | 'Academic' | 'General';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface FeedbackSubmission {
  id: string;
  category: 'Subject & Faculty' | 'Administrative Staff' | 'Campus Infrastructure' | 'Hostel & Mess' | 'Library & Labs';
  targetName?: string; // e.g. Faculty name or Dept
  rating: number; // 1 - 5
  feedbackText: string;
  isAnonymous: boolean;
  submittedAt: string;
  status: 'Pending' | 'Under Review' | 'Resolved';
  adminResponse?: string;
}

export interface AcademicCalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Holiday' | 'Exam' | 'Fee Due' | 'Sports & Fest' | 'Academic Milestone';
  description: string;
  isImportant?: boolean;
}

export interface MentorLog {
  id: string;
  date: string;
  topic: string;
  summary: string;
  actionItems: string;
  mentorName: string;
  status: 'Completed' | 'Follow-up Needed';
}

// ----------------------------------------------------
// PRINCIPAL MODULES: FINANCIALS, STAFF & ACADEMICS
// ----------------------------------------------------

export interface SchoolFeeClassSummary {
  classCode: string;
  className: string;
  section: string;
  stream: string;
  totalStudents: number;
  totalAnnualFee: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number; // e.g. 88.5
  defaultersCount: number;
}

export interface SchoolFeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  className: string;
  rollNo: string;
  amount: number;
  category: 'Tuition Fee' | 'Laboratory Fee' | 'Examination Fee' | 'Library & Sports' | 'Transport & Bus' | 'Annual Composite';
  date: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Demand Draft';
  status: 'Success' | 'Processing' | 'Failed';
  transactionRef: string;
}

export interface FeeDefaulterRecord {
  id: string;
  studentId: string;
  name: string;
  className: string;
  rollNo: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  dueAmount: number;
  dueSince: string;
  overdueDays: number;
  lastReminderSent?: string;
  remindersCount: number;
  status: 'Pending' | 'Notice Sent' | 'Follow-up Scheduled' | 'Resolved';
}

export interface ExpenseApprovalRequest {
  id: string;
  billNumber: string;
  title: string;
  category: 'Laboratory & Equipment' | 'Sports & Events' | 'IT Infrastructure & Software' | 'Library & CBSE Books' | 'Campus Maintenance & Utilities' | 'Academic Printing & Stationary' | 'Staff Welfare';
  amount: number;
  submittedBy: string;
  department: string;
  submissionDate: string;
  vendorName: string;
  invoiceUrl?: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decisionDate?: string;
  principalRemarks?: string;
  priority: 'Urgent' | 'Standard' | 'Low';
}

export interface StaffDailyAttendanceLog {
  id: string;
  teacherId: string;
  teacherName: string;
  designation: string;
  department: string;
  avatar: string;
  date: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
  checkInTime?: string;
  checkOutTime?: string;
  gateLocation?: string;
  substitutionAssigned?: string;
  remarks?: string;
}

export interface StaffLeaveApplication {
  id: string;
  applicationNo: string;
  teacherId: string;
  teacherName: string;
  designation: string;
  department: string;
  avatar: string;
  leaveType: 'Casual Leave (CL)' | 'Medical Leave (ML)' | 'Earned Leave (EL)' | 'Duty Leave (Conference/CBSE)' | 'Special Maternity/Paternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decisionDate?: string;
  principalRemarks?: string;
}

export interface StaffMonthlyTrend {
  month: string;
  shortMonth: string;
  attendanceRate: number; // e.g. 96.2%
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  lateArrivals: number;
}

export interface GradeDistributionItem {
  grade: 'A1 (91-100%)' | 'A2 (81-90%)' | 'B1 (71-80%)' | 'B2 (61-70%)' | 'C1 (51-60%)' | 'C2 (41-50%)' | 'D (33-40%)' | 'E (<33%)';
  shortGrade: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StudentTopperItem {
  rank: number;
  studentId: string;
  name: string;
  className: string;
  section: string;
  stream: string;
  rollNo: string;
  percentage: number;
  totalScore: string; // e.g. "488/500"
  bestSubject: string;
  bestSubjectScore: number;
  avatar: string;
  badgeTitle: string;
}

export interface SubjectPerformanceReport {
  subjectCode: string;
  subjectName: string;
  shortName: string;
  facultyName: string;
  totalAppeared: number;
  passedCount: number;
  passPercentage: number;
  classAverage: number;
  highestMarks: number;
  lowestMarks: number;
  distinctionCount: number; // 75%+
}

export interface AcademicExamAnalytics {
  examName: string;
  academicYear: string;
  totalStudents: number;
  overallPassPercentage: number;
  schoolAveragePercentage: number;
  classSummaries: {
    className: string;
    stream: string;
    appeared: number;
    passed: number;
    passPercentage: number;
    averageMarks: number;
    highestMarks: number;
  }[];
  gradeDistribution: GradeDistributionItem[];
  topPerformers: StudentTopperItem[];
  subjectReports: SubjectPerformanceReport[];
}

export interface ClassStudentAttendanceDetail {
  studentId: string;
  name: string;
  rollNo: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Medical Leave';
  inTime?: string;
  parentPhone?: string;
  fatherName?: string;
  overallPercentage?: number;
}

export interface DailyClassAttendanceReport {
  id: string;
  date: string;
  className: string;
  section: string;
  stream: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
  facultiesPresentCount: number;
  facultiesPresentNames: string[];
  submittedByTeacherName: string;
  teacherId?: string;
  teacherSelfStatus?: 'Present' | 'Absent' | 'On Duty' | 'Substituted';
  periodTaught?: string;
  subjectTaught?: string;
  submissionTime: string;
  remarks?: string;
  studentsDetail?: ClassStudentAttendanceDetail[];
  status?: 'Submitted' | 'Verified by Principal' | 'Action Flagged';
  principalAcknowledgedAt?: string;
  principalNotes?: string;
}




export interface HomeworkSubmission {
  studentId: string;
  studentName: string;
  fileName: string;
  fileData?: string;
  submittedAt: string;
  marks?: string | number;
  status: 'Submitted' | 'Graded';
  remark?: string;
}
export interface TeacherResource {
  id: string;
  type: 'syllabus' | 'homework';
  title: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  fileName: string;
  fileData: string;
  message?: string;
  uploadDate: string;
  uploadedBy: string;
  teacherId?: string;
  dueDate?: string;
  dueLabel?: string;
  maxMarks?: number | string;
  fileSize?: string;
  category?: string;
  readCount?: number;
  totalStudents?: number;
  submissions?: HomeworkSubmission[];
}

export interface ChatMessage {
  id: string;
  classCode?: TeacherClassCode | string;
  className?: string;
  section?: string;
  channel?: 'main' | 'lab' | 'announcements';
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'faculty';
  rollNumber?: string;
  avatarText: string;
  avatarBg: string;
  timestamp: string;
  createdAt?: number;
  text: string;
  isFaculty?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachmentType?: 'image' | 'pdf' | 'video' | 'derivation_note' | 'faculty_video' | 'audio_note' | 'none';
  attachmentData?: any;
  reactions?: {
    helpful?: number;
    thankYou?: number;
    thumbsUp?: number;
    userReacted?: { [key: string]: boolean };
  };
  verifiedByTeacher?: boolean;
}

export interface FeeNotice {
  id: string;
  studentName: string;
  amount: string;
  date: string;
  isAcknowledged: boolean;
}

export interface StudentLeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNo?: string;
  className: string;
  section: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  documentUrl?: string;
  documentName?: string;
  documentSize?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

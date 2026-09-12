const fs = require('fs');

const erpPath = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(erpPath, 'utf8');

const typesToImport = [
  'AttendanceRecord', 'SemesterResult', 'SubjectResult', 'LMSMaterial', 'LMSAssignment', 'TimetableSlot', 
  'ExamScheduleItem', 'StudentProfile', 'SchoolClassSubjectAssignment', 'SchoolClassInfo', 'TeacherProfile', 
  'ExpenseApprovalRequest', 'SchoolFeeTransaction', 'StaffLeaveApplication', 'SchoolTenant', 'GlobalUserProfile', 
  'PlatformBillingInvoice', 'SupportTicket', 'SupportTicketReply', 'TeacherResource', 'FeeNotice', 'StudentLeaveRequest',
  'FeeDefaulterRecord', 'StaffDailyAttendanceLog', 'StaffMonthlyTrend', 'AcademicExamAnalytics', 'SchoolFeeClassSummary',
  'HostelComplaint', 'AcademicDocument', 'NotificationItem', 'FeedbackSubmission', 'DailyClassAttendanceReport'
];

const mockDataImports = [
  'INITIAL_ATTENDANCE', 'INITIAL_TIMETABLE', 'INITIAL_LMS_MATERIALS', 'INITIAL_LMS_ASSIGNMENTS', 
  'INITIAL_FEES', 'INITIAL_HOSTEL_COMPLAINTS', 'INITIAL_DOCUMENTS', 'INITIAL_NOTIFICATIONS', 
  'INITIAL_FEEDBACKS', 'INITIAL_DAILY_CLASS_REPORTS'
];

const principalDataImports = [
  'INITIAL_SCHOOL_FEE_SUMMARY', 'INITIAL_SCHOOL_FEE_TRANSACTIONS', 'INITIAL_FEE_DEFAULTERS', 
  'INITIAL_EXPENSE_REQUESTS', 'INITIAL_STAFF_ATTENDANCE', 'INITIAL_STAFF_LEAVES', 
  'INITIAL_STAFF_MONTHLY_TRENDS', 'INITIAL_ACADEMIC_ANALYTICS'
];

// we need to add the types import
const typeImportStr = `import { ${typesToImport.join(', ')} } from '../types';\n`;
const mockDataImportStr = `import { ${mockDataImports.join(', ')} } from '../data/mockData';\n`;
const principalDataImportStr = `import { ${principalDataImports.join(', ')} } from '../data/principalModulesData';\n`;

// insert after first line
const lines = content.split('\n');
lines.splice(1, 0, typeImportStr, mockDataImportStr, principalDataImportStr);

fs.writeFileSync(erpPath, lines.join('\n'));
